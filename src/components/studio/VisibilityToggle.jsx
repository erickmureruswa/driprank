import { useRef, useEffect } from 'react'
import { Eye, EyeOff, Globe, Lock } from 'lucide-react'
import gsap from 'gsap'
import { useDesignStore } from '../../store/designStore'

export default function VisibilityToggle() {
  const visibility    = useDesignStore((s) => s.visibility)
  const setVisibility = useDesignStore((s) => s.setVisibility)
  const indicatorRef  = useRef(null)
  const isPublic = visibility === 'public'

  useEffect(() => {
    gsap.to(indicatorRef.current, {
      x: isPublic ? 0 : '100%',
      duration: 0.35,
      ease: 'power3.inOut',
    })
  }, [isPublic])

  return (
    <div className="space-y-3">
      {/* Toggle pill */}
      <div className="relative flex bg-[#1A1A1A] border border-white/8 h-11 cursor-pointer overflow-hidden">
        {/* Sliding indicator */}
        <div
          ref={indicatorRef}
          className="absolute left-0 top-0 bottom-0 w-1/2 pointer-events-none"
          style={{ background: isPublic ? '#B6FF00' : '#FF006E', transition: 'none' }}
        />
        {/* Buttons */}
        {['public', 'private'].map((v) => (
          <button
            key={v}
            onClick={() => setVisibility(v)}
            className={`
              tap-target flex-1 z-10 flex items-center justify-center gap-1.5
              font-display font-black text-xs uppercase tracking-widest
              transition-colors duration-300
              ${visibility === v
                ? v === 'public' ? 'text-[#0D0D0D]' : 'text-white'
                : 'text-[#888]'
              }
            `}
          >
            {v === 'public'
              ? <><Globe size={12} strokeWidth={2.5} /> Public</>
              : <><Lock size={12} strokeWidth={2.5} /> Private</>
            }
          </button>
        ))}
      </div>

      {/* Context text */}
      <div className={`p-3 border text-xs font-body leading-relaxed transition-colors duration-300 ${
        isPublic
          ? 'border-[#B6FF00]/30 bg-[#B6FF00]/5 text-[#B6FF00]'
          : 'border-[#FF006E]/30 bg-[#FF006E]/5 text-[#FF006E]'
      }`}>
        {isPublic
          ? '🏆 Goes live on the leaderboard. Every order pushes your rank up.'
          : '🔒 Hidden from rankings. Only you can share the link.'
        }
      </div>
    </div>
  )
}
