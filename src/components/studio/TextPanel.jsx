import { useDesignStore } from '../../store/designStore'

const FONTS = [
  { id: 'Impact',           label: 'IMPACT',    style: { fontFamily: 'Impact, sans-serif' } },
  { id: 'Barlow Condensed', label: 'BARLOW',    style: { fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 } },
  { id: 'Arial Black',      label: 'A.BLACK',   style: { fontFamily: 'Arial Black, sans-serif' } },
  { id: 'Courier New',      label: 'COURIER',   style: { fontFamily: 'Courier New, monospace', fontWeight: 700 } },
  { id: 'Georgia',          label: 'GEORGIA',   style: { fontFamily: 'Georgia, serif', fontWeight: 700 } },
]

const TEXT_COLORS = [
  '#000000','#FFFFFF','#B6FF00','#00D1FF',
  '#FF006E','#FFD700','#FF4500','#8B00FF',
]

export default function TextPanel() {
  const text      = useDesignStore((s) => s.text)
  const textColor = useDesignStore((s) => s.textColor)
  const font      = useDesignStore((s) => s.font)
  const setText   = useDesignStore((s) => s.setText)
  const setTextColor = useDesignStore((s) => s.setTextColor)
  const setFont   = useDesignStore((s) => s.setFont)

  return (
    <div className="space-y-5 p-4">
      {/* Text input */}
      <div>
        <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#888] mb-2">
          Your Text
        </h3>
        <div className="relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 20))}
            placeholder="YOUR DRIP"
            maxLength={20}
            className="
              w-full bg-[#1A1A1A] border border-white/10
              font-display font-black text-lg uppercase tracking-widest
              text-[#F5F5F5] placeholder-[#444]
              px-4 py-3
              focus:outline-none focus:border-[#B6FF00]
              transition-colors duration-150
            "
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-xs text-[#444]">
            {text.length}/20
          </span>
        </div>
      </div>

      {/* Font picker */}
      <div>
        <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#888] mb-2">
          Font
        </h3>
        <div className="flex flex-wrap gap-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFont(f.id)}
              style={f.style}
              className={`
                tap-target px-3 py-1.5 text-sm border transition-colors duration-150
                ${font === f.id
                  ? 'border-[#B6FF00] text-[#B6FF00] bg-[#B6FF00]/5'
                  : 'border-white/10 text-[#888] hover:border-white/30 hover:text-[#F5F5F5]'
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text colour */}
      <div>
        <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#888] mb-2">
          Text Color
        </h3>
        <div className="flex flex-wrap gap-2">
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setTextColor(c)}
              style={{ backgroundColor: c }}
              className={`
                tap-target w-9 h-9 rounded-none transition-all duration-150
                ${textColor === c
                  ? 'ring-2 ring-offset-1 ring-offset-[#111] ring-[#B6FF00] scale-110'
                  : 'ring-1 ring-white/10 hover:ring-white/30'
                }
              `}
            />
          ))}
        </div>
      </div>

      {text && (
        <div className="border border-white/6 p-3 bg-[#0D0D0D]">
          <p className="font-display text-xs text-[#888] uppercase tracking-widest mb-1">Preview</p>
          <p
            className="text-2xl uppercase truncate"
            style={{ color: textColor, fontFamily: FONTS.find(f => f.id === font)?.style.fontFamily, fontWeight: 900 }}
          >
            {text}
          </p>
        </div>
      )}
    </div>
  )
}
