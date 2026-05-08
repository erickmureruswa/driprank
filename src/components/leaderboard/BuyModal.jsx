import { useRef, useEffect, useState } from 'react'
import { X, MessageCircle, ChevronDown } from 'lucide-react'
import gsap from 'gsap'
import { CITIES, SIZES } from '../../constants/cities'
import { openWhatsApp } from '../../utils/whatsapp'

export default function BuyModal({ design, onClose }) {
  const [size, setSize] = useState('')
  const [city, setCity] = useState('')
  const modalRef  = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    gsap.fromTo(modalRef.current,
      { y: 50, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.6)' }
    )
  }, [])

  const close = () => {
    gsap.to(modalRef.current,  { y: 30, opacity: 0, scale: 0.95, duration: 0.22, ease: 'power2.in' })
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.22, onComplete: onClose })
  }

  const canOrder = size && city

  const handleOrder = () => {
    if (!canOrder) return
    const selectedCity = CITIES.find((c) => c.id === city)
    openWhatsApp({
      designId: design.id,
      size,
      city: `${selectedCity?.name} (ETA: ${selectedCity?.eta})`,
    })
    close()
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
      onClick={close}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#111111] border border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b border-white/8"
          style={{ borderLeftColor: design.color, borderLeftWidth: 3 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display font-black text-[10px] uppercase tracking-widest mb-1"
                style={{ color: design.color }}>
                {design.hype} {design.id}
              </p>
              <h2 className="font-display font-black text-xl uppercase text-[#F5F5F5] leading-none">
                {design.name}
              </h2>
              <p className="font-display text-xs text-[#888] mt-1">{design.designer}</p>
            </div>
            <button onClick={close} className="tap-target text-[#888] hover:text-[#F5F5F5] p-1 mt-0.5">
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Size */}
          <div>
            <label className="font-display font-black text-[10px] uppercase tracking-widest text-[#888] block mb-2">
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
                      ? 'text-[#0D0D0D] bg-[#B6FF00] border-[#B6FF00]'
                      : 'border-white/10 text-[#888] hover:border-white/30 hover:text-[#F5F5F5]'
                    }
                  `}
                >{s}</button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="font-display font-black text-[10px] uppercase tracking-widest text-[#888] block mb-2">
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
                  focus:outline-none focus:border-[#B6FF00] transition-colors duration-150
                "
              >
                <option value="" disabled>Choose city...</option>
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — ETA {c.eta}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] pointer-events-none" />
            </div>
          </div>

          {/* Summary */}
          {canOrder && (
            <div className="bg-[#0D0D0D] border border-white/6 p-4 space-y-1.5">
              <p className="font-display font-black text-[10px] uppercase tracking-widest mb-2"
                style={{ color: design.color }}>
                Order Summary
              </p>
              {[
                ['Design',   design.name],
                ['ID',       design.id],
                ['Size',     size],
                ['City',     CITIES.find((c) => c.id === city)?.name],
                ['ETA',      CITIES.find((c) => c.id === city)?.eta],
                ['Payment',  'Cash on Delivery'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="font-body text-xs text-[#555]">{k}</span>
                  <span className="font-display font-bold text-xs uppercase text-[#F5F5F5]">{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleOrder}
            disabled={!canOrder}
            className={`
              tap-target w-full py-4 flex items-center justify-center gap-3
              font-display font-black text-sm uppercase tracking-widest
              transition-all duration-200
              ${canOrder
                ? 'bg-[#25D366] text-white hover:bg-[#1eb554]'
                : 'bg-[#1A1A1A] text-[#444] cursor-not-allowed border border-white/6'
              }
            `}
          >
            <MessageCircle size={17} strokeWidth={2.5} />
            {canOrder ? 'Order via WhatsApp' : 'Select size + city first'}
          </button>

          <p className="text-center font-body text-[11px] text-[#333]">
            Redirected to WhatsApp · Cash on Delivery only
          </p>
        </div>
      </div>
    </div>
  )
}
