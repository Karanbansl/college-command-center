'use client'

import { motion } from 'framer-motion'
import CommandBar from '@/components/CommandBar'
import HeroSection from '@/components/HeroSection'
import QuickAccessNode from '@/components/QuickAccessNode'
import ResourceGrid from '@/components/ResourceGrid'
import Footer from '@/components/Footer'
import { useResources } from '@/lib/useResources'
import { useState } from 'react'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSubject, setActiveSubject] = useState('All')
  const { universityLinks, subjects, resources, loading } = useResources()

  return (
    <div className="min-h-screen mesh-gradient noise-overlay relative">
      {/* Command Bar Nav */}
      <CommandBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
        subjects={subjects}
      />

      {/* Main content */}
      <main>
        {/* Hero + 3D Scene */}
        <HeroSection />

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        </div>

        {/* Quick Access Node: University links from Firestore */}
        <QuickAccessNode links={universityLinks} />

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        </div>

        {/* Resource Grid — live data */}
        <ResourceGrid
          searchQuery={searchQuery}
          resources={resources}
          subjects={subjects}
          loading={loading}
        />

        {/* Footer */}
        <Footer />
      </main>

      {/* Ambient corner glows */}
      <div
        aria-hidden="true"
        className="fixed bottom-0 left-0 w-80 h-80 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 0% 100%, rgba(139,92,246,0.06) 0%, transparent 60%)',
        }}
      />
      <div
        aria-hidden="true"
        className="fixed top-0 right-0 w-80 h-80 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 100% 0%, rgba(6,182,212,0.05) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}
