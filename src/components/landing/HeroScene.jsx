import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FloatingShirt from './FloatingShirt'
import ParticleField from './ParticleField'
import SceneLights from './SceneLights'

gsap.registerPlugin(ScrollTrigger)

const SHIRTS = [
  { id: 'DR001', label: 'STATIC NOISE', position: [ 0.0,  0.0,  0  ], color: '#B6FF00', rotation: [0,  0.25,  0.00], scale: 1.25 },
  { id: 'DR002', label: 'VOID RUNNER',  position: [-3.8,  0.6, -2  ], color: '#00D1FF', rotation: [0, -0.5,   0.06], scale: 0.92 },
  { id: 'DR003', label: 'CHROME GHOST', position: [ 3.8, -0.4, -1.5], color: '#FF006E', rotation: [0,  0.8,  -0.05], scale: 1.00 },
  { id: 'DR004', label: 'ACID BLOOM',   position: [-2.2, -1.8, -4  ], color: '#B6FF00', rotation: [0.08, 0.18, 0.02], scale: 0.72 },
  { id: 'DR005', label: 'NULL CITY',    position: [ 2.8,  2.0, -3  ], color: '#00D1FF', rotation: [-0.05, -0.32, 0.04], scale: 0.78 },
]

// Bridges GSAP scroll data into the R3F render loop without React re-renders
function CameraRig({ scrollRef }) {
  const { camera } = useThree()

  useFrame(() => {
    const p = scrollRef.current   // 0 → 1
    camera.position.z += (gsap.utils.interpolate(9, 3.5, p) - camera.position.z) * 0.06
    camera.position.y += (gsap.utils.interpolate(0, -1.2, p) - camera.position.y) * 0.06
    camera.rotation.x += (gsap.utils.interpolate(0, 0.12, p) - camera.rotation.x) * 0.06
  })

  return null
}

function SceneContent({ scrollRef, onShirtClick }) {
  return (
    <>
      <color attach="background" args={['#0D0D0D']} />
      <fog attach="fog" args={['#0D0D0D', 12, 28]} />

      <SceneLights />
      <ParticleField count={600} />

      {SHIRTS.map((s) => (
        <FloatingShirt
          key={s.id}
          position={s.position}
          color={s.color}
          rotation={s.rotation}
          scale={s.scale}
          label={s.label}
          onClick={onShirtClick}
        />
      ))}

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.18}
          luminanceSmoothing={0.85}
          intensity={1.8}
          radius={0.75}
        />
      </EffectComposer>

      <CameraRig scrollRef={scrollRef} />
    </>
  )
}

export default function HeroScene({ onShirtClick }) {
  const containerRef = useRef(null)
  const scrollRef    = useRef(0)
  const [isMobile]   = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=90%',
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => { scrollRef.current = self.progress },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 9], fov: isMobile ? 65 : 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        className="absolute inset-0 w-full h-full"
      >
        <Suspense fallback={null}>
          <SceneContent scrollRef={scrollRef} onShirtClick={onShirtClick} />
        </Suspense>
      </Canvas>

      {/* ── Overlaid hero text ── */}
      <HeroOverlay />
    </div>
  )
}

function HeroOverlay() {
  const headRef  = useRef(null)
  const subRef   = useRef(null)
  const ctaRef   = useRef(null)

  useEffect(() => {
    gsap.timeline({ delay: 0.5 })
      .fromTo(headRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }
      )
      .fromTo(subRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo(ctaRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
  }, [])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 pointer-events-none z-10">
      {/* Top headline */}
      <div ref={headRef} className="text-center px-4 mb-6">
        <p className="font-display font-black text-xs md:text-sm uppercase tracking-[0.3em] text-[#B6FF00] mb-3">
          The Social Fashion Arena
        </p>
        <h1 className="font-display font-black uppercase leading-none tracking-tight text-[#F5F5F5]
          text-[clamp(3rem,11vw,8.5rem)]">
          TAP THE<br />
          <span
            className="glow-text-lime"
            style={{ color: '#B6FF00' }}
          >
            DRIP
          </span>
        </h1>
      </div>

      {/* Sub + CTA */}
      <div ref={subRef} className="text-center px-4 mb-6">
        <p className="text-[#888888] font-body text-sm md:text-base max-w-xs mx-auto leading-relaxed">
          Tap any shirt to cop it. Your designs compete for rank.
        </p>
      </div>

      <div ref={ctaRef} className="pointer-events-auto flex flex-col sm:flex-row gap-3 px-4">
        <Link
          to="/studio"
          className="
            tap-target inline-flex items-center justify-center gap-2
            bg-[#B6FF00] text-[#0D0D0D]
            font-display font-black text-sm uppercase tracking-widest
            px-8 py-3.5 glow-lime
            transition-colors hover:bg-[#ccff33]
          "
        >
          ⚡ Design Now
        </Link>
        <Link
          to="/leaderboard"
          className="
            tap-target inline-flex items-center justify-center gap-2
            bg-transparent text-[#F5F5F5]
            font-display font-black text-sm uppercase tracking-widest
            px-8 py-3.5 border border-white/20
            hover:border-white/50 transition-colors
          "
        >
          🏆 Rankings
        </Link>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-40">
        <span className="font-display font-bold text-[10px] uppercase tracking-[0.2em] text-[#F5F5F5]">
          Scroll
        </span>
        <div className="w-px h-7 bg-gradient-to-b from-[#F5F5F5] to-transparent" />
      </div>
    </div>
  )
}
