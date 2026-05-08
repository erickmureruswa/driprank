import { useRef } from 'react'
import gsap from 'gsap'
import { useStudioStore } from '../../store/studioStore'

const STICKER_GROUPS = [
  { label: 'Hype',  items: ['🔥','⚡','💥','🌪️','💫','✨','🎯','🏆'] },
  { label: 'Drip',  items: ['💎','👑','🕶️','💀','🤙','✌️','☠️','👾'] },
  { label: 'Vibes', items: ['🌊','🔮','🌀','♾️','🚀','🌙','🐉','🦋'] },
  { label: 'Bold',  items: ['⚠️','🚫','❌','✅','🔴','🟢','⬛','🔳'] },
]

function StickerBtn({ emoji, onClick }) {
  const ref = useRef(null)

  const onTap = () => {
    onClick(emoji)
    gsap.timeline()
      .to(ref.current, { scale: 0.78, duration: 0.08, ease: 'power2.in' })
      .to(ref.current, { scale: 1.18, duration: 0.28, ease: 'back.out(2.5)' })
      .to(ref.current, { scale: 1.00, duration: 0.18, ease: 'power2.out' })
  }

  return (
    <button
      ref={ref}
      onMouseDown={onTap}
      onTouchStart={onTap}
      className="
        tap-target w-full aspect-square text-2xl flex items-center justify-center
        border border-white/8 bg-[#1A1A1A]
        hover:border-[#B6FF00]/50 hover:bg-[#B6FF00]/5
        transition-colors duration-150
      "
    >
      {emoji}
    </button>
  )
}

export default function AddStickerPanel() {
  const { addStickerLayer, layers } = useStudioStore()
  const canAdd = layers.length < 8

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#888]">
          Add Sticker
        </h3>
        {!canAdd && (
          <span className="font-display font-bold text-[10px] text-[#FF006E] uppercase tracking-widest">
            Layer limit
          </span>
        )}
      </div>

      {STICKER_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="font-display font-bold text-[10px] uppercase tracking-widest text-[#444] mb-2">
            {group.label}
          </p>
          <div className="grid grid-cols-8 gap-1.5">
            {group.items.map((emoji) => (
              <StickerBtn
                key={emoji}
                emoji={emoji}
                onClick={canAdd ? addStickerLayer : () => {}}
              />
            ))}
          </div>
        </div>
      ))}

      <p className="font-body text-[11px] text-[#333] leading-relaxed pt-1">
        Each tap adds a new sticker layer. Drag to reposition, pinch to resize.
      </p>
    </div>
  )
}
