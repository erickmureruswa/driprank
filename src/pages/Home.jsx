import { useEffect, useRef, useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Zap, Trophy, ArrowRight, TrendingUp, TrendingDown, Clock, Package } from 'lucide-react'
import Badge from '../components/ui/Badge'
import GlowCard from '../components/ui/GlowCard'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import DesignImage from '../components/ui/DesignImage'
import { lazy, Suspense as S2 } from 'react'
const HeroScene = lazy(() => import('../components/landing/HeroScene'))
import { ACTIVE_DROPS, getTrend } from '../constants/mockData'
import { useLeaderboardStore } from '../store/leaderboardStore'
import { useDropsStore } from '../store/dropsStore'

gsap.registerPlugin(ScrollTrigger)

/* ── Shirt-tap modal ─────────────────────────────────────── */
function ShirtModal({ shirt, onClose }) {
  const modalRef  = useRef(null)
  const navigate  = useNavigate()

  useEffect(() => {
    gsap.fromTo(modalRef.current,
      { opacity: 0, y: 30, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    )
  }, [])

  const close = () => {
    gsap.to(modalRef.current, {
      opacity: 0, y: 20, scale: 0.95, duration: 0.25, ease: 'power2.in',
      onComplete: onClose,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={close}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#111111] border border-white/10 p-6 space-y-5"
      >
        {/* Colour swatch */}
        <div
          className="w-full h-32 flex items-center justify-center relative overflow-hidden"
          style={{ background: `${shirt.color}10` }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: `radial-gradient(circle, ${shirt.color}, transparent 70%)` }}
          />
          <span
            className="font-display font-black text-8xl select-none opacity-25"
            style={{ color: shirt.color }}
          >T</span>
          <span
            className="absolute bottom-2 right-3 font-display font-bold text-xs uppercase tracking-widest"
            style={{ color: shirt.color }}
          >
            {shirt.label}
          </span>
        </div>

        <div>
          <h3 className="font-display font-black text-2xl uppercase text-[#F5F5F5]">
            {shirt.label}
          </h3>
          <p className="text-[#888888] text-xs font-body mt-1">
            Tap the shirt to cop it via WhatsApp — COD only.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => { navigate('/leaderboard'); close() }}
            className="
              tap-target w-full py-3.5 flex items-center justify-center gap-2
              font-display font-black text-sm uppercase tracking-widest
              text-[#0D0D0D] transition-colors
            "
            style={{ background: shirt.color }}
          >
            <Zap size={16} strokeWidth={3} /> Buy This Drop
          </button>
          <button
            onClick={() => { navigate('/studio'); close() }}
            className="
              tap-target w-full py-3 flex items-center justify-center
              font-display font-bold text-xs uppercase tracking-widest
              text-[#888888] border border-white/10
              hover:border-white/30 hover:text-[#F5F5F5] transition-colors
            "
          >
            Design Your Own
          </button>
        </div>

        <button
          onClick={close}
          className="tap-target w-full text-center text-xs text-[#444] uppercase tracking-widest font-display"
        >
          Close
        </button>
      </div>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────── */
export default function Home() {
  const cardsRef  = useRef([])
  const statsRef  = useRef(null)
  const [tapped, setTapped] = useState(null)

  const { designs: allDesigns, fetchDesigns } = useLeaderboardStore()
  const { drops, fetchDrops }                  = useDropsStore()

  useEffect(() => { fetchDesigns(); fetchDrops() }, [fetchDesigns, fetchDrops])

  const topDesigns  = allDesigns.slice(0, 3)
  const activeDrops = drops.length > 0 ? drops : ACTIVE_DROPS

  const handleShirtClick = useCallback((shirt) => {
    setTapped(shirt)
  }, [])

  useEffect(() => {
    // Scroll-triggered cards
    cardsRef.current.forEach((card, i) => {
      if (!card) return
      gsap.fromTo(card,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: 'power3.out',
          delay: i * 0.08,
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
        }
      )
    })

    // Stats counter reveal
    if (statsRef.current) {
      gsap.fromTo(statsRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 90%' },
        }
      )
    }

    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <>
      {/* ── 3D Hero (pinned section) ── */}
      <div className="pt-[72px]">
        <S2 fallback={
          <div className="w-full h-screen bg-[#0D0D0D] flex items-center justify-center">
            <span className="font-display font-black text-[#B6FF00] text-sm uppercase tracking-widest animate-pulse">
              Loading Arena...
            </span>
          </div>
        }>
          <HeroScene onShirtClick={handleShirtClick} />
        </S2>
      </div>

      {/* ── Live Stats ── */}
      <section ref={statsRef} className="py-10 px-4 bg-[#111111] border-y border-white/6">
        <div className="max-w-screen-xl mx-auto flex flex-wrap items-center justify-center gap-10 md:gap-20">
          {[
            { label: 'Designs Live',        value: 2847, color: '#B6FF00' },
            { label: 'Orders This Week',    value: 12493, color: '#00D1FF' },
            { label: 'Active Designers',    value: 1204,  color: '#FF006E' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <AnimatedCounter
                value={value}
                className="block font-display font-black text-5xl md:text-6xl"
                style={{ color }}
              />
              <span className="text-[#888888] font-display font-bold text-xs uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Top Designs ── */}
      <section className="py-20 px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display font-black text-4xl md:text-5xl uppercase text-[#F5F5F5]">
              Top Drip
            </h2>
            <p className="text-[#888888] font-body text-sm mt-1">This week's arena leaders</p>
          </div>
          <Link
            to="/leaderboard"
            className="tap-target flex items-center gap-2 font-display font-bold text-sm uppercase tracking-widest text-[#B6FF00] hover:text-[#F5F5F5] transition-colors"
          >
            Full Rankings <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topDesigns.map((design, i) => {
            const trend = getTrend(design)
            return (
              <div key={design.id} ref={(el) => (cardsRef.current[i] = el)}>
                <GlowCard glowColor={design.color} className="p-6 h-full">

                  <div className="flex items-start justify-between mb-6">
                    <span
                      className="font-display font-black text-6xl leading-none opacity-20"
                      style={{ color: design.color }}
                    >
                      #{design.rank}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={i === 0 ? 'lime' : i === 1 ? 'blue' : 'magenta'}>
                        {trend.dir === 'up'
                          ? `↑ +${trend.delta}`
                          : trend.dir === 'down'
                          ? `↓ -${trend.delta}`
                          : '— HOLDING'
                        }
                      </Badge>
                      <span className="text-[#888888] font-display font-bold text-xs uppercase tracking-widest">
                        {design.id}
                      </span>
                    </div>
                  </div>

                  <div className="w-full mb-5 overflow-hidden">
                    <DesignImage design={design} aspect="portrait" showLabel={false} />
                  </div>

                  <h3 className="font-display font-black text-xl uppercase text-[#F5F5F5] mb-1">
                    {design.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {trend.dir === 'down'
                        ? <TrendingDown size={13} style={{ color: design.color }} />
                        : <TrendingUp size={13} style={{ color: design.color }} />
                      }
                      <AnimatedCounter
                        value={design.orders}
                        suffix=" orders"
                        className="font-display font-bold text-sm"
                        style={{ color: design.color }}
                      />
                    </div>
                    <Link
                      to={`/design/${design.id}`}
                      className="tap-target font-display font-black text-xs uppercase tracking-widest text-[#888888] hover:text-[#F5F5F5] transition-colors"
                    >
                      BUY →
                    </Link>
                  </div>

                </GlowCard>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Active Drops teaser ── */}
      <section className="py-16 px-4 bg-[#0D0D0D]">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-black text-3xl md:text-4xl uppercase text-[#F5F5F5]">
                Active Drops
              </h2>
              <p className="text-[#888888] font-body text-sm mt-1">Limited stock. Order now or miss out.</p>
            </div>
            <Link
              to="/drops"
              className="tap-target flex items-center gap-2 font-display font-bold text-sm uppercase tracking-widest text-[#FF006E] hover:text-[#ff3385] transition-colors"
            >
              All Drops <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeDrops.map((drop) => (
              <Link
                key={drop.id}
                to="/drops"
                className="
                  group flex items-center gap-4 p-4
                  border border-white/8 bg-[#111111]
                  hover:border-white/20 transition-all duration-150
                "
                style={{ borderLeftColor: drop.color, borderLeftWidth: 2 }}
              >
                <span className="text-2xl shrink-0">{drop.hype}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-black text-xs uppercase tracking-widest text-[#F5F5F5] truncate leading-tight">
                    {drop.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Package size={9} strokeWidth={2} style={{ color: drop.color }} />
                    <span className="font-display font-bold text-[10px] uppercase tracking-widest" style={{ color: drop.color }}>
                      {drop.stock} left
                    </span>
                  </div>
                </div>
                <span
                  className="font-display font-black text-[9px] uppercase tracking-widest px-2 py-0.5 shrink-0"
                  style={{ background: `${drop.color}22`, color: drop.color, border: `1px solid ${drop.color}44` }}
                >
                  {drop.tag}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-4 bg-[#111111]">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="ghost" className="mb-4">THE ARENA</Badge>
            <h2 className="font-display font-black text-4xl md:text-6xl uppercase text-[#F5F5F5]">
              How the <span style={{ color: '#B6FF00' }}>Game</span> Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Design', desc: 'Build your drip in the 3D studio. Colors, graphics, text — full control.', color: '#B6FF00', icon: '🎨' },
              { step: '02', title: 'Drop',   desc: 'Go public. Your design enters the arena and hits the leaderboard.',        color: '#00D1FF', icon: '⚡' },
              { step: '03', title: 'Compete',desc: 'Every order pushes your rank up. Top 3 get the crown.',                   color: '#FF006E', icon: '🏆' },
              { step: '04', title: 'Dominate',desc:'Weekly resets. Fresh competition. Stay on top or get buried.',             color: '#B6FF00', icon: '👑' },
            ].map((item, i) => (
              <div
                key={item.step}
                ref={(el) => (cardsRef.current[i + 3] = el)}
                className="relative p-6 border border-white/6 bg-[#0D0D0D] group transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-5">
                  <span
                    className="font-display font-black text-5xl leading-none opacity-15"
                    style={{ color: item.color }}
                  >{item.step}</span>
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <h3
                  className="font-display font-black text-2xl uppercase mb-2"
                  style={{ color: item.color }}
                >{item.title}</h3>
                <p className="text-[#888888] font-body text-sm leading-relaxed">{item.desc}</p>
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ background: item.color }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, #B6FF00 0%, transparent 70%)' }}
        />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="font-display font-black text-5xl md:text-7xl uppercase text-[#F5F5F5] mb-6 leading-none">
            Your Design.<br />
            <span style={{ color: '#B6FF00' }} className="glow-text-lime">Their Money.</span>
          </h2>
          <p className="text-[#888888] font-body mb-10 leading-relaxed">
            Stop scrolling. Start designing. The arena is live and the top spots are open.
          </p>
          <Link
            to="/studio"
            className="
              tap-target inline-flex items-center gap-3
              bg-[#B6FF00] text-[#0D0D0D]
              font-display font-black text-lg uppercase tracking-widest
              px-10 py-5 glow-lime
              hover:bg-[#ccff33] transition-colors
            "
          >
            <Zap size={20} strokeWidth={3} />
            Enter the Studio — Free
          </Link>
        </div>
      </section>

      {/* Shirt tap modal */}
      {tapped && <ShirtModal shirt={tapped} onClose={() => setTapped(null)} />}
    </>
  )
}
