'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
import { ChevronDown, Sparkles, Zap } from 'lucide-react'

const ThreeScene = dynamic(() => import('./WebGLCanvasComponent'), {
  ssr: false,
  loading: () => null,
})

export default function HeroSection() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    setMousePos({ x, y })
  }

  const words = ['Academic', 'Intelligence', 'Hub.']

  return (
    <motion.section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{ opacity: heroOpacity, scale: heroScale }}
      aria-label="Hero section"
    >
      {/* 3D Background */}
      <ThreeScene mousePos={mousePos} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-obsidian-950/10 to-[#030308] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030308]/40 via-transparent to-[#030308]/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center mb-6"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-violet-500/25 text-xs text-violet-300/80">
            <Sparkles size={12} className="text-violet-400" />
            <span>Your College Resource Command Center</span>
            <Sparkles size={12} className="text-violet-400" />
          </div>
        </motion.div>

        {/* Main headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-none">
          <motion.span
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="block text-white"
          >
            Your
          </motion.span>
          <span className="block">
            {words.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 40, filter: 'blur(15px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.4 + i * 0.12, ease: [0.23, 1, 0.32, 1] }}
                className={`inline-block mr-3 ${
                  i === 1 ? 'gradient-text' : 'text-white'
                }`}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-lg sm:text-xl text-white/45 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          All your study material, official portals, and academic resources — 
          organized beautifully in one premium command center.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <motion.a
            href="#resources"
            id="hero-cta-resources"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500
                       text-white font-semibold text-sm shadow-glow-violet hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] 
                       transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Browse Resources"
          >
            <Zap size={15} />
            Browse Resources
          </motion.a>

          <motion.a
            href="#quick-links"
            id="hero-cta-portals"
            className="flex items-center gap-2 px-6 py-3 rounded-xl glass-card border border-white/10
                       text-white/70 font-medium text-sm hover:text-white hover:border-white/20 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            aria-label="University Portals"
          >
            University Portals →
          </motion.a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex items-center justify-center gap-8 mt-16 text-center"
        >
          {[
            { value: '12+', label: 'Resources' },
            { value: '6', label: 'Portals' },
            { value: '8', label: 'Subjects' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + i * 0.1 }}
              className="flex flex-col items-center"
            >
              <span className="text-2xl font-bold gradient-text">{stat.value}</span>
              <span className="text-xs text-white/35 mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-xs text-white/30 tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={16} className="text-white/30" />
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
