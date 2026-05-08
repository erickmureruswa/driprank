import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, TrendingUp } from 'lucide-react'
import gsap from 'gsap'
import DesignImage from '../ui/DesignImage'
import LikeButton from '../ui/LikeButton'

const PODIUM_ORDER = [1, 0, 2]   // display: 2nd | 1st | 3rd

export default function PodiumCard({ designs = [], onBuy }) {
  if (designs.length < 3) return null
  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5 mb-10">
      {PODIUM_ORDER.map((idx) => (
        <PodiumSlot key={designs[idx].id} design={designs[idx]} onBuy={onBuy} />
      ))}
    </div>
  )
}

const CROWN  = { 1: '👑', 2: '🥈', 3: '🥉' }
const GLOWS  = {
  1: '0 0 40px rgba(182,255,0,0.45)',
  2: '0 0 24px rgba(0,209,255,0.30)',
  3: '0 0 18px rgba(255,0,110,0.25)',
}
const BASE_H = { 1: 'h-28', 2: 'h-16', 3: 'h-10' }
const WIDTHS = { 1: 'w-[34%] sm:w-[30%] max-w-[200px]', 2: 'w-[28%] sm:w-[24%] max-w-[160px]', 3: 'w-[28%] sm:w-[24%] max-w-[160px]' }

function PodiumSlot({ design, onBuy }) {
  const cardRef = useRef(null)
  const rank    = design.rank

  const tap = () => {
    gsap.timeline()
      .to(cardRef.current, { y: -10, duration: 0.1, ease: 'power2.out' })
      .to(cardRef.current, { y: 0,   duration: 0.65, ease: 'elastic.out(1.4, 0.4)' })
    onBuy(design)
  }

  return (
    <div className={`flex flex-col items-center gap-0 ${WIDTHS[rank]}`}>

      {/* Medal */}
      <span className={`text-2xl sm:text-3xl mb-2 select-none ${rank === 1 ? 'animate-bounce' : ''}`}>
        {CROWN[rank]}
      </span>

      {/* Card */}
      <button
        ref={cardRef}
        onClick={tap}
        className="w-full overflow-hidden border border-white/10 bg-[#0E0E0E]
                   transition-all duration-200 hover:border-white/30 group active:scale-[0.98]"
        style={{ boxShadow: GLOWS[rank], borderTopColor: `${design.color}77`, borderTopWidth: 2 }}
      >
        {/* Photo */}
        <DesignImage design={design} aspect="portrait" showLabel={false} />

        {/* Info strip */}
        <div className="px-3 py-2.5 border-t border-white/6">
          <Link
            to={`/design/${design.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-display font-black text-[10px] sm:text-xs uppercase tracking-widest text-[#F5F5F5] leading-tight truncate hover:text-[#B6FF00] transition-colors block"
          >
            {design.name}
          </Link>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1" style={{ color: design.color }}>
              <TrendingUp size={9} strokeWidth={2.5} />
              <span className="font-display font-black text-[10px] uppercase tabular-nums">
                {design.orders.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <LikeButton designId={design.id} />
              <div className="flex items-center gap-1 text-[#444] group-hover:text-[#888] transition-colors">
                <ShoppingBag size={9} strokeWidth={2} />
                <span className="font-display text-[8px] uppercase tracking-widest">Buy</span>
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Podium base */}
      <div
        className={`w-full ${BASE_H[rank]} border border-white/6 border-t-0`}
        style={{ background: `${design.color}0A` }}
      >
        <div className="h-full flex items-start justify-center pt-2">
          <span className="font-display font-black text-sm sm:text-base" style={{ color: `${design.color}55` }}>
            #{rank}
          </span>
        </div>
      </div>
    </div>
  )
}
