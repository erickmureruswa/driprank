import { useRef, useMemo, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Decal } from '@react-three/drei'
import * as THREE from 'three'
import { useStudioStore } from '../../store/studioStore'

/* ─────────────────────────────────────────
   Geometry
   ExtrudeGeometry: shape at z=0, extrudes to z=depth.
   Back cap  = z=0 face (away from camera).
   Front cap = z=depth face (facing camera at +Z).
   Front-face decals → position z slightly above depth (0.12).
───────────────────────────────────────── */
const DEPTH = 0.12
const DECAL_Z = DEPTH + 0.01   // just above front cap

function buildShirtShape() {
  const s = new THREE.Shape()
  s.moveTo(-0.5, -1.05)
  s.lineTo( 0.5, -1.05)
  s.lineTo( 0.5,  0.10)
  s.lineTo( 0.95, 0.10)
  s.bezierCurveTo( 1.18, 0.10,  1.38, 0.28,  1.42,  0.54)
  s.lineTo( 1.02,  0.74)
  s.bezierCurveTo( 0.90, 0.50,  0.70, 0.38,  0.52,  0.30)
  s.bezierCurveTo( 0.38, 0.62,  0.18, 0.80,  0.00,  0.82)
  s.bezierCurveTo(-0.18, 0.80, -0.38, 0.62, -0.52,  0.30)
  s.bezierCurveTo(-0.70, 0.38, -0.90, 0.50, -1.02,  0.74)
  s.lineTo(-1.42,  0.54)
  s.bezierCurveTo(-1.38, 0.28, -1.18, 0.10, -0.95,  0.10)
  s.lineTo(-0.5,  0.10)
  s.lineTo(-0.5, -1.05)
  return s
}

function buildGeometry(shape) {
  return new THREE.ExtrudeGeometry(shape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelSegments: 6,
    bevelSize: 0.022,
    bevelThickness: 0.022,
  })
}

/* ─────────────────────────────────────────
   Single decal layer
───────────────────────────────────────── */
function DecalLayer({ layer, isActive, onSelectAndDrag }) {
  if (!layer.texture || !layer.visible) return null

  const scaleX = layer.scale * (layer.aspect ?? 1)
  const scaleY = layer.scale

  return (
    <Decal
      position={layer.position}
      rotation={[0, 0, layer.rotationZ]}
      scale={[scaleX, scaleY, 0.3]}
      onPointerDown={(e) => {
        e.stopPropagation()
        onSelectAndDrag(layer.id)
      }}
    >
      <meshStandardMaterial
        map={layer.texture}
        transparent
        opacity={layer.opacity}
        depthTest={false}
        polygonOffset
        polygonOffsetFactor={-8}
        side={THREE.FrontSide}
        roughness={0.8}
        color="#ffffff"
        emissive={isActive ? new THREE.Color('#B6FF00') : new THREE.Color(0)}
        emissiveIntensity={isActive ? 0.08 : 0}
      />
    </Decal>
  )
}

