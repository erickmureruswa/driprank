import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import TShirtMesh from './TShirtMesh'

function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[ 4,  6,  5]} intensity={1.3} color="#F5F5F5" castShadow />
      <directionalLight position={[-3,  3,  3]} intensity={0.45} color="#B6FF00" />
      <pointLight        position={[ 0, -3,  5]} intensity={10}  color="#00D1FF" distance={14} decay={2} />
      <pointLight        position={[ 3,  2,  4]} intensity={8}   color="#FF006E" distance={12} decay={2} />
    </>
  )
}

export default function StudioCanvas() {
  const orbitRef = useRef()
  const isMobile = window.innerWidth < 768

  return (
    <Canvas
      camera={{ position: [0, -0.1, 5.5], fov: isMobile ? 56 : 42, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      className="w-full h-full"
    >
      <color attach="background" args={['#0D0D0D']} />
      <fog   attach="fog"        args={['#0D0D0D', 18, 40]} />

      <Suspense fallback={null}>
        <StudioLights />

        {/* The mesh manages its own drag logic and needs the orbit ref to disable/enable it */}
        <TShirtMesh orbitRef={orbitRef} />

        <OrbitControls
          ref={orbitRef}
          enableZoom={true}
          enablePan={false}
          minDistance={2.8}
          maxDistance={10}
          minPolarAngle={Math.PI * 0.18}
          maxPolarAngle={Math.PI * 0.82}
          rotateSpeed={0.75}
          zoomSpeed={0.55}
          makeDefault
        />

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.45}
            luminanceSmoothing={0.7}
            intensity={0.55}
            radius={0.45}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
