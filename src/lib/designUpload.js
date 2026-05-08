import { supabase } from './supabase'

const ACCENT_COLORS = ['#B6FF00', '#00D1FF', '#FF006E']

function genId() {
  return `UP${Math.floor(Math.random() * 900000 + 100000)}`
}

function randomAccent() {
  return ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)]
}

/** Compress a File to WebP and return { blob, aspect } */
export function compressImage(file, maxW = 1200) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img  = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale  = Math.min(1, maxW / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => resolve({ blob, aspect: img.width / img.height }),
        'image/webp',
        0.88,
      )
    }
    img.onerror = reject
    img.src = url
  })
}

/** Upload a Blob to Supabase Storage → return public URL */
export async function uploadToStorage(blob, filename) {
  if (!supabase) throw new Error('Supabase not configured')
  const path = `uploads/${Date.now()}-${filename}`
  const { data, error } = await supabase.storage
    .from('designs')
    .upload(path, blob, { contentType: 'image/webp', upsert: false })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage
    .from('designs')
    .getPublicUrl(data.path)
  return publicUrl
}

/**
 * Full upload + publish flow.
 * Returns the inserted design row.
 */
export async function publishDesign({ name, file, visibility = 'public', color }) {
  if (!supabase) throw new Error('Supabase not configured')

  const slug     = name.trim().replace(/\s+/g, '-').toLowerCase()
  const { blob } = await compressImage(file)
  const imageUrl = await uploadToStorage(blob, `${slug}.webp`)

  const id = genId()
  const { data, error } = await supabase
    .from('designs')
    .insert({
      id,
      name:            name.trim().toUpperCase(),
      designer:        '@anonymous',
      color:           color || randomAccent(),
      hype:            '🔥',
      rank:            99,
      prev_rank:       99,
      orders:          0,
      weekly_orders:   0,
      all_time_orders: 0,
      visibility,
      drop:            false,
      image:           imageUrl,
      source:          'user',
    })
    .select()
    .single()

  if (error) throw error
  return data
}
