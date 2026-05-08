import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ParticleField({ count = 700 }) {
  const pointsRef = useRef()

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    const palette = [
      new THREE.Color('#B6FF00'),
      new THREE.Color('#00D1FF'),
      new THREE.Color('#FF006E'),
      new THREE.Color('#F5F5F5'),
      new THREE.Color('#888888'),
    ]

    for (let i = 0; i < count; i++) {
      // Spread in a wide volume behind the shirts
      positions[i * 3]     = (Math.random() - 0.5) * 32
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18 - 6

      const c = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3]     = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b

      sizes[i] = Math.random() * 0.04 + 0.01
    }
    return { positions, colors, sizes }
  }, [count])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t = clock.getElapsedTime()
    pointsRef.current.rotation.y = t * 0.018
    pointsRef.current.rotation.x = Math.sin(t * 0.008) * 0.04
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
        <bufferAttribute attach="attributes-size"     args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        transparent
        opacity={0.55}
        sizeAttenuation
        size={0.06}
        depthWrite={false}
      />
    </points>
  )
}
