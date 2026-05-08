import { useRef } from 'react'
import gsap from 'gsap'
import { useDesignStore } from '../../store/designStore'

const STICKERS = [
  '🔥','⚡','💀','👑','🌊','🔮','💎','🕶️',
  '🤙','✌️','👾','🎯','🚀','🌀','⚠️','♾️',
  '🦋','🐉','🌙','🏆',
]

export default function StickerPanel() {
  const sticker    = useDesignStore((s) => s.sticker)
  const setSticker = useDesignStore((s) => s.setSticker)

  return (
    <div className="space-y-4 p-4">
      <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#888]">
        Graphics
      </h3>

      <div className="grid grid-cols-5 gap-2">
        {STICKERS.map((s) => (
          <StickerBtn
            key={s}
            emoji={s}
            active={sticker === s}
            onClick={() => setSticker(sticker === s ? null : s)}
          />
        ))}
      </div>

      {sticker && (
        <div className="flex items-center justify-between border border-white/6 p-3 bg-[#0D0D0D]">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{sticker}</span>
            <p className="font-display font-bold text-sm text-[#F5F5F5] uppercase tracking-widest">
              Applied
            </p>
          </div>
          <button
            onClick={() => setSticker(null)}
            className="tap-target font-display font-bold text-xs uppercase tracking-widest text-[#FF006E] hover:text-red-400"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

function StickerBtn({ emoji, active, onClick }) {
  const ref = useRef(null)

  const onDown = () => {
    onClick()
    gsap.timeline()
      .to(ref.current, { scale: 0.8, duration: 0.08, ease: 'power2.in' })
      .to(ref.current, { scale: active ? 1 : 1.15, duration: 0.3, ease: 'elastic.out(1.5, 0.4)' })
      .to(ref.current, { scale: active ? 1 : 1.0, duration: 0.2, ease: 'power2.out' })
  }

  return (
    <button
      ref={ref}
      onMouseDown={onDown}
      onTouchStart={onDown}
      className={`
        tap-target w-full aspect-square text-2xl flex items-center justify-center
        border transition-all duration-150
        ${active
          ? 'border-[#B6FF00] bg-[#B6FF00]/10 scale-110'
          : 'border-white/8 bg-[#1A1A1A] hover:border-white/30 hover:bg-[#222]'
        }
      `}
    >
      {emoji}
    </button>
  )
}
