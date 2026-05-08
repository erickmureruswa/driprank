import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowLeft, Zap } from 'lucide-react'

export default function NotFound() {
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }
    )
  }, [])

  return (
    <main className="pt-[88px] min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
      <div ref={ref} className="text-center max-w-md">

        {/* Glitch number */}
        <div className="relative inline-block mb-6">
          <span
            className="font-display font-black text-[10rem] leading-none select-none"
            style={{ color: '#B6FF00', opacity: 0.08, filter: 'blur(2px)' }}
          >
            404
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center font-display font-black text-[10rem] leading-none select-none"
            style={{ color: '#B6FF00', WebkitTextStroke: '2px #B6FF00', WebkitTextFillColor: 'transparent' }}
          >
            404
          </span>
        </div>

        <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#F5F5F5] mb-3">
          Design Not Found
        </h1>
        <p className="font-body text-sm text-[#555] mb-10 leading-relaxed">
          This page doesn't exist in the arena. Maybe it was dropped, or you hit a dead link.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="
              tap-target flex items-center gap-2
              border border-white/15 text-[#888]
              font-display font-black text-xs uppercase tracking-widest
              px-5 py-3 hover:border-white/30 hover:text-[#F5F5F5] transition-all
            "
          >
            <ArrowLeft size={13} strokeWidth={2.5} />
            Back to Arena
          </Link>
          <Link
            to="/studio"
            className="
              tap-target flex items-center gap-2
              bg-[#B6FF00] text-[#0D0D0D]
              font-display font-black text-xs uppercase tracking-widest
              px-5 py-3 hover:bg-[#ccff33] transition-colors
            "
          >
            <Zap size={13} strokeWidth={3} />
            Start Designing
          </Link>
        </div>

        <div className="mt-16 flex items-center justify-center gap-8">
          {[['/', 'Arena'], ['/leaderboard', 'Rankings'], ['/drops', 'Drops']].map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="font-display font-bold text-[10px] uppercase tracking-widest text-[#333] hover:text-[#555] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}
