import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAdminStore = create((set, get) => ({
  stats:    null,
  designs:  [],
  orders:   [],
  settings: {},
  loading:  false,
  _channels: [],

  initAdmin: async () => {
    set({ loading: true })
    await Promise.all([
      get().fetchStats(),
      get().fetchDesigns(),
      get().fetchOrders(),
      get().fetchSettings(),
    ])
    get().subscribeRealtime()
    set({ loading: false })
  },

  fetchStats: async () => {
    try {
      const [designsRes, ordersRes, profilesRes] = await Promise.all([
        supabase.from('designs').select('id, featured, visibility'),
        supabase.from('orders').select('id, total_price, quantity, created_at, status'),
        supabase.from('profiles').select('id, role'),
      ])

      const orders   = ordersRes.data   || []
      const designs  = designsRes.data  || []
      const profiles = profilesRes.data || []

      const totalRevenue = orders.reduce((s, o) => s + (parseFloat(o.total_price) || 0), 0)
      const totalSold    = orders.reduce((s, o) => s + (o.quantity || 1), 0)

      const now      = Date.now()
      const dayMs    = 86400000
      const todayMs  = now - (now % dayMs)
      const weekMs   = todayMs - 6 * dayMs
      const monthMs  = todayMs - 29 * dayMs

      const inRange  = (ms) => orders.filter(o => new Date(o.created_at).getTime() >= ms)
      const rev      = (arr) => arr.reduce((s, o) => s + (parseFloat(o.total_price) || 0), 0)

      set({
        stats: {
          totalRevenue,
          totalSold,
          totalOrders:     orders.length,
          totalDesigns:    designs.length,
          totalUsers:      profiles.filter(p => p.role === 'user').length,
          pendingOrders:   orders.filter(o => o.status === 'pending').length,
          shippedOrders:   orders.filter(o => ['shipped','delivered'].includes(o.status)).length,
          featuredDesigns: designs.filter(d => d.featured).length,
          publicDesigns:   designs.filter(d => d.visibility === 'public').length,
          todayOrders:     inRange(todayMs).length,
          todayRevenue:    rev(inRange(todayMs)),
          weekOrders:      inRange(weekMs).length,
          weekRevenue:     rev(inRange(weekMs)),
          monthOrders:     inRange(monthMs).length,
          monthRevenue:    rev(inRange(monthMs)),
        },
      })
    } catch (e) { console.error(e) }
  },

  fetchDesigns: async () => {
    try {
      const [designsRes, likesRes] = await Promise.all([
        supabase.from('designs').select('*').order('created_at', { ascending: false }),
        supabase.from('likes').select('design_id'),
      ])
      const counts = {}
      ;(likesRes.data || []).forEach(l => { counts[l.design_id] = (counts[l.design_id] || 0) + 1 })
      set({ designs: (designsRes.data || []).map(d => ({ ...d, likes: counts[d.id] || 0 })) })
    } catch (e) { console.error(e) }
  },

  fetchOrders: async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*, designs(name, image)')
        .order('created_at', { ascending: false })
        .limit(100)
      set({ orders: data || [] })
    } catch (e) { console.error(e) }
  },

  fetchSettings: async () => {
    try {
      const { data } = await supabase.from('platform_settings').select('*')
      const s = {}
      ;(data || []).forEach(r => { s[r.key] = r.value })
      set({ settings: s })
    } catch (e) { console.error(e) }
  },

  updateSetting: async (key, value) => {
    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })
    if (!error) set(s => ({ settings: { ...s.settings, [key]: value } }))
    return error
  },

  updateDesign: async (id, updates) => {
    const { data, error } = await supabase
      .from('designs').update(updates).eq('id', id).select().single()
    if (!error)
      set(s => ({ designs: s.designs.map(d => d.id === id ? { ...d, ...data } : d) }))
    return { data, error }
  },

  deleteDesign: async (id) => {
    const { error } = await supabase.from('designs').delete().eq('id', id)
    if (!error) set(s => ({ designs: s.designs.filter(d => d.id !== id) }))
    return error
  },

  updateOrderStatus: async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (!error)
      set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, status } : o) }))
    return error
  },

  subscribeRealtime: () => {
    const ch1 = supabase
      .channel('mob-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        get().fetchStats()
        get().fetchOrders()
      })
      .subscribe()

    const ch2 = supabase
      .channel('mob-designs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'designs' }, () => {
        get().fetchDesigns()
      })
      .subscribe()

    set({ _channels: [ch1, ch2] })
  },

  unsubscribe: () => {
    get()._channels.forEach(ch => supabase.removeChannel(ch))
    set({ _channels: [] })
  },
}))
