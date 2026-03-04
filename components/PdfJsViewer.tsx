'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import {
  FileText, AlertTriangle, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Info,
} from 'lucide-react'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, height: '100%', minHeight: 300 }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.15)' }} />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#8b5cf6', borderRightColor: 'rgba(6,182,212,0.5)' }}
        />
        <div style={{ position: 'absolute', inset: '22%', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139,92,246,0.35), rgba(6,182,212,0.25))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={12} style={{ color: '#a78bfa' }} />
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>Rendering document…</p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Powered by PDF.js</p>
      </div>
    </div>
  )
}

export default function PdfJsViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [error, setError] = useState(false)

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }, [])

  const zoomIn = () => setScale(s => Math.min(s + 0.25, 3))
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.5))
  const prevPage = () => setPageNumber(p => Math.max(p - 1, 1))
  const nextPage = () => setPageNumber(p => Math.min(p + 1, numPages ?? p))

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, height: '100%', padding: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertTriangle size={24} style={{ color: '#f87171' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Could not load PDF</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', maxWidth: 300 }}>The file may require authentication or is not a direct PDF URL. Try "Open Original" button above.</p>
        </div>
      </div>
    )
  }

  const controlBtn = (disabled?: boolean): React.CSSProperties => ({
    width: 30, height: 30, borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  })

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controls bar */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Page nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={prevPage} disabled={pageNumber <= 1} style={controlBtn(pageNumber <= 1)}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', minWidth: 66, textAlign: 'center' }}>
            {numPages ? `${pageNumber} / ${numPages}` : '…'}
          </span>
          <button onClick={nextPage} disabled={!numPages || pageNumber >= numPages} style={controlBtn(!numPages || pageNumber >= numPages)}>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={zoomOut} style={controlBtn(scale <= 0.5)}><ZoomOut size={13} /></button>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', minWidth: 38, textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} style={controlBtn(scale >= 3)}><ZoomIn size={13} /></button>
          <button onClick={() => setScale(1)} style={{ ...controlBtn(), padding: '0 10px', width: 'auto', fontSize: 11 }}>Reset</button>
        </div>

        {/* Hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
          <Info size={11} /> Text selection ON
        </div>
      </div>

      {/* PDF canvas */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', background: '#1e1e2e', display: 'flex', justifyContent: 'center', padding: '24px 16px' }}>
        <Document
          file={url}
          onLoadSuccess={onLoadSuccess}
          onLoadError={() => setError(true)}
          loading={<Spinner />}
          error={<div />}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={<div style={{ width: 600, height: 800, background: 'rgba(255,255,255,0.04)', borderRadius: 8 }} />}
          />
        </Document>
      </div>
    </div>
  )
}
