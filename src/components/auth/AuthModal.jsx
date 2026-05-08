import { useRef, useEffect, useState } from 'react'
import { X, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import gsap from 'gsap'
import { useAuthStore } from '../../store/authStore'
import { useLikeStore } from '../../store/likeStore'
import { useLeaderboardStore } from '../../store/leaderboardStore'

export default function AuthModal() {
  const overlayRef = useRef(null)
  const cardRef    = useRef(null)

  const closeAuthModal = useAuthStore((s) => s.closeAuthModal)
  const signIn         = useAuthStore((s) => s.signIn)
  const signUp         = useAuthStore((s) => s.signUp)
  const fetchLikes     = useLikeStore((s) => s.fetchLikes)
  const designs        = useLeaderboardStore((s) => s.designs)

  const [tab,      setTab]      = useState('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [status,   setStatus]   = useState('idle') // idle | loading | success | error
  const [errMsg,   setErrMsg]   = useState('')

  useEffect(() => {
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.22, ease: 'power2.out' }
    )
    gsap.fromTo(cardRef.current,
      { y: 40, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.38, ease: 'power3.out', delay: 0.05 }
    )
  }, [])

  const close = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.18, onComplete: closeAuthModal })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')
    try {
      if (tab === 'login') {
        await signIn({ email, password })
      } else {
        if (!username.trim()) throw new Error('Username is required')
        await signUp({ email, password, username: username.trim() })
      }
      setStatus('success')
      // Refresh likes for all loaded designs
      const ids = designs.map((d) => d.id)
      if (ids.length) await fetchLikes(ids)
      setTimeout(close, 800)
    } catch (err) {
      setErrMsg(err.message || 'Something went wrong.')
      setStatus('error')
    }
  }

  const switchTab = (t) => {
    setTab(t)
    setErrMsg('')
    setStatus('idle')
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) close() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    >
      <div
        ref={cardRef}
        className="w-full max-w-sm bg-[#111111] border border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <p className="font-display font-black text-sm uppercase tracking-widest text-[#F5F5F5]">
            {tab === 'login' ? 'Sign In' : 'Join DRIPRANK'}
          </p>
          <button onClick={close} className="tap-target text-[#555] hover:text-[#F5F5F5] transition-colors">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Tab toggle */}
        <div className="flex border-b border-white/8">
          {['login', 'signup'].map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`
                flex-1 py-3 font-display font-black text-[10px] uppercase tracking-widest
                transition-all duration-150
                ${tab === t ? 'text-[#B6FF00] border-b-2 border-[#B6FF00]' : 'text-[#444] hover:text-[#888]'}
              `}
            >
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {tab === 'signup' && (
            <div className="space-y-1">
              <label className="font-display font-black text-[9px] uppercase tracking-widest text-[#555] block">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. streetkid"
                maxLength={24}
                autoComplete="username"
                className="
                  w-full bg-[#1A1A1A] border border-white/10 px-3 py-2.5
                  font-display font-black text-xs uppercase tracking-widest text-[#F5F5F5]
                  placeholder:text-[#333] focus:outline-none focus:border-[#B6FF00] transition-colors
                "
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-display font-black text-[9px] uppercase tracking-widest text-[#555] block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              autoComplete="email"
              className="
                w-full bg-[#1A1A1A] border border-white/10 px-3 py-2.5
                font-display font-black text-xs text-[#F5F5F5]
                placeholder:text-[#333] focus:outline-none focus:border-[#B6FF00] transition-colors
              "
            />
          </div>

          <div className="space-y-1">
            <label className="font-display font-black text-[9px] uppercase tracking-widest text-[#555] block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              className="
                w-full bg-[#1A1A1A] border border-white/10 px-3 py-2.5
                font-display font-black text-xs text-[#F5F5F5]
                placeholder:text-[#333] focus:outline-none focus:border-[#B6FF00] transition-colors
              "
            />
          </div>

          {errMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-[#FF006E]/8 border border-[#FF006E]/30 text-[#FF006E]">
              <AlertCircle size={12} strokeWidth={2} />
              <span className="font-display font-bold text-[10px] uppercase tracking-widest">{errMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className={`
              w-full py-3 flex items-center justify-center gap-2
              font-display font-black text-xs uppercase tracking-widest
              transition-all duration-200 mt-1
              ${status === 'success'
                ? 'bg-[#25D366] text-white'
                : status === 'loading'
                ? 'bg-[#B6FF00]/40 text-[#0D0D0D]/60 cursor-not-allowed'
                : 'bg-[#B6FF00] text-[#0D0D0D] hover:bg-[#ccff33]'
              }
            `}
          >
            {status === 'loading' && <Loader size={13} strokeWidth={2.5} className="animate-spin" />}
            {status === 'success' && <CheckCircle size={13} strokeWidth={2.5} />}
            {status === 'success' ? 'Welcome!' : status === 'loading' ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="font-display text-[9px] text-[#333] uppercase tracking-widest text-center pb-4 px-5">
          {tab === 'login' ? 'No account?' : 'Already have one?'}{' '}
          <button
            onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}
            className="text-[#B6FF00] hover:text-[#ccff33] transition-colors underline underline-offset-2"
          >
            {tab === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
