import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Minus, ShoppingBag } from 'lucide-react'
import gsap from 'gsap'
import { getTrend } from '../../constants/mockData'
import DesignImage from '../ui/DesignImage'
import LikeButton from '../ui/LikeButton'

export default function RankRow({ design, index, onBuy }) {
  const rowRef = useRef(null)
  const trend  = getTrend(design)
  const isTop3 = design.rank <= 3

  const animateTap = () => {
    gsap.timeline()
      .to(rowRef.current, { x: 6, duration: 0.08 })
      .to(rowRef.current, { x: 0, duration: 0.4, ease: 'elastic.out(1.2, 0.4)' })
  }

  return (
    <div
      ref={rowRef}
      className={`
        group flex items-center gap-3 sm:gap-4 px-4 py-2
        border-b border-white/5 transition-all duration-150
        hover:bg-white/3 hover:border-white/10
        ${isTop3 ? 'bg-white/2' : ''}
      `}
    >
      {/* Rank */}
      <div className="w-8 sm:w-10 shrink-0 text-right">
        <span
          className={`font-display font-black text-sm sm:text-base leading-none ${
            isTop3 ? 'text-[#F5F5F5]' : 'text-[#444]'
          }`}
          style={isTop3 ? { color: design.color } : {}}
        >
          {design.rank}
        </span>
      </div>

      {/* Trend indicator */}
      <TrendIndicator trend={trend} />

      {/* Design photo thumbnail */}
      <div className="w-12 h-14 shrink-0 overflow-hidden border border-white/10" style={{ borderLeftColor: design.color, borderLeftWidth: 2 }}>
        <DesignImage design={design} aspect="portrait" showLabel={false} className="w-full h-full" />
      </div>

      {/* Name + designer — links to product detail */}
      <Link
        to={`/design/${design.id}`}
        onClick={animateTap}
        className="flex-1 min-w-0 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <p className="font-display font-black text-xs sm:text-sm uppercase tracking-widest text-[#F5F5F5] truncate leading-tight hover:text-[#B6FF00] transition-colors">
            {design.name}
          </p>
          <span className="text-sm shrink-0">{design.hype}</span>
        </div>
        <Link
          to={`/profile/${design.designer?.replace('@', '')}`}
          onClick={(e) => e.stopPropagation()}
          className="font-display text-[10px] text-[#555] uppercase tracking-widest truncate mt-0.5 hover:text-[#B6FF00] transition-colors"
        >
          {design.designer}
        </Link>
      </Link>

      {/* Orders */}
      <div className="shrink-0 text-right hidden sm:block">
        <p className="font-display font-black text-sm text-[#F5F5F5]">
          {design.orders.toLocaleString()}
        </p>
        <p className="font-display text-[9px] text-[#555] uppercase tracking-widest">orders</p>
      </div>

      {/* Weekly orders badge */}
      <div className="shrink-0 hidden md:flex items-center gap-1 px-2 py-1 bg-white/4 border border-white/8">
        <TrendingUp size={9} strokeWidth={2.5} style={{ color: design.color }} />
        <span className="font-display font-bold text-[10px] uppercase" style={{ color: design.color }}>
          +{design.weeklyOrders}
        </span>
      </div>

      {/* Like */}
      <LikeButton designId={design.id} />

      {/* Buy CTA */}
      <button
        onClick={(e) => { e.stopPropagation(); onBuy(design) }}
        className="
          shrink-0 tap-target flex items-center gap-1.5 px-3 py-2
          border border-white/10 text-[#888]
          font-display font-black text-[10px] uppercase tracking-widest
          hover:border-[#B6FF00] hover:text-[#B6FF00] transition-all duration-150
          group-hover:border-white/20
        "
      >
        <ShoppingBag size={11} strokeWidth={2.5} />
        <span className="hidden sm:block">Buy</span>
      </button>
    </div>
  )
}

function TrendIndicator({ trend }) {
  if (trend.dir === 'up') {
    return (
      <div className="w-8 shrink-0 flex items-center gap-0.5 text-[#B6FF00]">
        <TrendingUp size={11} strokeWidth={2.5} />
        <span className="font-display font-black text-[9px]">{trend.delta}</span>
      </div>
    )
  }
  if (trend.dir === 'down') {
    return (
      <div className="w-8 shrink-0 flex items-center gap-0.5 text-[#FF006E]">
        <TrendingDown size={11} strokeWidth={2.5} />
        <span className="font-display font-black text-[9px]">{trend.delta}</span>
      </div>
    )
  }
  return (
    <div className="w-8 shrink-0 flex items-center justify-center text-[#333]">
      <Minus size={10} strokeWidth={2} />
    </div>
  )
}
