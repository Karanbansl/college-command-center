'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { UserPlus, Eye, EyeOff, Zap, ShieldCheck } from 'lucide-react'

export default function AdminSetupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  // If already logged in, go to dashboard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/admin/dashboard')
      else setChecking(false)
    })
    return () => unsub()
  }, [router])

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push('/admin/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('email-already-in-use')) {
        setError('That email already has an account. Go to /admin to log in.')
      } else if (msg.includes('invalid-email')) {
        setError('Invalid email address.')
      } else {
        setError('Setup failed. Check your Firebase config in .env.local.')
      }
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030308' }}>
        <div className="w-6 h-6 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'radial-gradient(ellipse at 60% 40%, rgba(6,182,212,0.07) 0%, transparent 55%), radial-gradient(ellipse at 30% 70%, rgba(139,92,246,0.07) 0%, transparent 55%), #030308',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 24, backdropFilter: 'blur(20px)', padding: 40,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(6,182,212,0.35)' }}>
              <Zap size={24} style={{ color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 6 }}>First-time Setup</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              Create your admin account to manage resources, links, and subjects.
            </p>
          </div>

          {/* Notice */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, marginBottom: 24 }}>
            <ShieldCheck size={15} style={{ color: '#a78bfa', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              This page creates a Firebase admin account using your project credentials. Share this URL with no one else.
            </p>
          </div>

          <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Email</label>
              <input
                id="setup-email"
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="you@example.com"
                style={{ width: '100%', padding: '10px 13px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: '#fff', fontSize: 14, outline: 'none' }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(6,182,212,0.6)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="setup-password"
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  required placeholder="Min 6 characters"
                  style={{ width: '100%', padding: '10px 40px 10px 13px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: '#fff', fontSize: 14, outline: 'none' }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(6,182,212,0.6)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 3 }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 7 }}>Confirm Password</label>
              <input
                id="setup-confirm"
                type={showPassword ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                required placeholder="Repeat password"
                style={{ width: '100%', padding: '10px 13px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, color: '#fff', fontSize: 14, outline: 'none' }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(6,182,212,0.6)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: '10px 13px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 10, fontSize: 13, color: '#fb7185' }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              id="setup-submit-btn"
              type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              style={{ marginTop: 4, padding: '12px', background: 'linear-gradient(135deg, #0e7490, #7c3aed)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1, boxShadow: '0 0 25px rgba(139,92,246,0.3)' }}
            >
              {loading
                ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <><UserPlus size={16} /> Create Admin Account</>
              }
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 20 }}>
            Already have an account?{' '}
            <a href="/admin" style={{ color: '#a78bfa', textDecoration: 'none' }}>Sign in →</a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
