'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command, X, FileText, Link, ChevronRight, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { resources } from '@/lib/data'

interface CommandBarProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  activeSubject: string
  setActiveSubject: (s: string) => void
  subjects: string[]
}

export default function CommandBar({
  searchQuery,
  setSearchQuery,
  activeSubject,
  setActiveSubject,
  subjects,
}: CommandBarProps) {
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [localQuery, setLocalQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const overlayInputRef = useRef<HTMLInputElement>(null)
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([])

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure theme runs only on client to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle scroll for nav opacity
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeCommand = useCallback(() => {
    setIsCommandOpen(false)
    setLocalQuery('')
    setSelectedIndex(-1)
  }, [])

  // Keyboard shortcut Cmd/Ctrl+K and global Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandOpen(true)
        setSelectedIndex(-1)
        setTimeout(() => overlayInputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape' && isCommandOpen) {
        closeCommand()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCommandOpen, closeCommand])

  const filteredResults = resources
    .filter((r) =>
      localQuery.length > 1
        ? r.title.toLowerCase().includes(localQuery.toLowerCase()) ||
          r.subject.toLowerCase().includes(localQuery.toLowerCase()) ||
          r.tags.some((t) => t.toLowerCase().includes(localQuery.toLowerCase()))
        : false
    )
    .slice(0, 6)

  // Reset selection index whenever query changes
  useEffect(() => {
    setSelectedIndex(-1)
    resultRefs.current = []
  }, [localQuery])

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredResults.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => {
        const next = prev < filteredResults.length - 1 ? prev + 1 : 0
        resultRefs.current[next]?.scrollIntoView({ block: 'nearest' })
        return next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredResults.length - 1
        resultRefs.current[next]?.scrollIntoView({ block: 'nearest' })
        return next
      })
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      const target = filteredResults[selectedIndex]
      if (target) {
        if (target.url === '#') {
          window.location.hash = 'resources'
        } else {
          window.open(target.url, '_blank', 'noopener noreferrer')
        }
        closeCommand()
      }
    }
  }

  return (
    <>
      {/* Top Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[var(--bg-base)]/85 backdrop-blur-xl border-b border-[var(--glass-border)] shadow-lg'
            : 'bg-transparent'
        }`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-glow-violet">
                <span className="text-foreground font-bold text-sm">RC</span>
              </div>
              <span className="font-semibold text-[color:var(--text-main)] opacity-90 hidden sm:block tracking-tight transition-colors">
                Resource <span className="gradient-text">Center</span>
              </span>
            </div>

            {/* Search trigger */}
            <motion.button
              id="command-bar-trigger"
              aria-label="Open command search (Ctrl+K)"
              onClick={() => {
                setIsCommandOpen(true)
                setSelectedIndex(-1)
                setTimeout(() => overlayInputRef.current?.focus(), 50)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-xl glass-card border border-[var(--glass-border)]
                         text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:border-violet-500/30 transition-all duration-300
                         min-w-[200px] sm:min-w-[280px] text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Search size={14} />
              <span className="flex-1 text-left">Search resources...</span>
              <kbd className="hidden sm:flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-[var(--text-main)]/5 border border-[var(--glass-border)] text-[color:var(--text-muted)] font-mono">
                <Command size={10} /> K
              </kbd>
            </motion.button>

            {/* Nav links and Theme Toggle */}
            <div className="hidden md:flex items-center gap-6 text-sm text-[color:var(--text-muted)]">
              <a href="#resources" className="hover:text-[color:var(--text-main)] transition-colors">Resources</a>
              <a href="#quick-links" className="hover:text-[color:var(--text-main)] transition-colors">Quick Links</a>
              <a href="#about" className="hover:text-[color:var(--text-main)] transition-colors">About</a>
              
              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 ml-2 rounded-lg hover:bg-[var(--glass-hover)] transition-colors text-[color:var(--text-muted)] hover:text-violet-500"
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={theme}
                      initial={{ y: -20, opacity: 0, rotate: -90 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 20, opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    </motion.div>
                  </AnimatePresence>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Command Palette Overlay */}
      <AnimatePresence>
        {isCommandOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCommand}
            />

            {/* Command palette */}
            <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
              <motion.div
                className="w-full max-w-2xl pointer-events-auto"
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
              <div className="glass-card border border-muted shadow-[0_25px_80px_rgba(0,0,0,0.7)] overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-muted">
                  <Search size={18} className="text-violet-400 flex-shrink-0" />
                  <input
                    ref={overlayInputRef}
                    id="command-search-input"
                    type="text"
                    placeholder="Search resources, subjects, tags..."
                    value={localQuery}
                    onChange={(e) => {
                      setLocalQuery(e.target.value)
                      setSearchQuery(e.target.value)
                    }}
                    onKeyDown={handleInputKeyDown}
                    className="flex-1 bg-transparent text-foreground placeholder-muted outline-none text-base"
                    aria-label="Search resources"
                    aria-activedescendant={
                      selectedIndex >= 0
                        ? `search-result-${filteredResults[selectedIndex]?.id}`
                        : undefined
                    }
                    role="combobox"
                    aria-expanded={filteredResults.length > 0}
                    aria-controls="command-results-list"
                    autoComplete="off"
                  />
                  <button
                    id="command-close-btn"
                    onClick={closeCommand}
                    className="p-1 rounded-lg hover:bg-muted text-muted hover:text-muted transition-colors"
                    aria-label="Close search"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Results */}
                <div
                  id="command-results-list"
                  className="max-h-80 overflow-y-auto"
                  role="listbox"
                  aria-label="Search results"
                >
                  {localQuery.length > 1 ? (
                    filteredResults.length > 0 ? (
                      <div className="py-2">
                        {filteredResults.map((r, i) => {
                          const isSelected = selectedIndex === i
                          return (
                            <motion.a
                              key={r.id}
                              ref={(el) => { resultRefs.current[i] = el }}
                              href={r.url === '#' ? '#resources' : r.url}
                              target={r.url === '#' ? '_self' : '_blank'}
                              rel={r.url !== '#' ? 'noopener noreferrer' : undefined}
                              id={`search-result-${r.id}`}
                              role="option"
                              aria-selected={isSelected}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className={`flex items-center gap-3 px-4 py-3 transition-all duration-150 cursor-pointer group border-l-2
                                ${isSelected
                                  ? 'bg-violet-500/12 border-violet-500/60'
                                  : 'border-transparent hover:bg-muted hover:border-muted'
                                }`}
                              onClick={closeCommand}
                              onMouseEnter={() => setSelectedIndex(i)}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                  r.type === 'pdf'
                                    ? isSelected ? 'bg-violet-500/30 text-violet-300' : 'bg-violet-500/20 text-violet-400'
                                    : isSelected ? 'bg-cyan-500/30 text-cyan-300' : 'bg-cyan-500/20 text-cyan-400'
                                }`}
                              >
                                {r.type === 'pdf' ? <FileText size={14} /> : <Link size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate transition-colors ${isSelected ? 'text-foreground' : 'text-muted'}`}>
                                  {r.title}
                                </p>
                                <p className="text-xs text-muted truncate">
                                  {r.subject} • {r.tags.slice(0, 2).join(', ')}
                                </p>
                              </div>
                              <ChevronRight
                                size={14}
                                className={`flex-shrink-0 transition-colors ${
                                  isSelected ? 'text-violet-400' : 'text-muted group-hover:text-muted'
                                }`}
                              />
                            </motion.a>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted text-sm">
                        No results for &ldquo;{localQuery}&rdquo;
                      </div>
                    )
                  ) : (
                    <div className="py-6 text-center text-muted text-sm">
                      Start typing to search resources...
                    </div>
                  )}
                </div>

                {/* Footer hint bar */}
                <div className="px-4 py-2.5 border-t border-muted flex items-center gap-4 text-xs text-muted">
                  <span>
                    <kbd className="font-mono text-muted px-1">↑↓</kbd> navigate
                  </span>
                  <span>
                    <kbd className="font-mono text-muted px-1">↵</kbd> open
                  </span>
                  <span>
                    <kbd className="font-mono text-muted px-1">esc</kbd> close
                  </span>
                </div>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
