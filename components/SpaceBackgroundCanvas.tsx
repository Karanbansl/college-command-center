'use client'

import { Canvas } from '@react-three/fiber'
import SpaceBackground from './SpaceBackground'

export default function SpaceBackgroundCanvas() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'transparent' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 1000 }}
        style={{ width: '100vw', height: '100vh', background: 'transparent' }}
        gl={{ antialias: false, alpha: true }}
      >
        <fog attach="fog" args={['#010108', 200, 600]} />
        <SpaceBackground count={3000} />
      </Canvas>
    </div>
  )
}
