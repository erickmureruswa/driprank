import { create } from 'zustand'
import { supabase } from '../lib/supabase'

function toDesign(row) {
  return {
    id:            row.id,
    name:          row.name,
    designer:      row.designer,
    color:         row.color,
    hype:          row.hype,
    rank:          row.rank,
    prevRank:      row.prev_rank,
    orders:        row.orders         ?? 0,
    weeklyOrders:  row.weekly_orders  ?? 0,
    allTimeOrders: row.all_time_orders ?? 0,
    visibility:    row.visibility,
    drop:          row.drop,
    image:         row.image,
    userId:        row.user_id,
  }
}

export const useProfileStore = create((set) => ({
  profile:       null,
  designs:       [],
  stats:         null,
  likesByDesign: {},
  loading:       false,
  error:         null,
  notFound:      false,

  fetchProfile: async (username) => {
    if (!supabase) {
      set({ error: 'Database not connected', loading: false })
      return
    }
    set({ loading: true, error: null, notFound: false, profile: null, designs: [], stats: null, likesByDesign: {} })

    try {
      // 1. Profile
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle()
      if (pErr) throw pErr
      if (!profile) { set({ notFound: true, loading: false }); return }

      // 2. All designs by this user (public + private — private filtered by caller)
      const { data: rawDesigns, error: dErr } = await supabase
        .from('designs')
        .select('*')
        .eq('user_id', profile.id)
        .order('rank', { ascending: true, nullsLast: true })
      if (dErr) throw dErr

      const designs = (rawDesigns || []).map(toDesign)

      // 3. Like counts in a single query — no N+1
      const ids = designs.map((d) => d.id)
      const likesByDesign = {}
      if (ids.length) {
        const { data: likes } = await supabase
          .from('likes')
          .select('design_id')
          .in('design_id', ids)
        for (const row of (likes || [])) {
          likesByDesign[row.design_id] = (likesByDesign[row.design_id] || 0) + 1
        }
      }

      // 4. Aggregate stats
      const totalLikes  = Object.values(likesByDesign).reduce((s, n) => s + n, 0)
      const totalOrders = designs.reduce((s, d) => s + d.orders, 0)
      const ranked      = designs.filter((d) => d.rank != null && d.rank > 0)
      const bestRank    = ranked.length ? Math.min(...ranked.map((d) => d.rank)) : null

      set({
        profile,
        designs,
        likesByDesign,
        stats: { totalDesigns: designs.length, totalLikes, totalOrders, bestRank },
        loading: false,
      })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  reset: () => set({
    profile: null, designs: [], stats: null,
    likesByDesign: {}, loading: false, error: null, notFound: false,
  }),
}))
