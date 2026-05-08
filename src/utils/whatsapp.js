import { WHATSAPP_NUMBER } from '../constants/theme'
import { useToastStore } from '../store/toastStore'

export function buildWhatsAppLink({ designId, size, city }) {
  const message = encodeURIComponent(
    `🔥 DRIPRANK ORDER\n\n` +
    `Design ID: ${designId}\n` +
    `Size: ${size}\n` +
    `Delivery City: ${city}\n\n` +
    `Payment: Cash on Delivery\n\n` +
    `Please confirm my order! 🤙`
  )
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
}

export function openWhatsApp({ designId, size, city }) {
  const link = buildWhatsAppLink({ designId, size, city })
  window.open(link, '_blank', 'noopener,noreferrer')
  useToastStore.getState().addToast('Order sent to WhatsApp!', 'success')
}
