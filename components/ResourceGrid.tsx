'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, LayoutGrid, List } from 'lucide-react'
import ResourceCard from './ResourceCard'
import PDFViewerModal from './PDFViewerModal'
import type { Resource } from '@/lib/data'

interface ResourceGridProps {
  searchQuery: string
  resources: Resource[]
  subjects: string[]
  loading?: boolean
}

export default function ResourceGrid({ searchQuery, resources, subjects, loading }: ResourceGridProps) {
  const [activeSubject, setActiveSubject] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activePdf, setActivePdf] = useState<Resource | null>(null)

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesSubject = activeSubject === 'All' || r.subject === activeSubject
      const matchesSearch = searchQuery.length < 2 || (
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      return matchesSubject && matchesSearch
    })
  }, [activeSubject, searchQuery, resources])

  return (
    <section id="resources" className="py-20 px-4" aria-label="Resource Grid">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-semibold tracking-[0.2em] text-violet-400/70 uppercase mb-2 block">
              Study Materials
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Resource <span className="gradient-text">Library</span>
            </h2>
          </motion.div>

          {/* View mode + filter count */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="flex items-center gap-1.5 text-xs text-foreground/35">
              <Filter size={12} />
              {loading ? '…' : `${filtered.length} resource${filtered.length !== 1 ? 's' : ''}`}
            </span>
            <div className="flex items-center gap-1 p-1 rounded-lg glass-card border border-foreground/8">
              <button
                id="view-grid-btn"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1.5 rounded-md transition-all duration-200 ${
                  viewMode === 'grid' ? 'bg-violet-500/20 text-violet-400' : 'text-foreground/30 hover:text-foreground/60'
                }`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                id="view-list-btn"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`p-1.5 rounded-md transition-all duration-200 ${
                  viewMode === 'list' ? 'bg-violet-500/20 text-violet-400' : 'text-foreground/30 hover:text-foreground/60'
                }`}
              >
                <List size={14} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Subject filter tabs */}
        <motion.div
          className="flex flex-wrap gap-2 mb-8"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          role="tablist"
          aria-label="Filter by subject"
        >
          {subjects.map((subject) => (
            <button
              key={subject}
              id={`filter-${subject.toLowerCase().replace(/\s+/g, '-')}`}
              role="tab"
              aria-selected={activeSubject === subject}
              onClick={() => setActiveSubject(subject)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeSubject === subject
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'glass-card text-foreground/40 hover:text-foreground/70 border border-transparent hover:border-foreground/10'
              }`}
            >
              {subject}
            </button>
          ))}
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card h-52 animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        )}

        {/* Resource grid */}
        {!loading && (
          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                key={`${activeSubject}-${searchQuery}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'flex flex-col gap-3'
                }
              >
                {filtered.map((resource, index) => (
                  <ResourceCard 
                    key={resource.id} 
                    resource={resource} 
                    index={index} 
                    onViewPdf={() => setActivePdf(resource)} 
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 gap-4 text-center"
              >
                <div className="w-16 h-16 rounded-2xl glass-card border border-foreground/8 flex items-center justify-center">
                  <Filter size={24} className="text-foreground/20" />
                </div>
                <div>
                  <p className="text-foreground/50 text-sm font-medium mb-1">No resources found</p>
                  <p className="text-foreground/25 text-xs">Try a different search or filter</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {activePdf && (
          <PDFViewerModal
            url={activePdf.url}
            title={activePdf.title}
            onClose={() => setActivePdf(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
