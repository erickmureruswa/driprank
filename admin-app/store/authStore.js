import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user:    null,
  profile: null,
  loading: true,
  error:   null,

  init: async () => {
    set({ loading: true })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) await get()._loadProfile(session.user)
      else set({ loading: false })

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) await get()._loadProfile(session.user)
        else set({ user: null, profile: null, loading: false })
      })
    } catch (e) {
      set({ loading: false, error: e.message })
    }
  },

  _loadProfile: async (user) => {
    const { data } = await supabase
      .from('profiles')
      .select('username, role, avatar_url')
      .eq('id', user.id)
      .single()
    set({ user, profile: data, loading: false })
  },

  signIn: async (email, password) => {
    set({ error: null, loading: true })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) set({ error: error.message, loading: false })
    return error
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
