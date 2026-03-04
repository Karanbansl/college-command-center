import { motion } from 'framer-motion'
import { X, Download, FileText } from 'lucide-react'

// If it's already a Drive /preview link, use it as-is.
// Otherwise wrap with Google Docs Viewer to natively render PDFs with no CORS issues.
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
  const embedUrl = getEmbedUrl(url)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 3, 8, 0.9)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          height: 64,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={16} style={{ color: '#a78bfa' }} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{title}</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Download: open in new tab (direct download attribute doesn't work cross-origin) */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              color: '#fff',
              fontSize: 13,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <Download size={14} /> Download
          </a>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.2)',
              borderRadius: 10,
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>

      {/* PDF Container */}
      <div style={{ flex: 1, position: 'relative', width: '100%', maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: '#f3f4f6',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <iframe
            src={embedUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={title}
            allow="autoplay"
          />
        </div>
      </div>
    </motion.div>
  )
}