/* ─────────────────────────────────────────
   Main shirt mesh + interaction logic
───────────────────────────────────────── */
export default function TShirtMesh({ orbitRef }) {
  const meshRef  = useRef()
  const { camera, gl } = useThree()
  const rc       = useMemo(() => new THREE.Raycaster(), [])

  const {
    shirtColor, layers, activeLayerId,
    selectLayer, deselectAll,
    updateLayer,
  } = useStudioStore()

  /* ── Geometry + materials (memoised) ── */
  const shape    = useMemo(() => buildShirtShape(), [])
  const geometry = useMemo(() => buildGeometry(shape), [shape])

  const frontMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    roughness: 0.78,
    metalness: 0.02,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
  }), [])

  const sideMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    roughness: 0.82,
    metalness: 0.02,
  }), [])

  /* Keep colours in sync with store */
  useEffect(() => {
    const c = new THREE.Color(shirtColor)
    frontMat.color.copy(c); frontMat.needsUpdate = true
    sideMat.color.copy(c);  sideMat.needsUpdate  = true
  }, [shirtColor, frontMat, sideMat])

  /* ── Drag state (refs = no re-renders during drag) ── */
  const dragLayerId = useRef(null)
  const lastMoveTs  = useRef(0)

  /* Convert canvas pointer → NDC → raycast → mesh-local point */
  const getLocalHit = useCallback((clientX, clientY) => {
    const canvas = gl.domElement
    const rect   = canvas.getBoundingClientRect()
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width)  *  2 - 1,
      ((clientY - rect.top)  / rect.height) * -2 + 1,
    )
    rc.setFromCamera(ndc, camera)
    const hits = rc.intersectObject(meshRef.current, false)
    if (!hits.length) return null
    return meshRef.current.worldToLocal(hits[0].point.clone())
  }, [camera, gl, rc])

  /* ── Global pointer-move / up handlers (added when drag starts) ── */
  useEffect(() => {
    const canvas = gl.domElement

    const onMove = (e) => {
      if (!dragLayerId.current) return
      const now = performance.now()
      if (now - lastMoveTs.current < 14) return  // ~70 fps cap
      lastMoveTs.current = now

      const cx = e.touches ? e.touches[0].clientX : e.clientX
      const cy = e.touches ? e.touches[0].clientY : e.clientY
      const local = getLocalHit(cx, cy)
      if (local) {
        updateLayer(dragLayerId.current, { position: [local.x, local.y, DECAL_Z] })
      }
    }

    const onUp = () => {
      if (dragLayerId.current) {
        dragLayerId.current = null
        if (orbitRef?.current) orbitRef.current.enabled = true
      }
    }

    /* ── Two-finger pinch / rotate ── */
    let prevPinch = null

    const onTouchMove = (e) => {
      if (e.touches.length !== 2) { prevPinch = null; return }
      e.preventDefault()

      const t0 = e.touches[0], t1 = e.touches[1]
      const dist  = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY)
      const angle = Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX)

      if (prevPinch) {
        const store = useStudioStore.getState()
        const id    = store.activeLayerId
        if (id) {
          const l = store.layers.find((x) => x.id === id)
          if (l) {
            store.updateLayer(id, {
              scale:     THREE.MathUtils.clamp(l.scale * (dist / prevPinch.dist), 0.07, 1.9),
              rotationZ: l.rotationZ + (angle - prevPinch.angle),
            })
          }
        }
      }
      prevPinch = { dist, angle }
    }

    const onTouchEnd = () => { prevPinch = null }

    canvas.addEventListener('pointermove', onMove, { passive: true })
    canvas.addEventListener('pointerup',   onUp)
    canvas.addEventListener('touchmove',   onTouchMove, { passive: false })
    canvas.addEventListener('touchend',    onTouchEnd)

    return () => {
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup',   onUp)
      canvas.removeEventListener('touchmove',   onTouchMove)
      canvas.removeEventListener('touchend',    onTouchEnd)
    }
  }, [gl, orbitRef, getLocalHit, updateLayer])

  /* ── startDrag (called from DecalLayer) ── */
  const startDrag = useCallback((layerId) => {
    dragLayerId.current = layerId
    if (orbitRef?.current) orbitRef.current.enabled = false
    selectLayer(layerId)
  }, [orbitRef, selectLayer])

  /* ── Click on shirt body (not a decal) ── */
  const onMeshPointerDown = useCallback((e) => {
    e.stopPropagation()
    deselectAll()
  }, [deselectAll])

  /* ── Subtle idle sway ── */
  const timeRef = useRef(0)
  useFrame((_, delta) => {
    if (!meshRef.current || dragLayerId.current) return
    timeRef.current += delta * 0.35
    meshRef.current.rotation.y = Math.sin(timeRef.current) * 0.06
  })

  return (
    /* ExtrudeGeometry groups: 0=sides, 1=front cap, 2=back cap */
    <mesh
      ref={meshRef}
      geometry={geometry}
      onPointerDown={onMeshPointerDown}
      position={[0, 0, 0]}
    >
      <primitive object={sideMat}  attach="material-0" />
      <primitive object={frontMat} attach="material-1" />
      <primitive object={sideMat}  attach="material-2" />

      {layers.map((layer) => (
        <DecalLayer
          key={layer.id}
          layer={layer}
          isActive={layer.id === activeLayerId}
          onSelectAndDrag={startDrag}
        />
      ))}
    </mesh>
  )
}
