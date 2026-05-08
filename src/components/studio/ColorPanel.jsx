import { useRef } from 'react'
import gsap from 'gsap'
import { useStudioStore } from '../../store/studioStore'

const PRESETS = [
  '#FFFFFF','#F5F5F0','#E8E8E8','#CCCCCC',
  '#1A1A1A','#000000','#2A1A0A','#0A1A2A',
  '#B6FF00','#00D1FF','#FF006E','#FFD700',
  '#FF4500','#8B00FF','#00FF88','#FF69B4',
]

function Swatch({ color, active, onClick }) {
  const ref = useRef(null)
  const tap = () => {
    onClick(color)
    gsap.timeline()
      .to(ref.current, { scale: 0.82, duration: 0.08 })
      .to(ref.current, { scale: active ? 1.1 : 1.06, duration: 0.3, ease: 'back.out(2)' })
      .to(ref.current, { scale: active ? 1.1 : 1, duration: 0.15 })
  }
  return (
    <button
      ref={ref}
      onMouseDown={tap} onTouchStart={tap}
      style={{ backgroundColor: color, transform: active ? 'scale(1.1)' : 'scale(1)' }}
      className={`
        tap-target w-9 h-9 transition-shadow
        ${active ? 'ring-2 ring-offset-2 ring-offset-[#111] ring-[#B6FF00]' : 'ring-1 ring-white/10'}
      `}
    />
  )
}

export default function ColorPanel() {
  const shirtColor    = useStudioStore((s) => s.shirtColor)
  const setShirtColor = useStudioStore((s) => s.setShirtColor)

  return (
    <div className="space-y-5 p-4">
      <div>
        <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#888] mb-3">
          Fabric Color
        </h3>
        <div className="grid grid-cols-8 gap-2">
          {PRESETS.map((c) => (
            <Swatch key={c} color={c} active={shirtColor === c} onClick={setShirtColor} />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 overflow-hidden border border-white/10">
          <div className="w-full h-full" style={{ background: shirtColor }} />
          <input
            type="color"
            value={shirtColor}
            onChange={(e) => setShirtColor(e.target.value)}
            className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
          />
          <span className="absolute inset-0 flex items-center justify-center font-display font-black text-[9px] uppercase pointer-events-none"
            style={{ color: shirtColor === '#FFFFFF' || shirtColor === '#F5F5F0' ? '#000' : '#fff', mixBlendMode: 'difference' }}>
            HEX
          </span>
        </div>
        <div>
          <p className="font-display font-bold text-sm text-[#F5F5F5] uppercase tracking-wider">{shirtColor.toUpperCase()}</p>
          <p className="font-body text-[11px] text-[#555]">Custom colour</p>
        </div>
      </div>
    </div>
  )
}
