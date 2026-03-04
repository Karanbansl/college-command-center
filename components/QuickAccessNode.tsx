'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Layout, CalendarCheck, BookOpen, Library,
  ClipboardList, Briefcase, ExternalLink, Link2,
} from 'lucide-react'
import type { UniversityLink } from '@/lib/data'

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Layout, CalendarCheck, BookOpen, Library, ClipboardList, Briefcase,
}

interface QuickAccessNodeProps {
  links: UniversityLink[]
}

export default function QuickAccessNode({ links }: QuickAccessNodeProps) {
  return (
    <nav aria-label="Quick Access Links" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Section header */}
      <div style={{ marginBottom: 12, paddingLeft: 4 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'rgba(139,92,246,0.6)',
        }}>
          Quick Links
        </span>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginTop: 3 }}>
          University Portals
        </h2>
      </div>

      {/* Link items */}
      {links.length === 0 && (
        <div style={{
          padding: '12px 14px', borderRadius: 12,
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.06)',
          textAlign: 'center',
        }}>
          <Link2 size={18} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 6px' }} />
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>No links added yet</p>
        </div>
      )}

      {links.map((link, i) => {
        const Icon = iconMap[link.icon] || Layout
        return (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            id={`quick-link-${link.id}`}
            aria-label={`${link.title}: ${link.description}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ x: 3 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 12px', borderRadius: 12,
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.055)',
              textDecoration: 'none', cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s',
              group: 'true',
            } as React.CSSProperties}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(139,92,246,0.12)'
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)'
            }}
          >
            {/* Icon */}
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(109,40,217,0.5), rgba(124,58,237,0.4))',
              border: '1px solid rgba(139,92,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={15} style={{ color: '#c4b5fd' }} />
            </div>

            {/* Text */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {link.title}
              </p>
              {link.description && (
                <p style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.3)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  marginTop: 1,
                }}>
                  {link.description}
                </p>
              )}
            </div>

            {/* Arrow */}
            <ExternalLink size={12} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
          </motion.a>
        )
      })}

      {/* Decorative divider */}
      <div style={{
        marginTop: 20, marginBottom: 8,
        height: 1, background: 'linear-gradient(90deg, rgba(139,92,246,0.15), transparent)',
      }} />
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', paddingLeft: 4 }}>
        Tip: Use <kbd style={{
          fontSize: 10, background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
          padding: '1px 5px', color: 'rgba(255,255,255,0.35)',
        }}>⌘K</kbd> to search
      </p>
    </nav>
  )
}
