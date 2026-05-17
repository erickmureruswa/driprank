import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { Zap, Trophy, Palette, ShoppingBag, Home, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const ICONS = {
  '/': Home,
  '/studio': Palette,
  '/leaderboard': Trophy,
  '/drops': ShoppingBag,
}

export default function MobileNav({ open, onClose, links }) {
  const drawerRef = useRef(null)
  const overlayRef = useRef(null)
  const itemsRef = useRef([])
  const location = useLocation()

  const user          = useAuthStore((s) => s.user)
  const profile       = useAuthStore((s) => s.profile)
  const signOut       = useAuthStore((s) => s.signOut)
  const openAuthModal = useAuthStore((s) => s.openAuthModal)

  const handleSignIn = () => {
    onClose()
    setTimeout(openAuthModal, 350)
  }

  const handleSignOut = () => {
    onClose()
    signOut()
  }

  useEffect(() => {
    const drawer = drawerRef.current
    const overlay = overlayRef.current

    if (open) {
      document.body.style.overflow = 'hidden'
      gsap.to(overlay, { opacity: 1, pointerEvents: 'auto', duration: 0.3 })
      gsap.fromTo(drawer,
        { x: '100%' },
        { x: '0%', duration: 0.4, ease: 'power3.out' }
      )
      gsap.fromTo(itemsRef.current,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.07, delay: 0.15 }
      )
    } else {
      document.body.style.overflow = ''
      gsap.to(overlay, { opacity: 0, pointerEvents: 'none', duration: 0.25 })
      gsap.to(drawer, { x: '100%', duration: 0.35, ease: 'power3.in' })
    }
  }, [open])

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{ opacity: 0, pointerEvents: 'none' }}
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{ transform: 'translateX(100%)' }}
        className="fixed top-0 right-0 bottom-0 z-50 w-[85vw] max-w-sm bg-[#0D0D0D] border-l border-white/8 md:hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#B6FF00] flex items-center justify-center">
              <Zap size={14} className="text-[#0D0D0D] fill-[#0D0D0D]" strokeWidth={3} />
            </div>
            <span className="font-display font-black text-xl uppercase tracking-tight text-[#F5F5F5]">
              DRIPRANK
            </span>
          </div>
          <button onClick={onClose} className="tap-target text-[#888888] hover:text-[#F5F5F5] transition-colors p-1">
            <span className="font-display font-black text-sm uppercase tracking-widest">Close</span>
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 flex flex-col px-6 py-8 gap-2">
          {links.map(({ to, label }, i) => {
            const Icon = ICONS[to] || Home
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                ref={el => itemsRef.current[i] = el}
                onClick={onClose}
                className={`
                  tap-target flex items-center gap-4 px-4 py-4
                  font-display font-black text-2xl uppercase tracking-tight
                  transition-all duration-150
                  border-l-4
                  ${active
                    ? 'border-[#B6FF00] text-[#B6FF00] bg-[#B6FF00]/5'
                    : 'border-transparent text-[#888888] hover:text-[#F5F5F5] hover:border-white/20'
                  }
                `}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* CTA + Auth */}
        <div className="px-6 pb-8 space-y-3 border-t border-white/8 pt-6">

          {/* Auth block */}
          {user ? (
            <div className="space-y-2">
              {/* Username */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white/4 border border-white/8">
                <div className="w-8 h-8 bg-[#1A1A1A] border border-white/10 flex items-center justify-center flex-shrink-0">
                  <User size={14} strokeWidth={2} className="text-[#888]" />
                </div>
                <span className="font-display font-black text-sm uppercase tracking-widest text-[#F5F5F5] truncate">
                  {profile?.username || user.email?.split('@')[0]}
                </span>
              </div>

              {/* Admin dashboard link (only for admins) */}
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="tap-target flex items-center gap-3 px-4 py-3 w-full border border-[#B6FF00]/20 text-[#B6FF00] hover:bg-[#B6FF00]/5 transition-colors"
                >
                  <LayoutDashboard size={16} strokeWidth={2} />
                  <span className="font-display font-black text-xs uppercase tracking-widest">Admin Dashboard</span>
                </Link>
              )}

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="tap-target flex items-center gap-3 px-4 py-3 w-full border border-white/10 text-[#888] hover:text-[#FF006E] hover:border-[#FF006E]/30 transition-colors"
              >
                <LogOut size={16} strokeWidth={2} />
                <span className="font-display font-black text-xs uppercase tracking-widest">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="tap-target flex items-center justify-center gap-2 w-full border border-white/20 text-[#F5F5F5] hover:border-[#B6FF00]/40 hover:text-[#B6FF00] transition-all py-3.5"
            >
              <User size={16} strokeWidth={2} />
              <span className="font-display font-black text-sm uppercase tracking-widest">Sign In / Sign Up</span>
            </button>
          )}

          {/* Design CTA */}
          <Link
            to="/studio"
            onClick={onClose}
            className="
              tap-target flex items-center justify-center gap-2 w-full
              bg-[#B6FF00] text-[#0D0D0D]
              font-display font-black text-lg uppercase tracking-widest
              py-4
              glow-lime
            "
          >
            <Zap size={18} strokeWidth={3} />
            Start Designing
          </Link>
          <p className="text-center text-xs font-body text-[#888888] uppercase tracking-widest">
            Design. Compete. Dominate.
          </p>
        </div>
      </div>
    </>
  )
}
