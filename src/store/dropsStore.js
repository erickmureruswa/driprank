import { create } from 'zustand'
import { ACTIVE_DROPS } from '../constants/mockData'
import { supabase } from '../lib/supabase'

function toDrop(row) {
  return {
    id:       row.id,
    designId: row.design_id,
    name:     row.name,
    designer: row.designer,
    color:    row.color,
    price:    row.price,
    stock:    row.stock,
    endsAt:   new Date(row.ends_at),
    tag:      row.tag,
    hype:     row.hype,
  }
}

export const useDropsStore = create((set) => ({
  drops:   ACTIVE_DROPS,
  loading: false,
  error:   null,

  fetchDrops: async () => {
    if (!supabase) return
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('drops')
        .select('*')
        .eq('active', true)
        .order('ends_at', { ascending: true })
      if (error) throw error
      set({ drops: data.map(toDrop), loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },
}))
