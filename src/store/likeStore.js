import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'

export const useLikeStore = create((set, get) => ({
  counts: {},        // designId → number
  liked:  new Set(), // design IDs liked by current user

  fetchLikes: async (designIds) => {
    if (!supabase || !designIds.length) return

    const { data } = await supabase
      .from('likes')
      .select('design_id')
      .in('design_id', designIds)

    const counts = {}
    for (const id of designIds) counts[id] = 0
    for (const row of (data || [])) {
      counts[row.design_id] = (counts[row.design_id] || 0) + 1
    }
    set({ counts })

    const user = useAuthStore.getState().user
    if (user) {
      const { data: userLikes } = await supabase
        .from('likes')
        .select('design_id')
        .eq('user_id', user.id)
        .in('design_id', designIds)
      set({ liked: new Set((userLikes || []).map((r) => r.design_id)) })
    }
  },

  toggleLike: async (designId) => {
    const user = useAuthStore.getState().user
    if (!user) {
      useAuthStore.getState().openAuthModal()
      return
    }
    if (!supabase) return

    const { liked, counts } = get()
    const isLiked = liked.has(designId)

    // Optimistic update
    const newLiked  = new Set(liked)
    const newCounts = { ...counts }
    if (isLiked) {
      newLiked.delete(designId)
      newCounts[designId] = Math.max(0, (newCounts[designId] || 0) - 1)
    } else {
      newLiked.add(designId)
      newCounts[designId] = (newCounts[designId] || 0) + 1
    }
    set({ liked: newLiked, counts: newCounts })

    if (isLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('design_id', designId)
      if (error) set({ liked, counts })
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: user.id, design_id: designId })
      if (error) set({ liked, counts })
    }
  },
}))
