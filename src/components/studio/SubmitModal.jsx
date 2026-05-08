import { useRef, useEffect, useState } from 'react'
import { X, Zap, MessageCircle, ChevronDown } from 'lucide-react'
import gsap from 'gsap'
import { useStudioStore } from '../../store/studioStore'
import { CITIES, SIZES } from '../../constants/cities'
import { openWhatsApp } from '../../utils/whatsapp'

export default function SubmitModal({ onClose }) {
  const { designId, visibility } = useStudioStore()
  const [size, setSize]   = useState('')
  const [city, setCity]   = useState('')
  const modalRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 })
    gsap.fromTo(modalRef.current,
      { y: 60, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.5)' }
    )
  }, [])

  const close = () => {
    gsap.to(modalRef.current, { y: 40, opacity: 0, scale: 0.96, duration: 0.25, ease: 'power2.in' })
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, onComplete: onClose })
  }

  const canSubmit = size && city

  const handleOrder = () => {
    if (!canSubmit) return
    const selectedCity = CITIES.find((c) => c.id === city)
    openWhatsApp({ designId, size, city: `${selectedCity?.name} (ETA: ${selectedCity?.eta})` })
    close()
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={close}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#111111] border border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div>
            <h2 className="font-display font-black text-xl uppercase text-[#F5F5F5]">
              Submit Design
            </h2>
            <p className="font-display text-xs text-[#888] uppercase tracking-widest">
              {designId} · {visibility === 'public' ? '🏆 Public' : '🔒 Private'}
            </p>
          </div>
          <button onClick={close} className="tap-target text-[#888] hover:text-[#F5F5F5] p-1">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Size */}
          <div>
            <label className="font-display font-black text-xs uppercase tracking-widest text-[#888] block mb-2">
              Select Size
            </label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`
                    tap-target w-12 h-12 font-display font-black text-sm uppercase
                    border transition-colors duration-150
                    ${size === s
                      ? 'border-[#B6FF00] text-[#B6FF00] bg-[#B6FF00]/10'
                      : 'border-white/10 text-[#888] hover:border-white/30 hover:text-[#F5F5F5]'
                    }
                  `}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="font-display font-black text-xs uppercase tracking-widest text-[#888] block mb-2">
              Delivery City
            </label>
            <div className="relative">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="
                  w-full bg-[#1A1A1A] border border-white/10
                  font-display font-bold text-sm uppercase tracking-widest
                  text-[#F5F5F5] px-4 py-3 pr-10 appearance-none
                  focus:outline-none focus:border-[#B6FF00]
                  transition-colors duration-150
                "
              >
                <option value="" disabled>Choose city...</option>
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — ETA {c.eta}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
            </div>
          </div>

          {/* Order summary */}
          {canSubmit && (
            <div className="bg-[#0D0D0D] border border-white/6 p-4 space-y-1.5">
              <p className="font-display font-black text-xs uppercase tracking-widest text-[#B6FF00]">Order Summary</p>
              {[
                ['Design ID', designId],
                ['Size', size],
                ['City', CITIES.find((c) => c.id === city)?.name],
                ['Delivery', CITIES.find((c) => c.id === city)?.eta],
                ['Payment', 'Cash on Delivery'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="font-body text-xs text-[#888]">{k}</span>
                  <span className="font-display font-bold text-xs uppercase text-[#F5F5F5]">{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* WhatsApp CTA */}
          <button
            onClick={handleOrder}
            disabled={!canSubmit}
            className={`
              tap-target w-full py-4 flex items-center justify-center gap-3
              font-display font-black text-base uppercase tracking-widest
              transition-all duration-200
              ${canSubmit
                ? 'bg-[#25D366] text-white hover:bg-[#20ba59] glow-lime'
                : 'bg-[#1A1A1A] text-[#444] cursor-not-allowed border border-white/6'
              }
            `}
          >
            <MessageCircle size={18} strokeWidth={2.5} />
            {canSubmit ? 'Order via WhatsApp' : 'Select size + city first'}
          </button>

          <p className="text-center font-body text-xs text-[#444]">
            You'll be redirected to WhatsApp with your order pre-filled.
            Cash on Delivery only.
          </p>
        </div>
      </div>
    </div>
  )
}
