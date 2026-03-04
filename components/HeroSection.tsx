'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Sparkles, ExternalLink, Layout, CalendarCheck, BookOpen, Library, ClipboardList, Briefcase, GraduationCap, Globe } from 'lucide-react'
import type { UniversityLink } from '@/lib/data'

const ThreeScene = dynamic(() => import('./WebGLCanvasComponent'), {
  ssr: false,
  loading: () => null,
})

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Layout, CalendarCheck, BookOpen, Library, ClipboardList, Briefcase, GraduationCap, Globe,
}

// 8 distinct palettes for portal tiles
const palettes = [
  { from: '#7c3aed', to: '#4f46e5', glow: 'rgba(124,58,237,0.5)', text: '#c4b5fd' },
  { from: '#0e7490', to: '#0891b2', glow: 'rgba(8,145,178,0.5)', text: '#67e8f9' },
  { from: '#be185d', to: '#db2777', glow: 'rgba(219,39,119,0.5)', text: '#f9a8d4' },
  { from: '#065f46', to: '#059669', glow: 'rgba(5,150,105,0.5)', text: '#6ee7b7' },
  { from: '#92400e', to: '#d97706', glow: 'rgba(217,119,6,0.5)',  text: '#fcd34d' },
  { from: '#1e3a8a', to: '#2563eb', glow: 'rgba(37,99,235,0.5)', text: '#93c5fd' },
  { from: '#4a044e', to: '#a21caf', glow: 'rgba(162,28,175,0.5)', text: '#e879f9' },
  { from: '#7f1d1d', to: '#dc2626', glow: 'rgba(220,38,38,0.5)',  text: '#fca5a5' },
]

interface HeroSectionProps {
  links: UniversityLink[]
}

export default function HeroSection({ links }: HeroSectionProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    })
  }

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative overflow-hidden"
      style={{ minHeight: links.length > 0 ? 'clamp(280px, 52vh, 440px)' : 'clamp(220px, 42vh, 360px)' }}
      onMouseMove={handleMouseMove}
      aria-label="Hero section"
    >
      {/* 3D sphere pinned to right */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-75">
          <ThreeScene mousePos={mousePos} />
        </div>
      </div>

      {/* Gradient veils */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#030308] via-[#030308]/85 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#030308]/70 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between px-6 sm:px-10 py-8 max-w-7xl">
        {/* Top: Badge + Headline + Subtitle */}
        <div className="max-w-2xl">
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

          <motion.h1
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none mb-3"
          >
            <span className="text-white block">Everything You Need.</span>
            <span className="gradient-text block mt-1">Right Here.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-sm text-white/35 leading-relaxed font-light"
          >
            Notes, papers, portals, and every resource you need — all in one place.
          </motion.p>
        </div>

        {/* Bottom: Portal quick-access tiles */}
        {links.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{ marginTop: 24 }}
          >
            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, rgba(255,255,255,0.08), transparent)', maxWidth: 100 }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                University Portals
              </span>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)', maxWidth: 100 }} />
            </div>

            {/* Horizontal wrap tile row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, paddingBottom: 4 }}>
              {links.map((link, i) => {
                const palette = palettes[i % palettes.length]
                const Icon = iconMap[link.icon] || Layout
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`quick-link-${link.id}`}
                    aria-label={link.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: 0.5 + i * 0.07, ease: [0.23, 1, 0.32, 1] }}
                    whileHover={{ scale: 1.06, y: -3 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      padding: '14px 18px', borderRadius: 18, textDecoration: 'none',
                      background: `linear-gradient(135deg, rgba(${hexRgb(palette.from)},0.2) 0%, rgba(${hexRgb(palette.to)},0.1) 100%)`,
                      border: `1px solid rgba(${hexRgb(palette.from)},0.3)`,
                      minWidth: 100, maxWidth: 120,
                      boxShadow: `0 4px 20px rgba(${hexRgb(palette.from)},0.15)`,
                      cursor: 'pointer',
                      transition: 'box-shadow 0.25s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 30px ${palette.glow}` }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 4px 20px rgba(${hexRgb(palette.from)},0.15)` }}
                  >
                    {/* Icon bubble */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 14px ${palette.glow}`,
                    }}>
                      <Icon size={20} style={{ color: '#fff' }} />
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)',
                      textAlign: 'center', lineHeight: 1.3,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}>
                      {link.title}
                    </span>
                  </motion.a>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

function hexRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
