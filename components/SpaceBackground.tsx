'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useTheme } from 'next-themes'

interface SpaceBackgroundProps {
  count?: number
}

// ----------------------------------------------------------------------------
// PLANET COMPONENT
// ----------------------------------------------------------------------------
function Planet({ theme }: { theme?: string }) {
  const planetRef = useRef<THREE.Mesh>(null)
  const isLight = theme === 'light'

  // Slowly rotate the planet
  useFrame((state) => {
    if (planetRef.current) {
      planetRef.current.rotation.y = state.clock.elapsedTime * 0.03
    }
  })

  // We place the planet far back and off to the right
  return (
    <group position={[140, 70, -250]}>
      {/* Lighting to create a premium cinematic crescent effect */}
      <directionalLight 
        position={[-50, 30, 20]} 
        intensity={isLight ? 2 : 4} 
        color={isLight ? "#f8fafc" : "#8b5cf6"} 
      />
      <directionalLight 
        position={[50, -30, -20]} 
        intensity={isLight ? 1 : 0.5} 
        color={isLight ? "#e2e8f0" : "#06b6d4"} 
      />
      <ambientLight intensity={isLight ? 0.8 : 0.02} color="#ffffff" />

      {/* The solid dark/light body of the planet */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[60, 64, 64]} />
        <meshStandardMaterial
          color={isLight ? "#f1f5f9" : "#010108"}
          roughness={isLight ? 0.4 : 0.9}
          metalness={isLight ? 0.1 : 0.1}
        />
      </mesh>

      {/* The atmospheric glow layer */}
      <mesh>
        <sphereGeometry args={[62, 64, 64]} />
        <meshBasicMaterial
          color={isLight ? "#bae6fd" : "#8b5cf6"}
          transparent
          opacity={isLight ? 0.4 : 0.12}
          side={THREE.BackSide}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ----------------------------------------------------------------------------
// OCEAN & SUN COMPONENTS (LIGHT MODE)
// ----------------------------------------------------------------------------
function Sun({ opacity = 1 }: { opacity: number }) {
  return (
    <group visible={opacity > 0.01}>
      {/* Sun sphere */}
      <mesh position={[0, 40, -300]}>
        <sphereGeometry args={[40, 32, 32]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={opacity} fog={false} />
      </mesh>
      {/* Sun intense glow */}
      <mesh position={[0, 40, -305]}>
        <planeGeometry args={[250, 250]} />
        <meshBasicMaterial color="#fde047" transparent opacity={opacity * 0.4} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
      </mesh>
    </group>
  )
}

function Ocean({ opacity = 1 }: { opacity: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Custom wave animation
  useFrame((state) => {
    if (meshRef.current && meshRef.current.geometry) {
      const positionAttribute = meshRef.current.geometry.getAttribute('position')
      const vertex = new THREE.Vector3()
      const time = state.clock.elapsedTime

      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i)
        // Combine gentle sine waves for a rolling ocean effect
        const waveX = Math.sin(vertex.x * 0.05 + time * 0.8) * 2
        const waveY = Math.cos(vertex.y * 0.05 + time * 0.5) * 2
        vertex.z = waveX + waveY
        positionAttribute.setZ(i, vertex.z)
      }
      
      meshRef.current.geometry.computeVertexNormals()
      positionAttribute.needsUpdate = true
    }
  })

  return (
    <group visible={opacity > 0.01}>
      {/* Daylight lighting for the ocean */}
      <ambientLight intensity={1.5 * opacity} color="#ffffff" />
      <directionalLight 
        position={[100, 100, 50]} 
        intensity={3 * opacity} 
        color="#fefce8" 
      />
      
      <mesh 
        ref={meshRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -20, -50]}
      >
        {/* Very large plane with enough segments for smooth wave displacement */}
        <planeGeometry args={[800, 800, 64, 64]} />
        <meshPhysicalMaterial
          color="#0284c7"
          emissive="#0369a1"
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.8}
          transmission={0.9} // Glass-like water transparency
          thickness={5}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  )
}

// ----------------------------------------------------------------------------
// MAIN BACKGROUND EXPORT
// ----------------------------------------------------------------------------
export default function SpaceBackground({ count = 4000 }: SpaceBackgroundProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isLight = mounted && resolvedTheme === 'light'
  
  // Transition value: 0 = Dark (Space), 1 = Light (Ocean)
  const [transitionValue, setTransitionValue] = useState(isLight ? 1 : 0)

  useEffect(() => {
    setMounted(true)
    // Snap immediately to correct value on mount
    setTransitionValue(resolvedTheme === 'light' ? 1 : 0)
  }, [resolvedTheme])

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

  // Slowly rotate the entire star field and handle opacity transition
  useFrame((state, delta) => {
    // Smoothly interpolate the transition value over ~1.5 seconds
    const targetValue = isLight ? 1 : 0
    if (transitionValue !== targetValue) {
      const step = delta * 0.66 // 1.5 seconds to go from 0 to 1
      setTransitionValue((prev) => {
        const next = isLight ? prev + step : prev - step
        return Math.max(0, Math.min(1, next))
      })
    }

    // Always rotate stars even if invisible, so they keep moving
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.005
    }
  })

  const spaceOpacity = 1 - transitionValue
  const oceanOpacity = transitionValue

  // Generate a soft circular glow texture dynamically (solid white, opacity handled by material)
  const particleTexture = useMemo(() => {
    if (typeof window === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const context = canvas.getContext('2d')
    if (context) {
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16)
      // Base glowing stars for dark mode
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

  if (!mounted) return null

  return (
    <group>
      {/* 3D Planet (Dark Mode Only) */}
      <group visible={spaceOpacity > 0.01}>
        <Planet theme="dark" />
      </group>

      {/* 3D Ocean & Sun (Light Mode Only) */}
      <Ocean opacity={oceanOpacity} />
      <Sun opacity={oceanOpacity} />

      {/* Starfield Particles (Dark Mode Only) */}
      <points ref={pointsRef} visible={spaceOpacity > 0.01}>
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
          opacity={0.8 * spaceOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={true}
        />
      </points>
    </group>
  )
}
