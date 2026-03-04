'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, ExternalLink, AlertTriangle } from 'lucide-react'

// Drive /preview links are used as-is. Others are wrapped in Google Docs Viewer.
function getEmbedUrl(url: string): string {
  if (url.includes('drive.google.com')) return url
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`
}

export default function PDFViewerModal({
  url,
  title,
  onClose,
}: {
  url: string
  title: string
  onClose: () => void
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const embedUrl = getEmbedUrl(url)
  const isDrive = url.includes('drive.google.com')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 2, 10, 0.92)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 22 }}
        style={{
          height: 64,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          gap: 16,
          background: 'rgba(255,255,255,0.015)',
          flexShrink: 0,
        }}
      >
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))',
            border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FileText size={16} style={{ color: '#a78bfa' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{
              fontSize: 15, fontWeight: 700, color: '#fff',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{title}</h2>
            {isDrive && (
              <p style={{ fontSize: 10, color: 'rgba(139,92,246,0.7)', marginTop: 1 }}>Google Drive document</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, color: 'rgba(255,255,255,0.8)',
              fontSize: 13, textDecoration: 'none', fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
          >
            <Download size={13} /> Download
          </a>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36,
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.2)',
              borderRadius: 10, color: '#f87171',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)' }}
          >
            <X size={17} />
          </button>
        </div>
      </motion.div>

      {/* ── Viewer ── */}
      <div style={{ flex: 1, position: 'relative', padding: '20px 24px 24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          style={{
            width: '100%', height: '100%', position: 'relative',
            borderRadius: 18, overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
          }}
        >
          {/* Loading Overlay */}
          <AnimatePresence>
            {!loaded && !error && (
              <motion.div
                key="loader"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'absolute', inset: 0, zIndex: 10,
                  background: 'linear-gradient(160deg, rgba(10,10,25,0.97), rgba(10,5,30,0.97))',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 20,
                  borderRadius: 18,
                }}
              >
                {/* Animated sphere ring */}
                <div style={{ position: 'relative', width: 60, height: 60 }}>
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '2px solid rgba(139,92,246,0.15)',
                  }} />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      border: '2px solid transparent',
                      borderTopColor: '#8b5cf6',
                      borderRightColor: 'rgba(6,182,212,0.5)',
                    }}
                  />
                  <div style={{
                    position: 'absolute', inset: '20%', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileText size={14} style={{ color: '#a78bfa' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>Opening document…</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{title}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Overlay */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute', inset: 0, zIndex: 10,
                  background: 'linear-gradient(160deg, #0a0a19, #09030f)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 24,
                  borderRadius: 18, padding: 32,
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: 18,
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertTriangle size={28} style={{ color: '#fbbf24' }} />
                </div>
                <div style={{ textAlign: 'center', maxWidth: 360 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                    Sign-in Required
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                    This file is restricted and requires a Google account to view. Open it directly in Google Drive instead.
                  </p>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '11px 24px',
                    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                    borderRadius: 12, color: '#fff', fontSize: 14,
                    fontWeight: 600, textDecoration: 'none',
                    boxShadow: '0 8px 24px rgba(139,92,246,0.35)',
                  }}
                >
                  <ExternalLink size={15} /> Open in Google Drive
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Iframe */}
          <iframe
            src={embedUrl}
            style={{
              width: '100%', height: '100%', border: 'none',
              background: '#f8f9fa', borderRadius: 18,
            }}
            title={title}
            allow="autoplay"
            onLoad={() => {
              // Wait a moment before hiding the loader so Drive has time to render
              setTimeout(() => setLoaded(true), 800)
            }}
            onError={() => {
              setLoaded(true)
              setError(true)
            }}
          />
        </motion.div>
      </div>

      {/* Ambient corner glow */}
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 400, height: 400, pointerEvents: 'none', background: 'radial-gradient(circle at 100% 100%, rgba(139,92,246,0.06), transparent 60%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: 300, height: 300, pointerEvents: 'none', background: 'radial-gradient(circle at 0% 0%, rgba(6,182,212,0.04), transparent 60%)' }} />
    </motion.div>
  )
}
