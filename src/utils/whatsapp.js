import { WHATSAPP_NUMBER } from '../constants/theme'
import { supabase } from '../lib/supabase'
import { useToastStore } from '../store/toastStore'

// Cached dynamic number, falls back to constant
let _cachedNumber = null

export async function getWhatsAppNumber() {
  if (_cachedNumber) return _cachedNumber
  if (!supabase) return WHATSAPP_NUMBER
  try {
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'whatsapp_number')
      .single()
    _cachedNumber = data?.value || WHATSAPP_NUMBER
    return _cachedNumber
  } catch {
    return WHATSAPP_NUMBER
  }
}

// Invalidate cache when admin updates the number
export function invalidateWhatsAppCache() {
  _cachedNumber = null
}

export function buildWhatsAppLink({ designId, size, city, number }) {
  const num = number || WHATSAPP_NUMBER
  const message = encodeURIComponent(
    `🔥 DRIPRANK ORDER\n\n` +
    `Design ID: ${designId}\n` +
    `Size: ${size}\n` +
    `Delivery City: ${city}\n\n` +
    `Payment: Cash on Delivery\n\n` +
    `Please confirm my order! 🤙`
  )
  return `https://wa.me/${num}?text=${message}`
}

export async function openWhatsApp({ designId, size, city }) {
  const number = await getWhatsAppNumber()
  const link   = buildWhatsAppLink({ designId, size, city, number })
  window.open(link, '_blank', 'noopener,noreferrer')
  useToastStore.getState().addToast('Order sent to WhatsApp!', 'success')
}
