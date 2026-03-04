'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function WebGLCanvasComponent({ mousePos }: { mousePos: { x: number; y: number } }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mousePosRef = useRef(mousePos)

  useEffect(() => {
    mousePosRef.current = mousePos
  }, [mousePos])

  useEffect(() => {
    if (!containerRef.current) return

    // Renderer setup with absolute transparent background
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0) // Transparent
    containerRef.current.appendChild(renderer.domElement)

    // Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
    camera.position.z = 6

    // Enhanced Lighting matching CSS token colors
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(ambientLight)
    
    // Violet glow
    const pointLight1 = new THREE.PointLight(0xa78bfa, 2.0)
    pointLight1.position.set(10, 10, 10)
    scene.add(pointLight1)
    
    // Cyan counter-glow
    const pointLight2 = new THREE.PointLight(0x22d3ee, 1.2)
    pointLight2.position.set(-10, -10, -10)
    scene.add(pointLight2)

    // Stars matching background mesh
    const starPositions = new Float32Array(3000 * 3)
    for (let i = 0; i < 3000; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 200
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 200
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 200
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMaterial = new THREE.PointsMaterial({ size: 0.15, color: 0xffffff, transparent: true, opacity: 0.5 })
    const stars = new THREE.Points(starGeometry, starMaterial)
    scene.add(stars)

    // Main central Crystalline Sphere
    const sphereGeo = new THREE.IcosahedronGeometry(1.4, 6)
    const posAttr = sphereGeo.attributes.position
    
    // Add organic distortion to vertices
    for (let i = 0; i < posAttr.count; i++) {
      const noise = (Math.random() - 0.5) * 0.18
      posAttr.setXYZ(i, posAttr.getX(i) + noise, posAttr.getY(i) + noise, posAttr.getZ(i) + noise)
    }
    posAttr.needsUpdate = true
    sphereGeo.computeVertexNormals()

    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x7c3aed, // Violet 600
      emissive: 0x3b1d8a,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    })
    const sphere = new THREE.Mesh(sphereGeo, sphereMat)
    scene.add(sphere)

    // Inner glowing core
    const innerGeo = new THREE.SphereGeometry(1.2, 32, 32)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x6d28d9, // Violet 700
      transparent: true,
      opacity: 0.25,
    })
    const innerSphere = new THREE.Mesh(innerGeo, innerMat)
    scene.add(innerSphere)

    // Outer orbital rings
    const ring1Geo = new THREE.TorusGeometry(2.2, 0.015, 16, 100)
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4 })
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat)
    scene.add(ring1)

    const ring2Geo = new THREE.TorusGeometry(2.0, 0.01, 16, 100)
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.3 })
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat)
    ring2.rotation.x = Math.PI / 2
    scene.add(ring2)

    // Data-stream particle cloud
    const particlePositions = new Float32Array(600 * 3)
    const particleColors = new Float32Array(600 * 3)
    for (let i = 0; i < 600; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.5 + Math.random() * 2.5
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      particlePositions[i * 3 + 2] = r * Math.cos(phi)
      
      // Violet to Cyan color mix
      particleColors[i * 3] = 0.5 + Math.random() * 0.3 // R
      particleColors[i * 3 + 1] = 0.3 + Math.random() * 0.3 // G
      particleColors[i * 3 + 2] = 0.8 + Math.random() * 0.2 // B
    }
    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))
    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Handle container resize securely using ResizeObserver!
    const resizeCanvas = () => {
      if (!containerRef.current || !renderer) return
      const width = containerRef.current.clientWidth || window.innerWidth
      const height = containerRef.current.clientHeight || window.innerHeight
      if (width === 0 || height === 0) return // Skip 0-sizes
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    
    const observer = new ResizeObserver(() => resizeCanvas())
    observer.observe(containerRef.current)
    
    // Initial size check
    setTimeout(resizeCanvas, 50)

    // Touch support — map touch position to mouse-like coords
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      mousePosRef.current = {
        x: ((touch.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((touch.clientY - rect.top) / rect.height - 0.5) * 2,
      }
    }
    const handleTouchEnd = () => {
      mousePosRef.current = { x: 0, y: 0 }
    }
    const el = containerRef.current
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    el.addEventListener('touchend', handleTouchEnd)

    // Master Animation Loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = Date.now() * 0.001
      const floatOffset = Math.sin(t * 0.8) * 0.15

      // Mouse reactive rotation (springy/fluid)
      const target = mousePosRef.current
      sphere.rotation.x += (target.y * 0.5 + t * 0.1 - sphere.rotation.x) * 0.05
      sphere.rotation.y += (target.x * 0.5 + t * 0.15 - sphere.rotation.y) * 0.05
      
      // Floating motion
      sphere.position.y = floatOffset
      innerSphere.position.y = floatOffset
      innerSphere.rotation.y = t * 0.2

      // Orbital Rings
      ring1.rotation.y = -t * 0.2
      ring1.rotation.z = t * 0.1
      ring2.rotation.x = Math.PI / 2 + t * 0.15
      ring2.rotation.y = t * 0.08

      // Particles orbit
      particles.rotation.y = t * 0.05
      particles.rotation.x = Math.sin(t * 0.1) * 0.1

      // Very slow starfield drift
      stars.rotation.y = t * 0.005

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      observer.disconnect()
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
      
      // Safe cleanup of materials & geometries
      sphereGeo.dispose()
      sphereMat.dispose()
      renderer.dispose()
      
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full min-h-[500px]"
      style={{ zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}
