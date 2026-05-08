import { useRef, useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus,
  ShoppingBag, Trophy, Zap, Share2,
} from 'lucide-react'
import { getTrend } from '../constants/mockData'
import BuyModal     from '../components/leaderboard/BuyModal'
import DesignImage  from '../components/ui/DesignImage'
import LikeButton   from '../components/ui/LikeButton'
import { useLeaderboardStore } from '../store/leaderboardStore'
import { useLikeStore } from '../store/likeStore'

function TrendBadge({ trend }) {
  if (trend.dir === 'up') return (
    <span className="flex items-center gap-1 text-[#B6FF00] font-display font-black text-xs uppercase">
      <TrendingUp size={13} strokeWidth={2.5} />↑{trend.delta} spots
    </span>
  )
  if (trend.dir === 'down') return (
    <span className="flex items-center gap-1 text-[#FF006E] font-display font-black text-xs uppercase">
      <TrendingDown size={13} strokeWidth={2.5} />↓{trend.delta} spots
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-[#444] font-display font-black text-xs uppercase">
      <Minus size={13} strokeWidth={2} />Holding
    </span>
  )
}

export default function ProductDetail() {
  const { id }         = useParams()
  const navigate       = useNavigate()
  const getDesign      = useLeaderboardStore((s) => s.getDesign)
  const design         = getDesign(id)
  const fetchLikes     = useLikeStore((s) => s.fetchLikes)
  const [showBuy, setShowBuy] = useState(false)

  useEffect(() => { if (id) fetchLikes([id]) }, [id, fetchLikes])

  const headerRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (!design) return
    gsap.fromTo(headerRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
    )
    gsap.fromTo(contentRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 }
    )
  }, [design])

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: `DRIPRANK — ${design.name}`, url })
    } else {
      navigator.clipboard?.writeText(url)
    }
  }

  if (!design) {
    return (
      <main className="pt-[88px] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-display font-black text-2xl text-[#333] uppercase mb-4">Design Not Found</p>
          <Link to="/leaderboard" className="font-display font-bold text-xs text-[#B6FF00] uppercase tracking-widest hover:text-[#ccff33]">
            ← Back to Rankings
          </Link>
        </div>
      </main>
    )
  }

  const trend = getTrend(design)

  const stats = [
    { label: 'Weekly Orders',   val: design.weeklyOrders.toLocaleString(),  color: design.color },
    { label: 'All-Time Orders', val: design.allTimeOrders.toLocaleString(), color: '#F5F5F5' },
    { label: 'Current Rank',    val: `#${design.rank}`,                     color: design.color },
    { label: 'Previous Rank',   val: `#${design.prevRank}`,                 color: '#555' },
  ]

  return (
    <>
      <main className="pt-[88px] min-h-screen bg-[#0D0D0D]">
        <div className="max-w-2xl mx-auto px-4 pb-20">

          {/* ── Back nav ── */}
          <div ref={headerRef} className="flex items-center justify-between py-5">
            <button
              onClick={() => navigate(-1)}
              className="tap-target flex items-center gap-1.5 text-[#555] hover:text-[#F5F5F5] transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={2} />
              <span className="font-display font-bold text-xs uppercase tracking-widest">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <LikeButton designId={id} size="lg" />
              <button
                onClick={handleShare}
                className="tap-target flex items-center gap-1.5 text-[#555] hover:text-[#F5F5F5] transition-colors"
              >
                <Share2 size={14} strokeWidth={2} />
                <span className="font-display font-bold text-xs uppercase tracking-widest">Share</span>
              </button>
            </div>
          </div>

          <div ref={contentRef} className="space-y-4">

            {/* ── Hero card ── */}
            <div
              className="border bg-[#0E0E0E] overflow-hidden"
              style={{ borderColor: `${design.color}44`, boxShadow: `0 0 50px ${design.color}1A` }}
            >
              {/* Color bar */}
              <div className="h-1.5 w-full" style={{ background: design.color }} />

              {/* Shirt + info split */}
              <div className="flex flex-col sm:flex-row items-center gap-0">

                {/* Photo hero */}
                <div className="w-full sm:w-[280px] shrink-0">
                  <DesignImage design={design} aspect="portrait" showLabel={false} />
                </div>

                {/* Info */}
                <div className="flex-1 p-6 sm:border-l border-white/6 w-full sm:w-auto">
                  {/* Rank + trend */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 border"
                      style={{ borderColor: `${design.color}44`, background: `${design.color}11` }}
                    >
                      <Trophy size={12} strokeWidth={2.5} style={{ color: design.color }} />
                      <span className="font-display font-black text-xs uppercase tracking-widest" style={{ color: design.color }}>
                        Rank #{design.rank}
                      </span>
                    </div>
                    <TrendBadge trend={trend} />
                  </div>

                  {/* Name */}
                  <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#F5F5F5] leading-none">
                    {design.name}
                  </h1>
                  <Link
                    to={`/profile/${design.designer?.replace('@', '')}`}
                    className="font-display text-sm text-[#555] uppercase tracking-widest mt-2 block hover:text-[#B6FF00] transition-colors"
                  >
                    by {design.designer}
                  </Link>
                  <p className="font-display font-bold text-xs text-[#333] uppercase tracking-widest mt-0.5">
                    {design.id}
                  </p>

                  {/* Quick stats */}
                  <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/6">
                    <div>
                      <p className="font-display font-black text-[9px] uppercase tracking-widest text-[#444] mb-0.5">Weekly</p>
                      <p className="font-display font-black text-lg leading-none" style={{ color: design.color }}>
                        {design.weeklyOrders.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-px h-8 bg-white/8" />
                    <div>
                      <p className="font-display font-black text-[9px] uppercase tracking-widest text-[#444] mb-0.5">All Time</p>
                      <p className="font-display font-black text-lg leading-none text-[#F5F5F5]">
                        {design.allTimeOrders.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map(({ label, val, color }) => (
                <div key={label} className="border border-white/8 bg-[#111111] p-4">
                  <p className="font-display font-black text-[9px] uppercase tracking-widest text-[#444] mb-1">{label}</p>
                  <p className="font-display font-black text-xl sm:text-2xl leading-none" style={{ color }}>
                    {val}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Order section ── */}
            <div className="border border-white/8 bg-[#111111] p-6">
              <p className="font-display font-black text-xs uppercase tracking-widest text-[#555] mb-4">
                Order This Design
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 border border-white/6 bg-[#0D0D0D] p-3">
                  <p className="font-display font-black text-xs uppercase tracking-widest text-[#B6FF00]">
                    COD — Market Rate
                  </p>
                  <p className="font-body text-[11px] text-[#444] mt-0.5">
                    Cash on Delivery · Size selection on next step
                  </p>
                </div>
                <button
                  onClick={() => setShowBuy(true)}
                  className="
                    tap-target flex items-center justify-center gap-2 px-6 py-4 sm:py-3
                    bg-[#B6FF00] text-[#0D0D0D]
                    font-display font-black text-sm uppercase tracking-widest
                    hover:bg-[#ccff33] transition-colors shrink-0 animate-pulse-glow
                  "
                >
                  <ShoppingBag size={15} strokeWidth={2.5} />
                  Order Now
                </button>
              </div>
            </div>

            {/* ── Other designs CTA ── */}
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/leaderboard"
                className="font-display font-bold text-xs text-[#555] uppercase tracking-widest hover:text-[#F5F5F5] transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={11} strokeWidth={2} />
                All Rankings
              </Link>
              <Link
                to="/studio"
                className="
                  tap-target flex items-center gap-1.5
                  font-display font-black text-xs uppercase tracking-widest
                  text-[#B6FF00] hover:text-[#ccff33] transition-colors
                "
              >
                <Zap size={11} strokeWidth={3} />
                Create Your Own
              </Link>
            </div>

          </div>
        </div>
      </main>

      {showBuy && <BuyModal design={design} onClose={() => setShowBuy(false)} />}
    </>
  )
}
