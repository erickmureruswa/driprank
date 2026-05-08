import { create } from 'zustand'
import { WEEKLY_DESIGNS, ALLTIME_DESIGNS } from '../constants/mockData'
import { supabase } from '../lib/supabase'

function toDesign(row) {
  return {
    id:             row.id,
    name:           row.name,
    designer:       row.designer,
    color:          row.color,
    hype:           row.hype,
    rank:           row.rank,
    prevRank:       row.prev_rank,
    orders:         row.orders,
    weeklyOrders:   row.weekly_orders,
    allTimeOrders:  row.all_time_orders,
    visibility:     row.visibility,
    drop:           row.drop,
    image:          row.image,
  }
}

export const useLeaderboardStore = create((set, get) => ({
  view:     'weekly',
  designs:  WEEKLY_DESIGNS,
  loading:  false,
  error:    null,

  /* Fetch from Supabase; falls back to mock data silently */
  fetchDesigns: async () => {
    if (!supabase) return   // no credentials — use mock data
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('visibility', 'public')
        .order('rank', { ascending: true })
      if (error) throw error
      const designs = data.map(toDesign)
      set({ designs, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  setView: (v) => {
    const { designs } = get()
    if (supabase) {
      // With Supabase, sort client-side
      const sorted = [...designs].sort((a, b) =>
        v === 'weekly'
          ? b.weeklyOrders - a.weeklyOrders
          : b.allTimeOrders - a.allTimeOrders
      ).map((d, i) => ({ ...d, rank: i + 1 }))
      set({ view: v, designs: sorted })
    } else {
      set({
        view: v,
        designs: v === 'weekly' ? WEEKLY_DESIGNS : ALLTIME_DESIGNS,
      })
    }
  },

  incrementOrder: (id) => {
    set((s) => ({
      designs: s.designs.map((d) =>
        d.id === id
          ? { ...d, orders: d.orders + 1, weeklyOrders: d.weeklyOrders + 1, allTimeOrders: d.allTimeOrders + 1 }
          : d
      ),
    }))
  },

  getDesign: (id) =>
    get().designs.find((d) => d.id === id)
    ?? WEEKLY_DESIGNS.find((d) => d.id === id)
    ?? null,
}))
