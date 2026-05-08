import { useRef, useMemo, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDesignStore } from '../../store/designStore'

/* ── Geometry (same silhouette as landing scene) ── */
function buildGeo() {
  const s = new THREE.Shape()
  s.moveTo(-0.5, -1.0)
  s.lineTo( 0.5, -1.0)
  s.lineTo( 0.5,  0.15)
  s.lineTo( 0.9,  0.15)
  s.bezierCurveTo( 1.15, 0.15,  1.35, 0.30,  1.40,  0.52)
  s.lineTo( 1.0,  0.72)
  s.bezierCurveTo( 0.88, 0.48,  0.68, 0.36,  0.50,  0.28)
  s.bezierCurveTo( 0.36, 0.60,  0.18, 0.78,  0.00,  0.80)
  s.bezierCurveTo(-0.18, 0.78, -0.36, 0.60, -0.50,  0.28)
  s.bezierCurveTo(-0.68, 0.36, -0.88, 0.48, -1.00,  0.72)
  s.lineTo(-1.40,  0.52)
  s.bezierCurveTo(-1.35, 0.30, -1.15, 0.15, -0.90,  0.15)
  s.lineTo(-0.5,  0.15)
  s.lineTo(-0.5, -1.0)

  return new THREE.ExtrudeGeometry(s, {
    depth: 0.12,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.025,
    bevelThickness: 0.025,
  })
}

/* ── Canvas texture drawing ── */
const W = 1024, H = 1024

function getContrast(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  const lum = (0.299*r + 0.587*g + 0.114*b) / 255
  return lum > 0.5 ? '#000000' : '#FFFFFF'
}

function drawDesign(ctx, { shirtColor, text, textColor, font, sticker, uploadedImage, imgEl }) {
  ctx.clearRect(0, 0, W, H)

  // Fabric base
  ctx.fillStyle = shirtColor
  ctx.fillRect(0, 0, W, H)

  // Subtle fabric noise
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const a = Math.random() * 0.04
    ctx.fillStyle = `rgba(0,0,0,${a})`
    ctx.fillRect(x, y, 1, 1)
  }

  // Uploaded image (centered, max 55% of canvas width)
  if (uploadedImage && imgEl?.complete) {
    const maxW = W * 0.55
    const maxH = H * 0.45
    const ratio = Math.min(maxW / imgEl.naturalWidth, maxH / imgEl.naturalHeight)
    const iw = imgEl.naturalWidth  * ratio
    const ih = imgEl.naturalHeight * ratio
    const ix = (W - iw) / 2
    const iy = H * 0.22
    ctx.globalAlpha = 0.92
    ctx.drawImage(imgEl, ix, iy, iw, ih)
    ctx.globalAlpha = 1
  }

  // Sticker (large emoji, upper chest)
  if (sticker) {
    ctx.font = `${H * 0.18}px serif`
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(sticker, W / 2, H * 0.36)
  }

  // Text overlay (lower chest / stomach)
  if (text.trim()) {
    const fontMap = {
      'Impact':          'Impact, Arial Narrow, sans-serif',
      'Barlow Condensed':'Barlow Condensed, Impact, sans-serif',
      'Courier New':     'Courier New, monospace',
      'Arial Black':     'Arial Black, sans-serif',
      'Georgia':         'Georgia, serif',
    }
    const size = Math.max(48, Math.min(100, Math.floor(W * 0.13)))
    ctx.font = `900 ${size}px ${fontMap[font] || font}`
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle    = textColor

    // Slight shadow for legibility
    ctx.shadowColor   = textColor === '#000000' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)'
    ctx.shadowBlur    = 8
    ctx.fillText(text.toUpperCase(), W / 2, sticker ? H * 0.72 : H * 0.60)
    ctx.shadowBlur = 0
  }
}

/* ── Component ── */
export default function TShirt3D() {
  const { shirtColor, text, textColor, font, sticker, uploadedImage } = useDesignStore()
  const meshRef = useRef()

  // Create canvas + texture once
  const canvas  = useMemo(() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c }, [])
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [canvas])

  // Track loaded image element
  const imgRef = useRef(null)
  useEffect(() => {
    if (uploadedImage) {
      const img = new Image()
      img.onload = () => { imgRef.current = img; texture.needsUpdate = true }
      img.src = uploadedImage
    } else {
      imgRef.current = null
    }
  }, [uploadedImage, texture])

  // Redraw canvas whenever design changes
  useEffect(() => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawDesign(ctx, { shirtColor, text, textColor, font, sticker, uploadedImage, imgEl: imgRef.current })
    texture.needsUpdate = true
  }, [shirtColor, text, textColor, font, sticker, uploadedImage, canvas, texture])

  // Materials — front face gets canvas texture, sides get solid colour
  const frontMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    map: texture,
    metalness: 0.05,
    roughness: 0.65,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
  }), [texture])

  const sideMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    metalness: 0.08,
    roughness: 0.75,
  }), [])

  // Keep side material colour in sync
  useEffect(() => {
    sideMat.color.set(shirtColor)
    sideMat.needsUpdate = true
  }, [shirtColor, sideMat])

  const geometry = useMemo(() => buildGeo(), [])

  // Gentle idle sway in studio (subtle, so user can examine)
  const time = useRef(0)
  useFrame((_, delta) => {
    if (!meshRef.current) return
    time.current += delta * 0.4
    meshRef.current.rotation.y = Math.sin(time.current) * 0.08
  })

  // ExtrudeGeometry groups: 0=front, 1=back, 2+=sides/bevel
  return (
    <mesh ref={meshRef} geometry={geometry}>
      <primitive object={frontMat} attach="material-0" />
      <primitive object={sideMat}  attach="material-1" />
      <primitive object={sideMat}  attach="material-2" />
    </mesh>
  )
}
