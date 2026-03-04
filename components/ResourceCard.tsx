'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { FileText, Link2, ExternalLink, Tag, Calendar, HardDrive, ArrowUpRight, Play } from 'lucide-react'
import type { Resource } from '@/lib/data'

const typeConfig = {
  pdf: {
    icon: FileText,
    label: 'PDF',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    border: 'border-violet-500/20',
    glow: 'rgba(139, 92, 246, 0.22)',
    accent: '#8b5cf6',
    accentRgb: '139,92,246',
    shimmer: 'via-violet-400/60',
    tagBg: 'rgba(139,92,246,0.12)',
    tagColor: 'rgba(167,139,250,0.85)',
  },
  link: {
    icon: Link2,
    label: 'Link',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/20',
    glow: 'rgba(6, 182, 212, 0.22)',
    accent: '#06b6d4',
    accentRgb: '6,182,212',
    shimmer: 'via-cyan-400/60',
    tagBg: 'rgba(6,182,212,0.10)',
    tagColor: 'rgba(103,232,249,0.85)',
  },
  video: {
    icon: Play,
    label: 'Video',
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/20',
    glow: 'rgba(244, 63, 94, 0.22)',
    accent: '#f43f5e',
    accentRgb: '244,63,94',
    shimmer: 'via-rose-400/60',
    tagBg: 'rgba(244,63,94,0.10)',
    tagColor: 'rgba(253,164,175,0.85)',
  },
  doc: {
    icon: FileText,
    label: 'Doc',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/20',
    glow: 'rgba(16, 185, 129, 0.22)',
    accent: '#10b981',
    accentRgb: '16,185,129',
    shimmer: 'via-emerald-400/60',
    tagBg: 'rgba(16,185,129,0.10)',
    tagColor: 'rgba(110,231,183,0.85)',
  },
}

interface ResourceCardProps {
  resource: Resource
  index: number
  onViewPdf?: () => void
}

export default function ResourceCard({ resource, index, onViewPdf }: ResourceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  // Spotlight position (in % within card)
  const [spotPos, setSpotPos] = useState({ x: 50, y: 50 })

  // 3D tilt
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const springX = useSpring(mx, { stiffness: 180, damping: 22 })
  const springY = useSpring(my, { stiffness: 180, damping: 22 })
  const rotateX = useTransform(springY, [-0.5, 0.5], ['6deg', '-6deg'])
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-6deg', '6deg'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width - 0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5
    mx.set(relX)
    my.set(relY)
    // spotlight follows exact cursor
    setSpotPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
  }

  const handleMouseLeave = () => {
    mx.set(0)
    my.set(0)
    setIsHovered(false)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const touch = e.touches[0]
    const rect = cardRef.current.getBoundingClientRect()
    mx.set((touch.clientX - rect.left) / rect.width - 0.5)
    my.set((touch.clientY - rect.top) / rect.height - 0.5)
    setIsHovered(true)
  }

  const handleTouchEnd = () => {
    mx.set(0)
    my.set(0)
    setIsHovered(false)
  }

  const config = typeConfig[resource.type] || typeConfig.link
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.07,
        ease: [0.23, 1, 0.32, 1],
      }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={cardRef}
        id={`resource-card-${resource.id}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          rotateX, rotateY,
          transformStyle: 'preserve-3d',
          borderLeft: `4px solid ${config.accent}`,
          background: `linear-gradient(135deg, rgba(${config.accentRgb},0.13) 0%, rgba(${config.accentRgb},0.04) 60%, rgba(10,10,20,0.6) 100%)`,
        }}
        className="glass-card glass-card-hover cursor-pointer h-full relative overflow-hidden group"
        aria-label={`${resource.title} - ${resource.type}`}
        onClick={() => {
          if (resource.type === 'pdf' && onViewPdf) {
            onViewPdf()
          } else {
            window.open(resource.url, '_blank', 'noopener,noreferrer')
          }
        }}
      >
        {/* Cursor-following spotlight */}
        {isHovered && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
            background: `radial-gradient(200px circle at ${spotPos.x}% ${spotPos.y}%, rgba(${config.accentRgb},0.18) 0%, transparent 70%)`,
          }} />
        )}

        {/* Outer glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? `0 0 30px rgba(${config.accentRgb},0.2), inset 0 0 20px rgba(${config.accentRgb},0.08)`
              : '0 0 0px transparent',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Shimmer line at top — uses the type's color */}
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${config.shimmer} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

        {/* Card content */}
        <div className="p-4 flex flex-col gap-2.5 h-full" style={{ transform: 'translateZ(0px)' }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg ${config.bg} border ${config.border}`}>
              <Icon size={12} className={config.color} />
              <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
            </div>
            <span className="text-xs text-white/30 font-medium px-2 py-1 rounded-lg bg-white/5">
              {resource.subject}
            </span>
          </div>

          {/* Title */}
          <div style={{ transform: 'translateZ(20px)' }}>
            <h3 className="font-semibold text-white/90 text-sm leading-snug line-clamp-2">
              {resource.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-xs text-white/45 leading-relaxed line-clamp-2 flex-1">
            {resource.description}
          </p>

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {resource.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  style={{ background: config.tagBg, color: config.tagColor, border: 'none' }}
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md"
                >
                  <Tag size={9} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer — only shown when there's something to display */}
          <div className="flex items-center justify-between pt-1.5 border-t border-white/5" style={{ marginTop: 'auto' }}>
            <div className="flex items-center gap-3 text-xs text-white/30">
              {resource.size && (
                <span className="flex items-center gap-1">
                  <HardDrive size={10} />
                  {resource.size}
                </span>
              )}
              {resource.date && (
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(resource.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            <motion.button
              id={`resource-link-${resource.id}`}
              aria-label={`Open ${resource.title}`}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg
                          ${config.bg} ${config.color} border ${config.border}
                          hover:opacity-80 transition-all duration-200`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                if (resource.type === 'pdf' && onViewPdf) {
                  onViewPdf()
                } else {
                  window.open(resource.url, '_blank', 'noopener,noreferrer')
                }
              }}
            >
              {resource.type === 'link' ? (
                <>Open <ExternalLink size={10} /></>
              ) : (
                <>View <ArrowUpRight size={10} /></>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
