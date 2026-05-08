import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user:          null,
  profile:       null,
  loading:       true,
  showAuthModal: false,

  init: async () => {
    if (!supabase) { set({ loading: false }); return }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) await get()._loadProfile(session.user)
    set({ loading: false })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await get()._loadProfile(session.user)
      } else {
        set({ user: null, profile: null })
      }
    })
  },

  _loadProfile: async (user) => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    set({ user, profile: data })
  },

  signUp: async ({ email, password, username }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) throw error
    return data
  },

  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  signOut: async () => {
    await supabase?.auth.signOut()
    set({ user: null, profile: null })
  },

  openAuthModal:  () => set({ showAuthModal: true }),
  closeAuthModal: () => set({ showAuthModal: false }),
}))
