import { useRef, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Menu, X, Zap, User, LogOut } from 'lucide-react'
import MobileNav from './MobileNav'
import { WEEKLY_DESIGNS } from '../../constants/mockData'
import { useAuthStore } from '../../store/authStore'

gsap.registerPlugin(ScrollTrigger)

const NAV_LINKS = [
  { to: '/', label: 'Arena' },
  { to: '/studio', label: 'Studio' },
  { to: '/leaderboard', label: 'Ranks' },
  { to: '/drops', label: 'Drops' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef    = useRef(null)
  const logoRef   = useRef(null)
  const location  = useLocation()

  const user          = useAuthStore((s) => s.user)
  const profile       = useAuthStore((s) => s.profile)
  const signOut       = useAuthStore((s) => s.signOut)
  const openAuthModal = useAuthStore((s) => s.openAuthModal)

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    )
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <>
      <nav
        ref={navRef}
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${scrolled
            ? 'glass-dark border-b border-white/6 py-3'
            : 'bg-transparent py-5'
          }
        `}
      >
        <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" ref={logoRef} className="tap-target flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#B6FF00] flex items-center justify-center">
              <Zap size={18} className="text-[#0D0D0D] fill-[#0D0D0D]" strokeWidth={3} />
            </div>
            <span className="font-display font-black text-2xl uppercase tracking-tight text-[#F5F5F5] group-hover:text-[#B6FF00] transition-colors duration-150">
              DRIPRANK
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`
                  tap-target font-display font-bold text-sm uppercase tracking-widest
                  transition-colors duration-150 relative group
                  ${location.pathname === to
                    ? 'text-[#B6FF00]'
                    : 'text-[#888888] hover:text-[#F5F5F5]'
                  }
                `}
              >
                {label}
                {location.pathname === to && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#B6FF00]" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${profile?.username || user.email?.split('@')[0]}`}
                  className="font-display font-bold text-[10px] uppercase tracking-widest text-[#555] hover:text-[#B6FF00] transition-colors"
                >
                  {profile?.username || user.email?.split('@')[0]}
                </Link>
                <button
                  onClick={signOut}
                  className="tap-target p-2 text-[#555] hover:text-[#FF006E] transition-colors border border-white/10 hover:border-[#FF006E]/30"
                  title="Sign out"
                >
                  <LogOut size={13} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="tap-target flex items-center gap-1.5 px-3 py-2 border border-white/15 text-[#888] hover:text-[#F5F5F5] hover:border-white/30 transition-all"
              >
                <User size={13} strokeWidth={2} />
                <span className="font-display font-bold text-[10px] uppercase tracking-widest">Sign In</span>
              </button>
            )}
            <Link
              to="/studio"
              className="
                tap-target inline-flex items-center gap-2
                bg-[#B6FF00] text-[#0D0D0D]
                font-display font-black text-xs uppercase tracking-widest
                px-5 py-2.5
                hover:bg-[#ccff33]
                transition-colors duration-150
                animate-pulse-glow
              "
            >
              <Zap size={14} strokeWidth={3} />
              Design Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden tap-target p-2 text-[#F5F5F5]"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen
              ? <X size={24} strokeWidth={2.5} />
              : <Menu size={24} strokeWidth={2.5} />
            }
          </button>
        </div>

        {/* Ticker bar — live data */}
        <div className="border-t border-white/4 overflow-hidden h-7 flex items-center bg-[#111111]/80">
          <div className="animate-ticker flex items-center gap-12 whitespace-nowrap px-4">
            {Array(4).fill(null).map((_, i) => (
              <span key={i} className="font-display font-bold text-xs uppercase tracking-widest text-[#888888] flex items-center gap-8">
                {WEEKLY_DESIGNS.slice(0, 3).map((d) => (
                  <span key={d.id}>
                    <span style={{ color: d.color }}>
                      {d.rank === 1 ? '👑' : d.rank === 2 ? '⚡' : '🔥'}
                    </span>
                    {' '}{d.name} — {d.orders.toLocaleString()} ORDERS &nbsp;
                  </span>
                ))}
                <span className="text-[#FF006E]">★</span>
                {' '}WEEKLY ARENA · CASH ON DELIVERY &nbsp;
              </span>
            ))}
          </div>
        </div>
      </nav>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} links={NAV_LINKS} />
    </>
  )
}
