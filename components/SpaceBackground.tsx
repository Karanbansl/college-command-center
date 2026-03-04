'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SpaceBackgroundProps {
  count?: number
}

export default function SpaceBackground({ count = 4000 }: SpaceBackgroundProps) {
  const pointsRef = useRef<THREE.Points>(null)

  // Generate random star positions in a sphere
  const [positions, scales] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Distribute points in a wide spherical volume
      const r = 400 * Math.cbrt(Math.random())
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // Randomize star sizes slightly
      scales[i] = Math.random()
    }

    return [positions, scales]
  }, [count])

  // Slowly rotate the entire star field
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.005
    }
  })

  // Generate a soft circular glow texture dynamically
  const particleTexture = useMemo(() => {
    if (typeof window === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const context = canvas.getContext('2d')
    if (context) {
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(0.2, 'rgba(240, 248, 255, 0.8)')
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)')
      gradient.addColorStop(1, 'rgba(3, 3, 18, 0)')
      context.fillStyle = gradient
      context.fillRect(0, 0, 32, 32)
    }
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-scale"
          args={[scales, 1]}
          count={scales.length}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2.2}
        sizeAttenuation={true}
        color="#ffffff"
        map={particleTexture}
        transparent={true}
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={true}
      />
    </points>
  )
}
