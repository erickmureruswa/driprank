import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function SceneLights() {
  const limeRef = useRef()
  const blueRef = useRef()
  const magentaRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (limeRef.current) {
      limeRef.current.position.x = Math.sin(t * 0.45) * 5
      limeRef.current.position.y = 2 + Math.cos(t * 0.3) * 2
    }
    if (blueRef.current) {
      blueRef.current.position.x = Math.cos(t * 0.38) * 6
      blueRef.current.position.z = 3 + Math.sin(t * 0.55) * 2
    }
    if (magentaRef.current) {
      magentaRef.current.position.x = Math.sin(t * 0.65 + 2) * 4
      magentaRef.current.position.y = -1 + Math.cos(t * 0.42 + 1) * 2
    }
  })

  return (
    <>
      <ambientLight intensity={0.08} />
      <pointLight
        ref={limeRef}
        position={[3, 4, 4]}
        intensity={40}
        color="#B6FF00"
        distance={18}
        decay={2}
      />
      <pointLight
        ref={blueRef}
        position={[-5, 1, 5]}
        intensity={35}
        color="#00D1FF"
        distance={20}
        decay={2}
      />
      <pointLight
        ref={magentaRef}
        position={[0, -3, 5]}
        intensity={28}
        color="#FF006E"
        distance={16}
        decay={2}
      />
      <directionalLight
        position={[0, 8, 6]}
        intensity={0.4}
        color="#F5F5F5"
      />
    </>
  )
}
