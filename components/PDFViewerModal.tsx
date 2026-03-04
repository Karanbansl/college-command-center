'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  X, Download, FileText, Maximize2, LogIn,
} from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

// ─── Dynamically import the PDF.js viewer (browser-only, ssr: false)
const PdfJsViewer = dynamic(() => import('./PdfJsViewer'), {
  ssr: false,
  loading: () => <ViewerSpinner />,
})

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function extractDriveId(url: string): string | null {
  const m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/)
  return m ? m[1] : null
}

function getDownloadUrl(url: string): string {
  const id = extractDriveId(url)
  if (id) return `https://drive.google.com/uc?export=download&id=${id}`
  const m2 = url.match(/drive\.google\.com\/open\?id=([\w-]+)/)
  if (m2) return `https://drive.google.com/uc?export=download&id=${m2[1]}`
  return url
}

function getEmbedUrl(url: string): string {
  const id = extractDriveId(url)
  if (id) return `https://drive.google.com/file/d/${id}/preview`
  const m2 = url.match(/drive\.google\.com\/open\?id=([\w-]+)/)
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`
  return url
}

const isDrive = (url: string) => url.includes('drive.google.com')

// ──────────────────────────────────────────────
// Spinner (used while viewer loads)
// ──────────────────────────────────────────────
function ViewerSpinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, height: '100%', background: '#1e1e2e' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#8b5cf6', borderRightColor: 'rgba(6,182,212,0.5)' }}
      />
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Loading PDF engine…</p>
    </div>
  )
}

// ──────────────────────────────────────────────
// Google Drive iframe viewer
// ──────────────────────────────────────────────
function DriveViewer({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false)
  const embedUrl = getEmbedUrl(url)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Institutional hint */}
      <div style={{ flexShrink: 0, padding: '8px 16px', display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(245,158,11,0.06)', borderBottom: '1px solid rgba(245,158,11,0.12)' }}>
        <LogIn size={13} style={{ color: '#fbbf24', marginTop: 1, flexShrink: 0 }} />
        <p style={{ fontSize: 11.5, color: 'rgba(245,158,11,0.8)', lineHeight: 1.5 }}>
          <strong>Institutional file?</strong> Sign into Google with your <strong>institute Gmail</strong> in this browser first — the document will load automatically once you're authenticated.
        </p>
      </div>

      {/* iframe */}
      <div style={{ flex: 1, position: 'relative' }}>
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, background: '#1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ViewerSpinner />
          </div>
        )}
        <iframe
          src={embedUrl}
          title={title}
          allow="autoplay"
          style={{ width: '100%', height: '100%', border: 'none', opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
          onLoad={() => setTimeout(() => setLoaded(true), 600)}
        />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Main Modal
// ──────────────────────────────────────────────
export default function PDFViewerModal({
  url,
  title,
  onClose,
}: {
  url: string
  title: string
  onClose: () => void
}) {
  const driveLink = isDrive(url)
  const downloadUrl = getDownloadUrl(url)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(2, 2, 10, 0.93)',
        backdropFilter: 'blur(28px)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.06, type: 'spring', stiffness: 220, damping: 24 }}
        style={{
          height: 58, flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', gap: 12,
          background: 'rgba(255,255,255,0.015)',
        }}
      >
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={15} style={{ color: '#a78bfa' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(139,92,246,0.7)' }}>
                {driveLink ? 'GOOGLE DRIVE' : 'PDF · TEXT SELECTION ON'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <a
            href={url} target="_blank" rel="noopener noreferrer" title="Open original"
            style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
          >
            <Maximize2 size={14} />
          </a>
          <a
            href={downloadUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 34, borderRadius: 9, background: 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(6,182,212,0.15))', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', fontSize: 13, textDecoration: 'none', fontWeight: 500, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.38), rgba(6,182,212,0.25))' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(6,182,212,0.15))' }}
          >
            <Download size={13} /> Download
          </a>
          <button
            onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)' }}
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>

      {/* ── Viewer ── */}
      <motion.div
        initial={{ scale: 0.97, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        style={{ flex: 1, overflow: 'hidden', margin: '14px 18px 18px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}
      >
        {driveLink ? (
          <DriveViewer url={url} title={title} />
        ) : (
          <PdfJsViewer url={url} />
        )}
      </motion.div>

      {/* Ambient glows */}
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 500, height: 500, pointerEvents: 'none', background: 'radial-gradient(circle at 100% 100%, rgba(139,92,246,0.05), transparent 60%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: 400, height: 400, pointerEvents: 'none', background: 'radial-gradient(circle at 0% 0%, rgba(6,182,212,0.04), transparent 60%)' }} />
    </motion.div>
  )
}
