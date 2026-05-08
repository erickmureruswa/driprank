import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export default function AnimatedCounter({ value, className = '', prefix = '', suffix = '', style }) {
  const ref = useRef(null)
  const prevRef = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obj = { val: prevRef.current }
    gsap.to(obj, {
      val: value,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = `${prefix}${Math.floor(obj.val).toLocaleString()}${suffix}`
      },
    })
    prevRef.current = value
  }, [value, prefix, suffix])

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  )
}
