import { useRef, useEffect, forwardRef } from 'react'
import gsap from 'gsap'

const GlowCard = forwardRef(function GlowCard({ children, className = '', glowColor = '#B6FF00', onClick }, fwdRef) {
  const innerRef = useRef(null)
  const ref = fwdRef || innerRef

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onEnter = () => gsap.to(el, {
      boxShadow: `0 0 24px ${glowColor}33, 0 0 48px ${glowColor}11`,
      borderColor: `${glowColor}66`,
      duration: 0.3,
      ease: 'power2.out',
    })
    const onLeave = () => gsap.to(el, {
      boxShadow: '0 0 0px transparent',
      borderColor: 'rgba(255,255,255,0.08)',
      duration: 0.4,
      ease: 'power2.out',
    })

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [glowColor])

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`
        glass rounded-none border border-white/8
        transition-transform duration-150
        ${onClick ? 'cursor-pointer tap-target active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
})

export default GlowCard
