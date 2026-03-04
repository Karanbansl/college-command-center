'use client'

import { motion } from 'framer-motion'
import { Github, Twitter, Heart, Command } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      id="about"
      className="border-t border-foreground/5 py-12 px-4 mt-8"
      aria-label="Footer"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Brand */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <span className="text-foreground font-bold text-sm">RC</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground/80">Resource Command Center</p>
              <p className="text-xs text-foreground/30">Your academic intelligence hub</p>
            </div>
          </motion.div>

          {/* Center: Shortcut reminder */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 text-xs text-foreground/25"
          >
            <span>Press</span>
            <kbd className="flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/5 border border-foreground/10 font-mono text-foreground/40">
              <Command size={10} /> K
            </kbd>
            <span>to search</span>
          </motion.div>

          {/* Right: Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <a
              href="https://github.com"
              id="footer-github"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg glass-card border border-foreground/8 text-foreground/30 hover:text-foreground/70 hover:border-foreground/15 transition-all duration-200"
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
            <a
              href="https://twitter.com"
              id="footer-twitter"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg glass-card border border-foreground/8 text-foreground/30 hover:text-foreground/70 hover:border-foreground/15 transition-all duration-200"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
          </motion.div>
        </div>

        {/* Bottom line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 pt-6 border-t border-foreground/5 flex items-center justify-center gap-2 text-xs text-foreground/20"
        >
          <span>Built with</span>
          <Heart size={10} className="text-rose-400/60 fill-rose-400/60" />
          <span>using Next.js, R3F, and Framer Motion</span>
        </motion.div>
      </div>
    </footer>
  )
}
