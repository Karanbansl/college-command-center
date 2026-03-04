'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Layout,
  CalendarCheck,
  BookOpen,
  Library,
  ClipboardList,
  Briefcase,
  ExternalLink,
} from 'lucide-react'
import type { UniversityLink } from '@/lib/data'

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Layout,
  CalendarCheck,
  BookOpen,
  Library,
  ClipboardList,
  Briefcase,
}

interface QuickAccessNodeProps {
  links: UniversityLink[]
}

export default function QuickAccessNode({ links }: QuickAccessNodeProps) {
  return (
    <section id="quick-links" className="py-20 px-4" aria-label="Quick Access Links">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-semibold tracking-[0.2em] text-violet-400/70 uppercase mb-3 block">
            Quick Access
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Official University <span className="gradient-text">Links</span>
          </h2>
          <p className="text-white/40 max-w-md mx-auto text-sm">
            Instant access to all your essential university portals and services
          </p>
        </motion.div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {links.map((link, i) => {
            const Icon = iconMap[link.icon] || Layout
            return (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                id={`quick-link-${link.id}`}
                aria-label={`${link.title} - ${link.description}`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.23, 1, 0.32, 1],
                }}
                whileHover={{ y: -6, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl glass-card relative
                           hover:border-white/15 transition-all duration-300 text-center"
                style={{
                  boxShadow: undefined,
                }}
              >
                {/* Glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, ${link.glowColor.replace('0.4', '0.08')} 0%, transparent 70%)`,
                    boxShadow: `0 0 30px ${link.glowColor.replace('0.4', '0.15')}`,
                  }}
                />

                {/* Icon */}
                <motion.div
                  className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} 
                              flex items-center justify-center shadow-lg`}
                  style={{
                    boxShadow: `0 4px 20px ${link.glowColor}`,
                  }}
                  whileHover={{
                    boxShadow: `0 8px 35px ${link.glowColor.replace('0.4', '0.7')}`,
                  }}
                >
                  <Icon size={20} className="text-white" />

                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ border: `1px solid ${link.glowColor}` }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                  />
                </motion.div>

                {/* Text */}
                <div>
                  <p className="text-xs font-semibold text-white/90 leading-tight mb-1">
                    {link.title}
                  </p>
                  <p className="text-[10px] text-white/35 leading-tight hidden sm:block">
                    {link.description}
                  </p>
                </div>

                {/* External icon */}
                <ExternalLink
                  size={10}
                  className="text-white/20 group-hover:text-white/50 transition-colors absolute top-3 right-3"
                />
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
