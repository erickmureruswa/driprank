import { create } from 'zustand'
import * as THREE from 'three'

/* ── Texture helpers (called outside React render) ── */
export function makeImageTexture(dataUrl) {
  const tex = new THREE.Texture()
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = false
  const img = new Image()
  img.onload = () => { tex.image = img; tex.needsUpdate = true }
  img.src = dataUrl
  return tex
}

export function makeStickerTexture(emoji) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)
  ctx.font = `${size * 0.75}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, size / 2, size / 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export const TEXT_W = 512
export const TEXT_H = 160

export function makeTextTexture(text, font, color) {
  const W = TEXT_W, H = TEXT_H
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, W, H)
  const fontMap = {
    'Impact':           'Impact, Arial Narrow, sans-serif',
    'Barlow Condensed': 'Barlow Condensed, Impact, sans-serif',
    'Arial Black':      'Arial Black, sans-serif',
    'Courier New':      '"Courier New", monospace',
    'Georgia':          'Georgia, serif',
  }
  ctx.font = `900 ${H * 0.7}px ${fontMap[font] ?? font}`
  ctx.fillStyle = color
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor  = color === '#000000' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)'
  ctx.shadowBlur   = 6
  ctx.fillText(text.toUpperCase().slice(0, 16), W / 2, H / 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/* ── Layer factory ── */
let _uid = 0
export function newLayer({ type, texture, dataUrl = '', text = '', sticker = '', font = 'Impact', textColor = '#FFFFFF', aspect = 1 }) {
  return {
    id: `layer_${Date.now()}_${_uid++}`,
    type,          // 'image' | 'text' | 'sticker'
    texture,       // THREE.Texture
    dataUrl, text, sticker, font, textColor,
    aspect,        // width/height ratio of the texture for correct decal proportions
    // Transform (mesh-local coords)
    position: [0, -0.05, 0.08],   // front-chest centre, z just above front face
    rotationZ: 0,                  // user Z-rotation (radians)
    scale: 0.38,                   // uniform decal scale
    opacity: 1.0,
    visible: true,
  }
}

/* ── Store ── */
function genId() { return `DR${Math.floor(Math.random() * 9000 + 1000)}` }

export const useStudioStore = create((set, get) => ({
  // Shirt
  shirtColor: '#FFFFFF',
  designId:   genId(),
  visibility: 'public',

  // Layers
  layers: [],
  activeLayerId: null,

  // Interaction flags
  isDragging: false,
  isPlacing:  false,

  setShirtColor: (c)  => set({ shirtColor: c }),
  setVisibility: (v)  => set({ visibility: v }),

  /* ─ Adding layers ─ */
  addImageLayer: (dataUrl, aspect = 1) => {
    const texture = makeImageTexture(dataUrl)
    const layer   = newLayer({ type: 'image', texture, dataUrl, aspect })
    set((s) => ({ layers: [...s.layers, layer], activeLayerId: layer.id, isPlacing: true }))
  },

  addStickerLayer: (emoji) => {
    const texture = makeStickerTexture(emoji)
    const layer   = newLayer({ type: 'sticker', texture, sticker: emoji, aspect: 1 })
    set((s) => ({ layers: [...s.layers, layer], activeLayerId: layer.id, isPlacing: true }))
  },

  addTextLayer: (text, font, color) => {
    if (!text.trim()) return
    const texture = makeTextTexture(text, font, color)
    const layer   = newLayer({ type: 'text', texture, text, font, textColor: color, aspect: TEXT_W / TEXT_H })
    set((s) => ({ layers: [...s.layers, layer], activeLayerId: layer.id, isPlacing: true }))
  },

  /* ─ Updating a layer ─ */
  updateLayer: (id, patch) =>
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    })),

  /* ─ Refreshing a text layer's texture ─ */
  refreshTextLayer: (id) =>
    set((s) => {
      const l = s.layers.find((x) => x.id === id)
      if (!l || l.type !== 'text') return {}
      l.texture?.dispose()
      const texture = makeTextTexture(l.text, l.font, l.textColor)
      return { layers: s.layers.map((x) => (x.id === id ? { ...x, texture } : x)) }
    }),

  /* ─ Deleting ─ */
  removeLayer: (id) =>
    set((s) => {
      s.layers.find((l) => l.id === id)?.texture?.dispose()
      return {
        layers: s.layers.filter((l) => l.id !== id),
        activeLayerId: s.activeLayerId === id ? null : s.activeLayerId,
      }
    }),

  /* ─ Selection ─ */
  selectLayer: (id) => set({ activeLayerId: id, isPlacing: false }),
  deselectAll: () => set({ activeLayerId: null, isPlacing: false }),

  /* ─ Reorder ─ */
  moveLayerUp: (id) =>
    set((s) => {
      const arr = [...s.layers]
      const i   = arr.findIndex((l) => l.id === id)
      if (i < arr.length - 1) [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
      return { layers: arr }
    }),
  moveLayerDown: (id) =>
    set((s) => {
      const arr = [...s.layers]
      const i   = arr.findIndex((l) => l.id === id)
      if (i > 0) [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]]
      return { layers: arr }
    }),

  /* ─ Drag state ─ */
  setDragging: (v) => set({ isDragging: v }),
  confirmPlacement: () => set({ isPlacing: false }),

  /* ─ Full reset ─ */
  resetDesign: () => {
    get().layers.forEach((l) => l.texture?.dispose())
    set({ layers: [], activeLayerId: null, shirtColor: '#FFFFFF', designId: genId(), visibility: 'public' })
  },
}))
