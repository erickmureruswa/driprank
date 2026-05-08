import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export default function Button({
  children,
  variant = 'lime',
  size = 'md',
  onClick,
  className = '',
  disabled = false,
  fullWidth = false,
}) {
  const ref = useRef(null)

  const variants = {
    lime: 'bg-[#B6FF00] text-[#0D0D0D] hover:bg-[#ccff33] border-[#B6FF00]',
    outline: 'bg-transparent text-[#B6FF00] border border-[#B6FF00] hover:bg-[#B6FF00] hover:text-[#0D0D0D]',
    ghost: 'bg-transparent text-[#F5F5F5] border border-[#3A3A3A] hover:border-[#B6FF00] hover:text-[#B6FF00]',
    magenta: 'bg-[#FF006E] text-white border-[#FF006E] hover:bg-[#ff3389]',
    blue: 'bg-[#00D1FF] text-[#0D0D0D] border-[#00D1FF] hover:bg-[#33daff]',
    whatsapp: 'bg-[#25D366] text-white border-[#25D366] hover:bg-[#20ba59]',
  }

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-10 py-5 text-lg',
  }

  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return

    const onDown = () => gsap.to(el, { scale: 0.96, duration: 0.1, ease: 'power2.out' })
    const onUp = () => gsap.to(el, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.4)' })

    el.addEventListener('mousedown', onDown)
    el.addEventListener('mouseup', onUp)
    el.addEventListener('touchstart', onDown, { passive: true })
    el.addEventListener('touchend', onUp)

    return () => {
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('mouseup', onUp)
      el.removeEventListener('touchstart', onDown)
      el.removeEventListener('touchend', onUp)
    }
  }, [disabled])

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={`
        tap-target inline-flex items-center justify-center gap-2
        font-display font-black uppercase tracking-widest
        transition-colors duration-150
        rounded-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
