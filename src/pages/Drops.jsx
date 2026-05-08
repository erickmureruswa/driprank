import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { Zap, Clock, Package, AlertTriangle, ShoppingBag } from 'lucide-react'
import BuyModal from '../components/leaderboard/BuyModal'
import { useDropsStore } from '../store/dropsStore'
import { useLeaderboardStore } from '../store/leaderboardStore'
import LikeButton from '../components/ui/LikeButton'

/* ── countdown hook ──────────────────────────────────────── */
function useCountdown(endsAt) {
  const [secs, setSecs] = useState(() => Math.max(0, Math.floor((endsAt - Date.now()) / 1000)))

  useEffect(() => {
    const id = setInterval(() => {
      setSecs(Math.max(0, Math.floor((endsAt - Date.now()) / 1000)))
    }, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  const d = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const ended = secs === 0
  const label = d > 0
    ? `${d}d ${String(h).padStart(2,'0')}h`
    : `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`

  return { label, ended, urgent: secs < 3600 }
}

/* ── active drop card (has countdown + stock) ────────────── */
function ActiveDropCard({ drop, onBuy, index }) {
  const cardRef = useRef(null)
  const { label, ended, urgent } = useCountdown(drop.endsAt)
  const getDesign = useLeaderboardStore((s) => s.getDesign)
  const design    = getDesign(drop.designId)
  const image     = design?.image || drop.image

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: index * 0.08 }
    )
  }, [index])

  const stockPct = Math.min(100, (drop.stock / 100) * 100)
  const stockLow = drop.stock < 20

  return (
    <div
      ref={cardRef}
      className="border border-white/10 bg-[#111111] overflow-hidden"
      style={{ borderTopColor: drop.color, borderTopWidth: 2 }}
    >
      {/* Image */}
      <div className="w-full h-52 overflow-hidden relative">
        {image ? (
          <img src={image} alt={drop.name} className="w-full h-full object-cover object-center" />
        ) : (
          <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
            <span className="text-4xl">{drop.hype}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent" />
        <div className="absolute inset-0" style={{ background: drop.color, opacity: 0.08, mixBlendMode: 'color' }} />
        <span
          className="absolute top-2 left-2 font-display font-black text-[9px] uppercase tracking-widest px-2 py-0.5"
          style={{ background: `${drop.color}22`, color: drop.color, border: `1px solid ${drop.color}44` }}
        >
          {drop.tag}
        </span>
        {urgent && !ended && (
          <span className="absolute top-2 right-2 flex items-center gap-1 font-display font-black text-[9px] uppercase text-[#FF006E] bg-[#0D0D0D]/80 px-2 py-0.5">
            <AlertTriangle size={9} strokeWidth={2.5} />
            Ending soon
          </span>
        )}
      </div>

      <div className="p-4">
        <h2 className="font-display font-black text-base uppercase tracking-tight text-[#F5F5F5] leading-tight mb-0.5">
          {drop.name}
        </h2>
        <p className="font-display text-[10px] text-[#555] uppercase tracking-widest">{drop.designer}</p>

        {/* Countdown */}
        <div className={`flex items-center gap-1.5 mt-3 mb-3 ${urgent && !ended ? 'text-[#FF006E]' : 'text-[#888]'}`}>
          <Clock size={11} strokeWidth={2} />
          <span className="font-display font-black text-xs uppercase tracking-widest tabular-nums">
            {ended ? 'ENDED' : label}
          </span>
        </div>

        {/* Stock bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[#888]">
              <Package size={10} strokeWidth={2} />
              <span className="font-display font-bold text-[9px] uppercase tracking-widest">Stock</span>
            </div>
            <span className={`font-display font-black text-[10px] uppercase ${stockLow ? 'text-[#FF006E]' : 'text-[#F5F5F5]'}`}>
              {drop.stock} left {stockLow && '⚠️'}
            </span>
          </div>
          <div className="h-1.5 bg-[#1A1A1A] w-full overflow-hidden">
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${stockPct}%`, background: stockLow ? '#FF006E' : drop.color, boxShadow: `0 0 8px ${stockLow ? '#FF006E' : drop.color}88` }}
            />
          </div>
        </div>

        {/* Price + actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <p className="font-display font-black text-xs uppercase tracking-widest text-[#B6FF00]">{drop.price}</p>
            <LikeButton designId={drop.designId} />
          </div>
          <button
            onClick={() => !ended && onBuy({ ...design, id: drop.designId, name: drop.name, designer: drop.designer, color: drop.color, hype: drop.hype })}
            disabled={ended}
            className={`
              tap-target flex items-center gap-1.5 px-3 py-2
              font-display font-black text-[10px] uppercase tracking-widest
              transition-all duration-150
              ${ended ? 'bg-[#1A1A1A] text-[#333] cursor-not-allowed border border-white/6' : 'bg-[#B6FF00] text-[#0D0D0D] hover:bg-[#ccff33]'}
            `}
          >
            <Zap size={11} strokeWidth={3} />
            {ended ? 'Sold Out' : 'Cop Now'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── regular design card (all designs) ───────────────────── */
function DesignCard({ design, onBuy, index }) {
  const cardRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', delay: index * 0.05 }
    )
  }, [index])

  return (
    <div
      ref={cardRef}
      className="border border-white/10 bg-[#111111] overflow-hidden group"
      style={{ borderTopColor: design.color, borderTopWidth: 2 }}
    >
      {/* Image */}
      <Link to={`/design/${design.id}`} className="block w-full h-52 overflow-hidden relative">
        {design.image ? (
          <img
            src={design.image}
            alt={design.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
            <span className="text-4xl">{design.hype}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
        <span
          className="absolute top-2 left-2 font-display font-black text-[9px] uppercase tracking-widest px-2 py-0.5"
          style={{ background: `${design.color}22`, color: design.color, border: `1px solid ${design.color}44` }}
        >
          #{design.rank}
        </span>
      </Link>

      <div className="p-4">
        <Link to={`/design/${design.id}`}>
          <h2 className="font-display font-black text-base uppercase tracking-tight text-[#F5F5F5] leading-tight hover:text-[#B6FF00] transition-colors">
            {design.name}
          </h2>
        </Link>
        <Link
          to={`/profile/${design.designer?.replace('@', '')}`}
          className="font-display text-[10px] text-[#555] uppercase tracking-widest mt-0.5 block hover:text-[#B6FF00] transition-colors"
        >
          {design.designer}
        </Link>

        <div className="flex items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-[9px] uppercase tracking-widest text-[#444]">
              {design.orders.toLocaleString()} orders
            </span>
            <LikeButton designId={design.id} />
          </div>
          <button
            onClick={() => onBuy(design)}
            className="
              tap-target flex items-center gap-1.5 px-3 py-2
              border border-white/10 text-[#888]
              font-display font-black text-[10px] uppercase tracking-widest
              hover:border-[#B6FF00] hover:text-[#B6FF00] transition-all duration-150
            "
          >
            <ShoppingBag size={11} strokeWidth={2.5} />
            Buy
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── page ────────────────────────────────────────────────── */
export default function Drops() {
  const [buyDesign, setBuyDesign] = useState(null)
  const headerRef = useRef(null)

  const { drops, fetchDrops } = useDropsStore()
  const { designs, fetchDesigns } = useLeaderboardStore()

  useEffect(() => {
    fetchDrops()
    fetchDesigns()
  }, [fetchDrops, fetchDesigns])

  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { y: -25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    )
  }, [])

  return (
    <>
      <main className="pt-[88px] min-h-screen bg-[#0D0D0D]">
        <div className="max-w-6xl mx-auto px-4 pb-20">

          {/* Header */}
          <div ref={headerRef} className="py-8 sm:py-12">
            <div className="flex items-center gap-3 mb-2">
              <Zap size={20} strokeWidth={2.5} className="text-[#FF006E]" />
              <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#F5F5F5]">
                Drops
              </h1>
            </div>
            <p className="font-body text-sm text-[#555]">
              All designs available to order. Limited runs end when stock hits zero.
            </p>
          </div>

          {/* Active drops (time-limited) */}
          {drops.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#FF006E] animate-pulse" />
                <p className="font-display font-black text-[10px] uppercase tracking-widest text-[#FF006E]">
                  Active Drops — Limited Stock
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {drops.map((drop, i) => (
                  <ActiveDropCard key={drop.id} drop={drop} onBuy={setBuyDesign} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* All designs */}
          <section>
            {drops.length > 0 && (
              <div className="flex items-center gap-2 mb-4 mt-2">
                <p className="font-display font-black text-[10px] uppercase tracking-widest text-[#555]">
                  All Designs
                </p>
                <div className="flex-1 h-px bg-white/6" />
                <span className="font-display font-bold text-[9px] uppercase tracking-widest text-[#333]">
                  {designs.length} designs
                </span>
              </div>
            )}

            {designs.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-display font-black text-2xl text-[#222] uppercase">No Designs Yet</p>
                <p className="font-body text-sm text-[#444] mt-2">Be the first to drop.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {designs.map((design, i) => (
                  <DesignCard key={design.id} design={design} onBuy={setBuyDesign} index={i} />
                ))}
              </div>
            )}
          </section>

          {/* How drops work */}
          <div className="mt-12 border border-white/8 bg-[#111111] p-6">
            <p className="font-display font-black text-xs uppercase tracking-widest text-[#555] mb-4">
              How Drops Work
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                ['01', 'Design wins the leaderboard'],
                ['02', 'Limited run announced (stock set)'],
                ['03', 'Order via WhatsApp · COD only'],
              ].map(([n, t]) => (
                <div key={n}>
                  <p className="font-display font-black text-lg text-[#222]">{n}</p>
                  <p className="font-body text-xs text-[#555] mt-0.5">{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Design CTA */}
          <div className="mt-4 flex items-center justify-between gap-4 border border-white/8 bg-[#111111] p-5">
            <p className="font-display font-black text-sm uppercase tracking-widest text-[#F5F5F5]">
              Want your design to drop?
            </p>
            <Link
              to="/studio"
              className="
                tap-target flex items-center gap-2 shrink-0
                bg-[#FF006E] text-white
                font-display font-black text-xs uppercase tracking-widest
                px-4 py-2.5 hover:bg-[#ff3385] transition-colors
              "
            >
              <Zap size={12} strokeWidth={3} />
              Create
            </Link>
          </div>

        </div>
      </main>

      {buyDesign && <BuyModal design={buyDesign} onClose={() => setBuyDesign(null)} />}
    </>
  )
}
