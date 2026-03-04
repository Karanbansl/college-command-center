'use client'

import { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  Layout, CalendarCheck, BookOpen, Library,
  ClipboardList, Briefcase, ExternalLink, Link2, GraduationCap,
  FlaskConical, Globe, FileCheck,
} from 'lucide-react'
import type { UniversityLink } from '@/lib/data'

// Each portal gets its own distinct gradient so they're visually distinct
const portalPalettes = [
  { from: '#7c3aed', to: '#4f46e5', glow: 'rgba(124,58,237,0.4)', text: '#c4b5fd' },
  { from: '#0e7490', to: '#0891b2', glow: 'rgba(14,116,144,0.35)', text: '#67e8f9' },
  { from: '#be185d', to: '#db2777', glow: 'rgba(190,24,93,0.35)', text: '#f9a8d4' },
  { from: '#065f46', to: '#059669', glow: 'rgba(6,95,70,0.35)', text: '#6ee7b7' },
  { from: '#92400e', to: '#d97706', glow: 'rgba(146,64,14,0.35)', text: '#fcd34d' },
  { from: '#1e3a5f', to: '#2563eb', glow: 'rgba(30,58,95,0.35)', text: '#93c5fd' },
  { from: '#4a044e', to: '#a21caf', glow: 'rgba(74,4,78,0.35)', text: '#e879f9' },
  { from: '#7f1d1d', to: '#dc2626', glow: 'rgba(127,29,29,0.35)', text: '#fca5a5' },
]

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Layout, CalendarCheck, BookOpen, Library, ClipboardList,
  Briefcase, GraduationCap, FlaskConical, Globe, FileCheck,
}

interface QuickAccessNodeProps {
  links: UniversityLink[]
}

// Individual portal card with tilt effect
function PortalCard({ link, index }: { link: UniversityLink; index: number }) {
  const palette = portalPalettes[index % portalPalettes.length]
  const Icon = iconMap[link.icon] || Layout
  const [hovered, setHovered] = useState(false)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const springX = useSpring(mx, { stiffness: 200, damping: 18 })
  const springY = useSpring(my, { stiffness: 200, damping: 18 })
  const rotateX = useTransform(springY, [-0.5, 0.5], ['10deg', '-10deg'])
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-10deg', '10deg'])

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      id={`quick-link-${link.id}`}
      aria-label={`${link.title}: ${link.description}`}
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.23, 1, 0.32, 1] }}
      style={{ perspective: 800, textDecoration: 'none', display: 'block' }}
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - rect.left) / rect.width - 0.5)
        my.set((e.clientY - rect.top) / rect.height - 0.5)
        setHovered(true)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); setHovered(false) }}
    >
      <motion.div
        style={{
          rotateX, rotateY,
          transformStyle: 'preserve-3d',
          padding: '14px 13px',
          borderRadius: 14,
          background: `linear-gradient(135deg, rgba(${hexToRgb(palette.from)},0.18) 0%, rgba(${hexToRgb(palette.to)},0.1) 100%)`,
          border: `1px solid rgba(${hexToRgb(palette.from)},0.25)`,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: hovered ? `0 8px 30px ${palette.glow}` : '0 2px 8px rgba(0,0,0,0.2)',
          transition: 'box-shadow 0.25s ease',
        }}
      >
        {/* Background shimmer on hover */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 50% 0%, rgba(${hexToRgb(palette.from)},0.25) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
          background: `linear-gradient(90deg, transparent, rgba(${hexToRgb(palette.from)},0.6), transparent)`,
        }} />

        {/* Icon + title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
          {/* Icon tile */}
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px ${palette.glow}`,
          }}>
            <Icon size={17} style={{ color: '#fff' }} />
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontSize: 13, fontWeight: 700, color: '#fff',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {link.title}
            </p>
            {link.description && (
              <p style={{
                fontSize: 11, color: 'rgba(255,255,255,0.4)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                marginTop: 1,
              }}>
                {link.description}
              </p>
            )}
          </div>

          <ExternalLink size={12} style={{ color: palette.text, opacity: hovered ? 0.9 : 0.4, transition: 'opacity 0.2s', flexShrink: 0 }} />
        </div>
      </motion.div>
    </motion.a>
  )
}

// Hex → "r,g,b" for rgba()
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

export default function QuickAccessNode({ links }: QuickAccessNodeProps) {
  return (
    <nav aria-label="Quick Access Links" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Header */}
      <div style={{ marginBottom: 8, paddingLeft: 2 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'rgba(139,92,246,0.65)',
        }}>
          Quick Access
        </span>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 2, letterSpacing: '-0.01em' }}>
          University Portals
        </h2>
      </div>

      {/* Empty state */}
      {links.length === 0 && (
        <div style={{
          padding: '20px 14px', borderRadius: 14,
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.07)',
          textAlign: 'center',
        }}>
          <Link2 size={20} style={{ color: 'rgba(255,255,255,0.12)', margin: '0 auto 8px' }} />
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>No portals added yet</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 3 }}>Add links from the admin panel</p>
        </div>
      )}

      {/* Portal tiles */}
      {links.map((link, i) => (
        <PortalCard key={link.id} link={link} index={i} />
      ))}

      {/* Footer kbd hint */}
      <div style={{ marginTop: 12, paddingLeft: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, rgba(139,92,246,0.12), transparent)' }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>
          <kbd style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '1px 5px', color: 'rgba(255,255,255,0.3)' }}>⌘K</kbd> to search
        </span>
      </div>
    </nav>
  )
}
