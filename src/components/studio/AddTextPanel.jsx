import { useState, useRef } from 'react'
import gsap from 'gsap'
import { useStudioStore } from '../../store/studioStore'

const FONTS = [
  { id: 'Impact',           label: 'IMPACT',  style: { fontFamily: 'Impact, sans-serif' } },
  { id: 'Barlow Condensed', label: 'BARLOW',  style: { fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 } },
  { id: 'Arial Black',      label: 'A.BLACK', style: { fontFamily: 'Arial Black, sans-serif' } },
  { id: 'Courier New',      label: 'COURIER', style: { fontFamily: '"Courier New", monospace', fontWeight: 700 } },
  { id: 'Georgia',          label: 'SERIF',   style: { fontFamily: 'Georgia, serif', fontWeight: 700 } },
]

const COLORS = [
  '#FFFFFF','#000000','#B6FF00','#00D1FF',
  '#FF006E','#FFD700','#FF4500','#8B00FF',
]

export default function AddTextPanel() {
  const [text,  setText]  = useState('')
  const [font,  setFont]  = useState('Impact')
  const [color, setColor] = useState('#FFFFFF')
  const btnRef = useRef(null)
  const { addTextLayer, layers } = useStudioStore()
  const canAdd = layers.length < 8

  const handleAdd = () => {
    if (!text.trim() || !canAdd) return
    addTextLayer(text.trim(), font, color)
    setText('')
    gsap.fromTo(btnRef.current,
      { scale: 0.9 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1.5, 0.4)' }
    )
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#888]">
        Add Text Layer
      </h3>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 16))}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="YOUR DRIP"
          maxLength={16}
          className="
            w-full bg-[#1A1A1A] border border-white/10
            font-display font-black text-lg uppercase tracking-widest
            text-[#F5F5F5] placeholder-[#333]
            px-4 py-3 pr-12 focus:outline-none focus:border-[#B6FF00]
            transition-colors
          "
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-xs text-[#333]">
          {text.length}/16
        </span>
      </div>

      {/* Font */}
      <div>
        <p className="font-display font-black text-[10px] uppercase tracking-widest text-[#888] mb-2">Font</p>
        <div className="flex flex-wrap gap-1.5">
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFont(f.id)}
              style={f.style}
              className={`
                tap-target px-3 py-1.5 text-sm border transition-colors
                ${font === f.id
                  ? 'border-[#B6FF00] text-[#B6FF00] bg-[#B6FF00]/5'
                  : 'border-white/10 text-[#888] hover:border-white/30'}
              `}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="font-display font-black text-[10px] uppercase tracking-widest text-[#888] mb-2">Color</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`
                tap-target w-8 h-8 transition-all
                ${color === c ? 'ring-2 ring-offset-1 ring-offset-[#111] ring-[#B6FF00] scale-110' : 'ring-1 ring-white/10'}
              `}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      {text && (
        <div className="bg-[#0D0D0D] border border-white/6 p-3 overflow-hidden">
          <p
            className="text-xl uppercase truncate text-center"
            style={{ color, fontFamily: FONTS.find(f => f.id === font)?.style.fontFamily, fontWeight: 900 }}
          >{text}</p>
        </div>
      )}

      {/* Add button */}
      <button
        ref={btnRef}
        onClick={handleAdd}
        disabled={!text.trim() || !canAdd}
        className={`
          tap-target w-full py-3.5 flex items-center justify-center
          font-display font-black text-sm uppercase tracking-widest
          transition-colors
          ${text.trim() && canAdd
            ? 'bg-[#B6FF00] text-[#0D0D0D] hover:bg-[#ccff33]'
            : 'bg-[#1A1A1A] text-[#444] cursor-not-allowed border border-white/6'}
        `}
      >
        + Add Text Layer
      </button>
    </div>
  )
}
