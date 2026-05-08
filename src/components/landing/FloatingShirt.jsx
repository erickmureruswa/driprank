import { useMemo, useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

function buildTShirtGeometry() {
  const s = new THREE.Shape()

  // Body — centered vertically at ~0
  s.moveTo(-0.5, -1.0)    // bottom-left
  s.lineTo( 0.5, -1.0)    // bottom-right
  s.lineTo( 0.5,  0.15)   // right body top

  // Right shoulder + sleeve
  s.lineTo( 0.9,  0.15)
  s.bezierCurveTo( 1.15, 0.15,  1.35, 0.3,  1.4,  0.52)
  s.lineTo( 1.0,  0.72)
  s.bezierCurveTo( 0.88, 0.48,  0.68, 0.36,  0.5,  0.28)

  // Neck (right → center → left) — smooth curve
  s.bezierCurveTo( 0.36, 0.60,  0.18, 0.78,  0.0,  0.80)
  s.bezierCurveTo(-0.18, 0.78, -0.36, 0.60, -0.5,  0.28)

  // Left sleeve + shoulder
  s.bezierCurveTo(-0.68, 0.36, -0.88, 0.48, -1.0,  0.72)
  s.lineTo(-1.4,  0.52)
  s.bezierCurveTo(-1.35, 0.3, -1.15, 0.15, -0.9,  0.15)
  s.lineTo(-0.5,  0.15)
  s.lineTo(-0.5, -1.0)    // close

  return new THREE.ExtrudeGeometry(s, {
    depth: 0.10,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.025,
    bevelThickness: 0.025,
  })
}

// Shared geometry across all shirt instances
let _sharedGeo = null
function getSharedGeo() {
  if (!_sharedGeo) _sharedGeo = buildTShirtGeometry()
  return _sharedGeo
}

export default function FloatingShirt({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = '#B6FF00',
  label = '',
  onClick,
}) {
  const meshRef   = useRef()
  const [hovered, setHovered] = useState(false)
  const phaseOff  = useMemo(() => Math.random() * Math.PI * 2, [])

  const geometry = useMemo(() => getSharedGeo(), [])

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color).multiplyScalar(0.12),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.35,
    metalness: 0.85,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    side: THREE.FrontSide,
  }), [color])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = clock.getElapsedTime()

    // Float
    mesh.position.y = position[1] + Math.sin(t * 0.75 + phaseOff) * 0.18

    // Gentle sway
    mesh.rotation.y = rotation[1] + Math.sin(t * 0.28 + phaseOff) * 0.22
    mesh.rotation.z = rotation[2] + Math.sin(t * 0.45 + phaseOff * 0.7) * 0.04

    // Emissive pulse
    material.emissiveIntensity = hovered
      ? 0.7 + Math.sin(t * 5) * 0.15
      : 0.28 + Math.sin(t * 1.4 + phaseOff) * 0.08
  })

  const onPointerEnter = useCallback((e) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
    if (meshRef.current) {
      gsap.to(meshRef.current.scale, {
        x: scale * 1.12, y: scale * 1.12, z: scale * 1.12,
        duration: 0.35, ease: 'back.out(2)',
      })
    }
  }, [scale])

  const onPointerLeave = useCallback(() => {
    setHovered(false)
    document.body.style.cursor = 'default'
    if (meshRef.current) {
      gsap.to(meshRef.current.scale, {
        x: scale, y: scale, z: scale,
        duration: 0.5, ease: 'elastic.out(1, 0.45)',
      })
    }
  }, [scale])

  const onPointerDown = useCallback((e) => {
    e.stopPropagation()
    if (!meshRef.current) return
    gsap.timeline()
      .to(meshRef.current.scale, {
        x: scale * 0.88, y: scale * 0.88, z: scale * 0.88,
        duration: 0.1, ease: 'power2.in',
      })
      .to(meshRef.current.scale, {
        x: scale * 1.08, y: scale * 1.08, z: scale * 1.08,
        duration: 0.3, ease: 'elastic.out(1.5, 0.4)',
        onComplete: () => onClick?.({ color, label }),
      })
  }, [scale, color, label, onClick])

  return (
    <mesh
      ref={meshRef}
      position={[position[0], position[1], position[2]]}
      rotation={[rotation[0], rotation[1], rotation[2]]}
      scale={[scale, scale, scale]}
      geometry={geometry}
      material={material}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
    />
  )
}
