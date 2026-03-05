'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

import { useTheme } from 'next-themes'

interface SpaceBackgroundProps {
  count?: number
}

// ----------------------------------------------------------------------------
// THEMED PLANET / SUN COMPONENT
// ----------------------------------------------------------------------------
function Planet({ isLight }: { isLight: boolean }) {
  const planetRef = useRef<THREE.Mesh>(null)
  
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const atmosMatRef = useRef<THREE.MeshBasicMaterial>(null)
  
  const dirLight1Ref = useRef<THREE.DirectionalLight>(null)
  const dirLight2Ref = useRef<THREE.DirectionalLight>(null)
  const ambLightRef = useRef<THREE.AmbientLight>(null)

  // Target values cached to prevent recreation
  const darkBodyColor = useMemo(() => new THREE.Color("#ffffff"), []) // Pure white realistic moon
  const lightBodyColor = useMemo(() => new THREE.Color("#fef08a"), [])
  const darkEmissive = useMemo(() => new THREE.Color("#000000"), [])
  const lightEmissive = useMemo(() => new THREE.Color("#facc15"), [])

  const darkAtmosColor = useMemo(() => new THREE.Color("#8b5cf6"), [])
  const lightAtmosColor = useMemo(() => new THREE.Color("#fde047"), [])

  const darkLight1 = useMemo(() => new THREE.Color("#8b5cf6"), [])
  const lightLight1 = useMemo(() => new THREE.Color("#ffffff"), [])
  
  const darkLight2 = useMemo(() => new THREE.Color("#06b6d4"), [])
  const lightLight2 = useMemo(() => new THREE.Color("#fef08a"), [])

  // Slowly rotate the planet and smoothly interpolate colors when theme changes
  useFrame((state, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y = state.clock.elapsedTime * 0.03
    }

    const dampSpeed = 3 // Controls the speed of the transition

    if (bodyMatRef.current) {
      bodyMatRef.current.color.lerp(isLight ? lightBodyColor : darkBodyColor, dampSpeed * delta)
      bodyMatRef.current.emissive.lerp(isLight ? lightEmissive : darkEmissive, dampSpeed * delta)
      bodyMatRef.current.emissiveIntensity = THREE.MathUtils.damp(bodyMatRef.current.emissiveIntensity, isLight ? 0.6 : 0, dampSpeed, delta)
    }

    if (atmosMatRef.current) {
      atmosMatRef.current.color.lerp(isLight ? lightAtmosColor : darkAtmosColor, dampSpeed * delta)
      atmosMatRef.current.opacity = THREE.MathUtils.damp(atmosMatRef.current.opacity, isLight ? 0.4 : 0.12, dampSpeed, delta)
    }

    if (dirLight1Ref.current) {
      dirLight1Ref.current.color.lerp(isLight ? lightLight1 : darkLight1, dampSpeed * delta)
      dirLight1Ref.current.intensity = THREE.MathUtils.damp(dirLight1Ref.current.intensity, isLight ? 2 : 4, dampSpeed, delta)
    }

    if (dirLight2Ref.current) {
      dirLight2Ref.current.color.lerp(isLight ? lightLight2 : darkLight2, dampSpeed * delta)
      dirLight2Ref.current.intensity = THREE.MathUtils.damp(dirLight2Ref.current.intensity, isLight ? 1 : 0.5, dampSpeed, delta)
    }

    if (ambLightRef.current) {
      ambLightRef.current.intensity = THREE.MathUtils.damp(ambLightRef.current.intensity, isLight ? 0.8 : 0.02, dampSpeed, delta)
    }
  })

  const moonTexture = useTexture('/moon-diffuse.jpg')

  // We place the planet far back and off to the right
  return (
    <group position={[80, 40, -250]}>
      {/* Dynamic Lighting */}
      <directionalLight ref={dirLight1Ref} position={[-50, 30, 20]} intensity={4} color="#8b5cf6" />
      <directionalLight ref={dirLight2Ref} position={[50, -30, -20]} intensity={0.5} color="#06b6d4" />
      <ambientLight ref={ambLightRef} intensity={0.05} color="#ffffff" />

      {/* The solid body (Dark Moon -> Bright Sun) */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[65, 64, 64]} />
        <meshStandardMaterial
          ref={bodyMatRef}
          color="#ffffff"
          map={moonTexture}
          roughness={0.9}
          metalness={0.1}
          emissive="#000000"
          emissiveIntensity={0}
        />
      </mesh>

      {/* The atmospheric glow layer */}
      <mesh>
        <sphereGeometry args={[62, 64, 64]} />
        <meshBasicMaterial
          ref={atmosMatRef}
          color="#8b5cf6"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
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
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const isLight = mounted && resolvedTheme === 'light'

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

  const pointsMatRef = useRef<THREE.PointsMaterial>(null)
  
  const darkStarColor = useMemo(() => new THREE.Color("#ffffff"), [])
  const lightStarColor = useMemo(() => new THREE.Color("#fcd34d"), []) // Warm sun-dust

  // Slowly rotate the entire star field and transition star colors
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.005
    }
    
    if (pointsMatRef.current) {
      pointsMatRef.current.color.lerp(isLight ? lightStarColor : darkStarColor, 3 * delta)
      pointsMatRef.current.opacity = THREE.MathUtils.damp(pointsMatRef.current.opacity, isLight ? 0.6 : 0.8, 3, delta)
    }
  })

  // Generate a soft circular glow texture dynamically (pure white, tinted by PointsMaterial)
  const particleTexture = useMemo(() => {
    if (typeof window === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const context = canvas.getContext('2d')
    if (context) {
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16)
      // Base pure white glowing stars (PointsMaterial will apply the tint)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)')
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      context.fillStyle = gradient
      context.fillRect(0, 0, 32, 32)
    }
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  if (!mounted) return null

  return (
    <group>
      {/* 3D Planet completely reactive to theme */}
      <Planet isLight={isLight} />

      {/* Starfield Particles */}
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
          ref={pointsMatRef}
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
    </group>
  )
}
