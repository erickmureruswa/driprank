import { create } from 'zustand'

function genId() {
  return `DR${Math.floor(Math.random() * 9000 + 1000)}`
}

export const useDesignStore = create((set, get) => ({
  // shirt
  shirtColor: '#FFFFFF',
  // text layer
  text: '',
  textColor: '#000000',
  font: 'Impact',
  // graphic layer
  sticker: null,
  uploadedImage: null,  // data-url
  // meta
  visibility: 'public',
  designId: genId(),
  // history for undo
  _history: [],

  _snapshot: () => {
    const s = get()
    return {
      shirtColor: s.shirtColor, text: s.text, textColor: s.textColor,
      font: s.font, sticker: s.sticker, uploadedImage: s.uploadedImage,
    }
  },
  _push: (snap) => set((s) => ({ _history: [...s._history.slice(-19), snap] })),

  setShirtColor: (c) => set((s) => { s._push(s._snapshot()); return { shirtColor: c } }),
  setText:       (t) => set((s) => { s._push(s._snapshot()); return { text: t } }),
  setTextColor:  (c) => set({ textColor: c }),
  setFont:       (f) => set({ font: f }),
  setSticker:    (v) => set((s) => { s._push(s._snapshot()); return { sticker: v } }),
  setUploadedImage: (d) => set((s) => { s._push(s._snapshot()); return { uploadedImage: d } }),
  setVisibility: (v) => set({ visibility: v }),

  undo: () => set((s) => {
    const prev = s._history[s._history.length - 1]
    if (!prev) return {}
    return { ...prev, _history: s._history.slice(0, -1) }
  }),

  resetDesign: () => set({
    shirtColor: '#FFFFFF', text: '', textColor: '#000000',
    font: 'Impact', sticker: null, uploadedImage: null,
    visibility: 'public', designId: genId(), _history: [],
  }),
}))
