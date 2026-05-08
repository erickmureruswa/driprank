import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export function fadeUp(el, delay = 0) {
  return gsap.fromTo(el,
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay }
  )
}

export function staggerFadeUp(els, stagger = 0.1) {
  return gsap.fromTo(els,
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger }
  )
}

export function scaleIn(el, delay = 0) {
  return gsap.fromTo(el,
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)', delay }
  )
}

export function glowPulse(el) {
  return gsap.to(el, {
    boxShadow: '0 0 40px rgba(182,255,0,0.8), 0 0 80px rgba(182,255,0,0.3)',
    duration: 1,
    ease: 'power2.inOut',
    yoyo: true,
    repeat: -1,
  })
}

export function magneticHover(el, strength = 0.3) {
  const onMove = (e) => {
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) * strength
    const dy = (e.clientY - cy) * strength
    gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' })
  }
  const onLeave = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
  }
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseleave', onLeave)
  return () => {
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
  }
}
