import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { Trophy, Zap } from 'lucide-react'
import { useLeaderboardStore } from '../store/leaderboardStore'
import { useLikeStore } from '../store/likeStore'
import PodiumCard  from '../components/leaderboard/PodiumCard'
import RankRow     from '../components/leaderboard/RankRow'
import WeeklyTimer from '../components/leaderboard/WeeklyTimer'
import BuyModal    from '../components/leaderboard/BuyModal'

export default function Leaderboard() {
  const { designs, view, setView, fetchDesigns, loading } = useLeaderboardStore()
  const fetchLikes = useLikeStore((s) => s.fetchLikes)
  const [buyDesign, setBuyDesign] = useState(null)

  useEffect(() => {
    fetchDesigns().then(() => {
      const ids = useLeaderboardStore.getState().designs.map((d) => d.id)
      if (ids.length) fetchLikes(ids)
    })
  }, [fetchDesigns, fetchLikes])

  const headerRef = useRef(null)
  const podiumRef = useRef(null)
  const listRef   = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      )
      gsap.fromTo(podiumRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.15 }
      )
      gsap.fromTo(
        listRef.current?.children ?? [],
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.04, delay: 0.3 }
      )
    })
    return () => ctx.revert()
  }, [view])

  const top3    = designs.slice(0, 3)
  const rest    = designs.slice(3)

  return (
    <>
      <main className="pt-[88px] min-h-screen bg-[#0D0D0D]">
        <div className="max-w-3xl mx-auto px-4 pb-20">

          {/* ── Header ── */}
          <div ref={headerRef} className="py-8 sm:py-12">
            <div className="flex items-center gap-3 mb-2">
              <Trophy size={20} strokeWidth={2.5} className="text-[#B6FF00]" />
              <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#F5F5F5]">
                Rankings
              </h1>
            </div>
            <p className="font-body text-sm text-[#555]">
              Real order counts. No votes. No fluff.
            </p>
          </div>

          {/* ── Controls bar ── */}
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            {/* View toggle */}
            <div className="flex border border-white/10 overflow-hidden">
              {['weekly', 'alltime'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`
                    tap-target px-4 py-2 font-display font-black text-xs uppercase tracking-widest
                    transition-all duration-150
                    ${view === v
                      ? 'bg-[#B6FF00] text-[#0D0D0D]'
                      : 'text-[#555] hover:text-[#F5F5F5] hover:bg-white/5'
                    }
                  `}
                >
                  {v === 'weekly' ? 'This Week' : 'All Time'}
                </button>
              ))}
            </div>

            {/* Weekly countdown (only on weekly view) */}
            {view === 'weekly' && <WeeklyTimer />}
          </div>

          {/* ── Podium ── */}
          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-2 mb-8">
              {[1,2,3].map((n) => (
                <div key={n} className="h-14 bg-white/3 border border-white/5 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && (
            <div ref={podiumRef}>
              <PodiumCard designs={top3} onBuy={setBuyDesign} />
            </div>
          )}

          {/* ── Ranked list ── */}
          <div className={`border border-white/8 overflow-hidden transition-opacity duration-300 ${loading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {/* List header */}
            <div className="flex items-center gap-3 sm:gap-4 px-4 py-2 bg-[#111111] border-b border-white/8">
              <span className="w-8 sm:w-10 font-display font-black text-[9px] uppercase tracking-widest text-[#444] text-right">#</span>
              <span className="w-8 font-display font-black text-[9px] uppercase tracking-widest text-[#444]">Trend</span>
              <span className="w-2.5" />
              <span className="flex-1 font-display font-black text-[9px] uppercase tracking-widest text-[#444]">Design</span>
              <span className="hidden sm:block font-display font-black text-[9px] uppercase tracking-widest text-[#444] shrink-0">Orders</span>
              <span className="hidden md:block font-display font-black text-[9px] uppercase tracking-widest text-[#444] shrink-0 w-20 text-center">Weekly</span>
              <span className="font-display font-black text-[9px] uppercase tracking-widest text-[#444] shrink-0">Buy</span>
            </div>

            <div ref={listRef}>
              {/* Top 3 in list too */}
              {designs.slice(0, 3).map((d, i) => (
                <RankRow key={d.id} design={d} index={i} onBuy={setBuyDesign} />
              ))}
              {/* Divider */}
              <div className="h-px bg-[#B6FF00]/20 mx-4" />
              {rest.map((d, i) => (
                <RankRow key={d.id} design={d} index={i + 3} onBuy={setBuyDesign} />
              ))}
            </div>
          </div>

          {/* ── Design CTA ── */}
          <div className="mt-10 border border-white/8 bg-[#111111] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-display font-black text-sm uppercase tracking-widest text-[#F5F5F5]">
                Think you can rank?
              </p>
              <p className="font-body text-xs text-[#555] mt-1">
                Submit your design and compete for the #1 spot.
              </p>
            </div>
            <Link
              to="/studio"
              className="
                tap-target flex items-center gap-2
                bg-[#B6FF00] text-[#0D0D0D]
                font-display font-black text-xs uppercase tracking-widest
                px-5 py-3 hover:bg-[#ccff33] transition-colors whitespace-nowrap
              "
            >
              <Zap size={13} strokeWidth={3} />
              Design Now
            </Link>
          </div>

        </div>
      </main>

      {buyDesign && <BuyModal design={buyDesign} onClose={() => setBuyDesign(null)} />}
    </>
  )
}
