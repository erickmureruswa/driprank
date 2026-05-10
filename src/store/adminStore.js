import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { invalidateWhatsAppCache } from '../utils/whatsapp'

const groupByDay = (rows, dateField, valueField) => {
  const map = {}
  rows.forEach(r => {
    const day = new Date(r[dateField]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    map[day] = (map[day] || 0) + (r[valueField] || 0)
  })
  return Object.entries(map).map(([date, value]) => ({ date, value: parseFloat(value.toFixed(2)) }))
}

export const useAdminStore = create((set, get) => ({
  stats:      null,
  designs:    [],
  orders:     [],
  settings:   {},
  analytics:  null,
  loading:    false,
  error:      null,
  _channels:  [],

  // ── Init ──────────────────────────────────────
  initAdmin: async () => {
    set({ loading: true })
    await Promise.all([
      get().fetchStats(),
      get().fetchDesigns(),
      get().fetchOrders(),
      get().fetchSettings(),
      get().fetchAnalytics(),
    ])
    get().subscribeRealtime()
    set({ loading: false })
  },

  // ── Stats ─────────────────────────────────────
  fetchStats: async () => {
    if (!supabase) return
    try {
      const [designsRes, ordersRes, profilesRes] = await Promise.all([
        supabase.from('designs').select('id, price, orders, all_time_orders, featured, visibility'),
        supabase.from('orders').select('id, total_price, quantity, created_at, status'),
        supabase.from('profiles').select('id, created_at, role'),
      ])

      const designs  = designsRes.data  || []
      const orders   = ordersRes.data   || []
      const profiles = profilesRes.data || []

      const totalRevenue   = orders.reduce((s, o) => s + (parseFloat(o.total_price) || 0), 0)
      const totalSold      = orders.reduce((s, o) => s + (o.quantity || 1), 0)
      const pendingOrders  = orders.filter(o => o.status === 'pending').length
      const shippedOrders  = orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length

      const now       = new Date()
      const todayMs   = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const weekMs    = todayMs - 6 * 86400000
      const monthMs   = todayMs - 29 * 86400000

      const filter = (ms) => orders.filter(o => new Date(o.created_at).getTime() >= ms)
      const rev    = (arr) => arr.reduce((s, o) => s + (parseFloat(o.total_price) || 0), 0)

      set({
        stats: {
          totalRevenue,
          totalSold,
          totalDesigns:   designs.length,
          totalUsers:     profiles.filter(p => p.role === 'user').length,
          totalOrders:    orders.length,
          pendingOrders,
          shippedOrders,
          featuredDesigns: designs.filter(d => d.featured).length,
          publicDesigns:   designs.filter(d => d.visibility === 'public').length,
          todayOrders:     filter(todayMs).length,
          todayRevenue:    rev(filter(todayMs)),
          weekOrders:      filter(weekMs).length,
          weekRevenue:     rev(filter(weekMs)),
          monthOrders:     filter(monthMs).length,
          monthRevenue:    rev(filter(monthMs)),
        },
      })
    } catch (e) { set({ error: e.message }) }
  },

  // ── Designs ───────────────────────────────────
  fetchDesigns: async () => {
    if (!supabase) return
    try {
      const [designsRes, likesRes] = await Promise.all([
        supabase.from('designs').select('*').order('created_at', { ascending: false }),
        supabase.from('likes').select('design_id'),
      ])

      const likeCounts = {}
      ;(likesRes.data || []).forEach(l => {
        likeCounts[l.design_id] = (likeCounts[l.design_id] || 0) + 1
      })

      set({
        designs: (designsRes.data || []).map(d => ({
          ...d,
          likes: likeCounts[d.id] || 0,
        })),
      })
    } catch (e) { set({ error: e.message }) }
  },

  addDesign: async (data) => {
    if (!supabase) return { error: 'Supabase not ready' }
    const { data: row, error } = await supabase
      .from('designs').insert([data]).select().single()
    if (!error) set(s => ({ designs: [{ ...row, likes: 0 }, ...s.designs] }))
    return { data: row, error }
  },

  updateDesign: async (id, updates) => {
    if (!supabase) return { error: 'Supabase not ready' }
    const { data: row, error } = await supabase
      .from('designs').update(updates).eq('id', id).select().single()
    if (!error)
      set(s => ({ designs: s.designs.map(d => d.id === id ? { ...d, ...row } : d) }))
    return { data: row, error }
  },

  deleteDesign: async (id) => {
    if (!supabase) return 'Supabase not ready'
    const { error } = await supabase.from('designs').delete().eq('id', id)
    if (!error) set(s => ({ designs: s.designs.filter(d => d.id !== id) }))
    return error
  },

  // ── Orders ────────────────────────────────────
  fetchOrders: async () => {
    if (!supabase) return
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, designs(name, image)')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      set({ orders: data || [] })
    } catch (e) { set({ error: e.message }) }
  },

  updateOrderStatus: async (id, status) => {
    if (!supabase) return
    const { error } = await supabase
      .from('orders').update({ status }).eq('id', id)
    if (!error)
      set(s => ({ orders: s.orders.map(o => o.id === id ? { ...o, status } : o) }))
    return error
  },

  // ── Settings ──────────────────────────────────
  fetchSettings: async () => {
    if (!supabase) return
    try {
      const { data, error } = await supabase
        .from('platform_settings').select('*')
      if (error) throw error
      const settings = {}
      ;(data || []).forEach(s => { settings[s.key] = s.value })
      set({ settings })
    } catch (e) { set({ error: e.message }) }
  },

  updateSetting: async (key, value) => {
    if (!supabase) return 'Supabase not ready'
    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })
    if (!error) {
      set(s => ({ settings: { ...s.settings, [key]: value } }))
      if (key === 'whatsapp_number') invalidateWhatsAppCache()
    }
    return error
  },

  // ── Analytics ─────────────────────────────────
  fetchAnalytics: async () => {
    if (!supabase) return
    try {
      const thirtyAgo = new Date()
      thirtyAgo.setDate(thirtyAgo.getDate() - 30)

      const [ordersRes, topDesignsRes, likesRes] = await Promise.all([
        supabase.from('orders')
          .select('total_price, quantity, created_at, design_id')
          .gte('created_at', thirtyAgo.toISOString())
          .order('created_at', { ascending: true }),
        supabase.from('designs')
          .select('id, name, all_time_orders, weekly_orders, views, price, image')
          .order('all_time_orders', { ascending: false })
          .limit(10),
        supabase.from('likes').select('design_id'),
      ])

      const orders      = ordersRes.data || []
      const revenueData = groupByDay(orders, 'created_at', 'total_price')
      const salesData   = groupByDay(orders, 'created_at', 'quantity')

      // Like counts per design
      const likeCounts = {}
      ;(likesRes.data || []).forEach(l => {
        likeCounts[l.design_id] = (likeCounts[l.design_id] || 0) + 1
      })

      const topDesigns = (topDesignsRes.data || []).map(d => ({
        ...d,
        likes: likeCounts[d.id] || 0,
        revenue: (d.all_time_orders || 0) * (parseFloat(d.price) || 25),
      }))

      set({ analytics: { revenueData, salesData, topDesigns } })
    } catch (e) { set({ error: e.message }) }
  },

  // ── Realtime ──────────────────────────────────
  subscribeRealtime: () => {
    if (!supabase) return

    const ordersChannel = supabase
      .channel('admin-orders-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        get().fetchStats()
        get().fetchOrders()
        get().fetchAnalytics()
      })
      .subscribe()

    const designsChannel = supabase
      .channel('admin-designs-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'designs' }, () => {
        get().fetchDesigns()
        get().fetchStats()
      })
      .subscribe()

    set({ _channels: [ordersChannel, designsChannel] })
  },

  unsubscribe: () => {
    get()._channels.forEach(ch => supabase?.removeChannel(ch))
    set({ _channels: [] })
  },
}))
