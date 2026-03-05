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
  const ambLightRef = useRef<THREE.AmbientLight>(null)
  const sunOverlayMatRef = useRef<THREE.MeshBasicMaterial>(null)

  // Target values cached to prevent recreation
  const darkBodyColor = useMemo(() => new THREE.Color("#ffffff"), []) // Pure white realistic moon
  const lightBodyColor = useMemo(() => new THREE.Color("#fef08a"), [])
  // Provide a tiny baseline emissive to prevent pure pitch-black shadowing
  const darkEmissive = useMemo(() => new THREE.Color("#222222"), [])
  const lightEmissive = useMemo(() => new THREE.Color("#facc15"), [])

  const darkAtmosColor = useMemo(() => new THREE.Color("#8b5cf6"), [])
  const lightAtmosColor = useMemo(() => new THREE.Color("#fde047"), [])

  // Use pure white light in Dark Mode to keep the Moon naturally white
  const darkLight1 = useMemo(() => new THREE.Color("#ffffff"), [])
  const lightLight1 = useMemo(() => new THREE.Color("#ffffff"), [])

  // Slowly rotate the planet and smoothly interpolate colors when theme changes
  useFrame((state, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y = state.clock.elapsedTime * 0.03
    }

    const dampSpeed = 3 // Controls the speed of the transition

    if (bodyMatRef.current) {
      bodyMatRef.current.color.lerp(isLight ? lightBodyColor : darkBodyColor, dampSpeed * delta)
      bodyMatRef.current.emissive.lerp(isLight ? lightEmissive : darkEmissive, dampSpeed * delta)
      bodyMatRef.current.emissiveIntensity = THREE.MathUtils.damp(bodyMatRef.current.emissiveIntensity, isLight ? 0.6 : 0.8, dampSpeed, delta)
    }

    if (atmosMatRef.current) {
      atmosMatRef.current.color.lerp(isLight ? lightAtmosColor : darkAtmosColor, dampSpeed * delta)
      atmosMatRef.current.opacity = THREE.MathUtils.damp(atmosMatRef.current.opacity, isLight ? 0.4 : 0.12, dampSpeed, delta)
    }

    if (sunOverlayMatRef.current) {
      // Fade in the pure sun overlay to completely hide craters in Light Mode
      sunOverlayMatRef.current.opacity = THREE.MathUtils.damp(sunOverlayMatRef.current.opacity, isLight ? 1 : 0, dampSpeed, delta)
    }

    if (dirLight1Ref.current) {
      dirLight1Ref.current.color.lerp(isLight ? lightLight1 : darkLight1, dampSpeed * delta)
      dirLight1Ref.current.intensity = THREE.MathUtils.damp(dirLight1Ref.current.intensity, isLight ? 2 : 4, dampSpeed, delta)
    }

    if (ambLightRef.current) {
      ambLightRef.current.intensity = THREE.MathUtils.damp(ambLightRef.current.intensity, isLight ? 0.8 : 0.4, dampSpeed, delta)
    }
  })

  const moonTexture = useTexture('/moon-diffuse.jpg')

  // Top-Left corner, reduced size. X is negative for left, Y is positive for top.
  return (
    <group position={[-110, 80, -250]}>
      {/* Dynamic Lighting */}
      {/* Target the light at the moon's position to illuminate its front-facing craters */}
      <directionalLight ref={dirLight1Ref} position={[-80, 100, 50]} intensity={4} color="#ffffff" />
      <ambientLight ref={ambLightRef} intensity={0.4} color="#ffffff" />

      {/* The solid body (Dark Moon -> Bright Sun) */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[50, 64, 64]} />
        <meshStandardMaterial
          ref={bodyMatRef}
          color="#ffffff"
          map={moonTexture}
          roughness={0.9}
          metalness={0.1}
          emissive="#222222"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* The pure Sun Overlay (Fades in over the Moon to hide craters) */}
      <mesh>
        <sphereGeometry args={[50.2, 64, 64]} />
        <meshBasicMaterial
          ref={sunOverlayMatRef}
          color="#facc15"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* The atmospheric glow layer */}
      <mesh>
        <sphereGeometry args={[47, 64, 64]} />
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
