'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import CommandBar from '@/components/CommandBar'
import HeroSection from '@/components/HeroSection'
import QuickAccessNode from '@/components/QuickAccessNode'
import ResourceGrid from '@/components/ResourceGrid'
import Footer from '@/components/Footer'
import { useResources } from '@/lib/useResources'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { universityLinks, subjects, resources, loading } = useResources()

  return (
    <div className="min-h-screen mesh-gradient noise-overlay relative">
      {/* Command Bar Nav */}
      <CommandBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeSubject={'All'}
        setActiveSubject={() => {}}
        subjects={subjects}
      />

      {/* Compact Hero */}
      <HeroSection />

      {/* ── Dashboard Split Pane ── */}
      <div
        className="max-w-[1600px] mx-auto split-pane-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '0',
          alignItems: 'start',
          padding: '0 16px 0 16px',
        }}
      >
        {/* ── LEFT: Sticky Sidebar ── */}
        <aside
          className="split-pane-sidebar"
          style={{
            position: 'sticky',
            top: 72,
            height: 'calc(100vh - 88px)',
            overflowY: 'auto',
            paddingRight: 12,
            paddingTop: 24,
            paddingBottom: 24,
            scrollbarWidth: 'none',
          }}
        >
          <QuickAccessNode links={universityLinks} />
        </aside>

        {/* ── RIGHT: Resource Grid (main area) ── */}
        <main style={{ minWidth: 0, paddingLeft: 12 }}>
          {/* Thin vertical separator */}
          <div style={{
            position: 'sticky',
            top: 72,
            height: 1,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)',
            marginBottom: 0,
            marginLeft: -12,
            zIndex: 1,
          }} />

          <ResourceGrid
            searchQuery={searchQuery}
            resources={resources}
            subjects={subjects}
            loading={loading}
          />

          <Footer />
        </main>
      </div>

      {/* Ambient corner glows */}
      <div
        aria-hidden="true"
        className="fixed bottom-0 left-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 0% 100%, rgba(139,92,246,0.06) 0%, transparent 60%)' }}
      />
      <div
        aria-hidden="true"
        className="fixed top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 100% 0%, rgba(6,182,212,0.05) 0%, transparent 60%)' }}
      />
    </div>
  )
}
