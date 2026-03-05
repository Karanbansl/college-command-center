'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import CommandBar from '@/components/CommandBar'
import HeroSection from '@/components/HeroSection'
import ResourceGrid from '@/components/ResourceGrid'
import Footer from '@/components/Footer'
import { useResources } from '@/lib/useResources'

const DynamicSpaceBackground = dynamic(() => import('@/components/SpaceBackgroundCanvas'), {
  ssr: false,
})

const DynamicCloudBackground = dynamic(() => import('@/components/CloudBackground'), {
  ssr: false,
})

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { universityLinks, subjects, resources, loading } = useResources()

  return (
    <div className="min-h-screen mesh-gradient noise-overlay relative">
      <DynamicSpaceBackground />
      <DynamicCloudBackground />
      {/* Nav */}
      <CommandBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeSubject={'All'}
        setActiveSubject={() => {}}
        subjects={subjects}
      />

      {/* Hero — portals are embedded here */}
      <HeroSection links={universityLinks} />

      {/* Resource Grid — full width, no sidebar */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <ResourceGrid
          searchQuery={searchQuery}
          resources={resources}
          subjects={subjects}
          loading={loading}
        />
        <Footer />
      </main>

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
