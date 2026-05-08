import { useRef, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import gsap from 'gsap'
import { useToastStore } from '../../store/toastStore'

const CONFIGS = {
  success: { color: '#B6FF00', Icon: CheckCircle },
  error:   { color: '#FF006E', Icon: AlertCircle },
  info:    { color: '#00D1FF', Icon: Info },
}

function ToastItem({ toast }) {
  const ref    = useRef(null)
  const remove = useToastStore((s) => s.removeToast)
  const { color, Icon } = CONFIGS[toast.type] ?? CONFIGS.info

  useEffect(() => {
    gsap.fromTo(ref.current,
      { x: 80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }
    )
  }, [])

  const dismiss = () => {
    gsap.to(ref.current, {
      x: 80, opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => remove(toast.id),
    })
  }

  return (
    <div
      ref={ref}
      className="flex items-start gap-3 bg-[#181818] border border-white/10 px-4 py-3 min-w-[260px] max-w-[340px] shadow-2xl"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <Icon size={16} strokeWidth={2.5} style={{ color }} className="shrink-0 mt-0.5" />
      <p className="flex-1 font-display font-bold text-sm text-[#F5F5F5] uppercase tracking-wide leading-snug">
        {toast.message}
      </p>
      <button onClick={dismiss} className="tap-target text-[#555] hover:text-[#F5F5F5] transition-colors ml-1 shrink-0">
        <X size={13} strokeWidth={2.5} />
      </button>
    </div>
  )
}

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="fixed bottom-5 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  )
}
