'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Sparkles } from 'lucide-react'

const ThreeScene = dynamic(() => import('./WebGLCanvasComponent'), {
  ssr: false,
  loading: () => null,
})

export default function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    setMousePos({ x, y })
  }

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative overflow-hidden"
      style={{ height: 'clamp(220px, 42vh, 380px)' }}
      onMouseMove={handleMouseMove}
      aria-label="Hero section"
    >
      {/* 3D sphere — pinned to right side */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-80">
          <ThreeScene mousePos={mousePos} />
        </div>
      </div>

      {/* Gradient veil over sphere so text is readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#030308] via-[#030308]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030308]/60 pointer-events-none" />

      {/* Text content — left side */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 max-w-2xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2 mb-4 w-fit"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-violet-500/25 text-xs text-violet-300/80">
            <Sparkles size={10} className="text-violet-400" />
            <span>One stop college resources for CoE students!</span>
            <Sparkles size={10} className="text-violet-400" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none mb-3"
        >
          <span className="text-white block">Your Academic</span>
          <span className="gradient-text block mt-1">Intelligence Hub.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-sm text-white/40 leading-relaxed font-light"
        >
          Study materials, official portals, and academic resources — organized beautifully in one place.
        </motion.p>
      </div>
    </section>
  )
}
