import { create } from 'zustand'

let _id = 0

export const useToastStore = create((set) => ({
  toasts: [],

  addToast: (message, type = 'success', duration = 3500) => {
    const id = `t_${Date.now()}_${_id++}`
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, duration)
    return id
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
