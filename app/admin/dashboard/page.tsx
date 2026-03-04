'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { auth, db, storage } from '@/lib/firebase'
import { resources as staticResources, universityLinks as staticLinks } from '@/lib/data'
import {
  LogOut, Plus, Pencil, Trash2, Save, X, Database,
  Link2, FileText, BookOpen, Zap, AlertTriangle,
  ChevronDown,
} from 'lucide-react'
import type { Resource, UniversityLink } from '@/lib/data'

// ────────────────────────────────────────────────────────────
// Tiny shared components
// ────────────────────────────────────────────────────────────
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, ...style,
  }}>
    {children}
  </div>
)

const Input = ({
  label, value, onChange, type = 'text', placeholder, required,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; required?: boolean
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      {label}{required && <span style={{ color: '#f87171', marginLeft: 2 }}>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={{
        padding: '9px 12px', background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
        color: '#fff', fontSize: 13, outline: 'none', width: '100%',
      }}
      onFocus={(e) => (e.target.style.borderColor = 'rgba(139,92,246,0.6)')}
      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
    />
  </div>
)

const Select = ({
  label, value, onChange, options, required,
}: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; required?: boolean
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      {label}{required && <span style={{ color: '#f87171', marginLeft: 2 }}>*</span>}
    </label>
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          width: '100%', padding: '9px 32px 9px 12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
          color: '#fff', fontSize: 13, outline: 'none', appearance: 'none',
          cursor: 'pointer',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: '#0a0a14' }}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
    </div>
  </div>
)

// ────────────────────────────────────────────────────────────
// Blank resource form state
// ────────────────────────────────────────────────────────────
const blankResource = (): Omit<Resource, 'id'> => ({
  title: '', description: '', type: 'pdf', subject: '', tags: [], url: '#', size: '', date: '',
})

const blankLink = (): Omit<UniversityLink, 'id'> => ({
  title: '', description: '', url: '#', icon: 'Layout',
  color: 'from-violet-500 to-purple-600', glowColor: 'rgba(139, 92, 246, 0.4)',
})

const iconOptions = [
  { value: 'Layout', label: '🖥️ Layout (Portal)' },
  { value: 'CalendarCheck', label: '📅 Calendar (Attendance)' },
  { value: 'BookOpen', label: '📖 Book (LMS)' },
  { value: 'Library', label: '📚 Library' },
  { value: 'ClipboardList', label: '📋 Clipboard (Exam)' },
  { value: 'Briefcase', label: '💼 Briefcase (Placement)' },
]

const colorOptions = [
  { value: 'from-violet-500 to-purple-600', label: 'Violet / Purple' },
  { value: 'from-cyan-500 to-blue-600', label: 'Cyan / Blue' },
  { value: 'from-emerald-500 to-teal-600', label: 'Emerald / Teal' },
  { value: 'from-orange-500 to-amber-600', label: 'Orange / Amber' },
  { value: 'from-rose-500 to-pink-600', label: 'Rose / Pink' },
  { value: 'from-indigo-500 to-violet-600', label: 'Indigo / Violet' },
]

// ────────────────────────────────────────────────────────────
// Main Dashboard
// ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<'resources' | 'links' | 'subjects'>('resources')

  // Firestore data
  const [resources, setResources] = useState<Resource[]>([])
  const [links, setLinks] = useState<UniversityLink[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [newSubject, setNewSubject] = useState('')

  // UI state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [resourceForm, setResourceForm] = useState(blankResource())
  const [linkForm, setLinkForm] = useState(blankLink())
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace('/admin')
      else setUser(u)
      setChecking(false)
    })
    return () => unsub()
  }, [router])

  // Firestore listeners
  useEffect(() => {
    if (!user) return
    const unsubR = onSnapshot(query(collection(db, 'resources'), orderBy('title')), (snap) => {
      setResources(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Resource)))
    })
    const unsubL = onSnapshot(query(collection(db, 'universityLinks'), orderBy('title')), (snap) => {
      setLinks(snap.docs.map((d) => ({ ...d.data(), id: d.id } as UniversityLink)))
    })
    const unsubS = onSnapshot(collection(db, 'subjects'), (snap) => {
      const arr = snap.docs.map((d) => d.data().name as string).sort()
      setSubjects(arr)
    })
    return () => { unsubR(); unsubL(); unsubS() }
  }, [user])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/admin')
  }

  // ── Resource CRUD ──
  const openAddResource = () => {
    setEditingId(null)
    setResourceForm(blankResource())
    setSelectedFile(null)
    setUploadProgress(null)
    setShowForm(true)
  }
  const openEditResource = (r: Resource) => {
    setEditingId(r.id)
    setResourceForm({ title: r.title, description: r.description, type: r.type, subject: r.subject, tags: r.tags, url: r.url, size: r.size || '', date: r.date || '' })
    setSelectedFile(null)
    setUploadProgress(null)
    setShowForm(true)
  }
  const saveResource = async () => {
    // If it's a file type, require either a selected file OR an existing URL (for edits)
    const isFile = resourceForm.type === 'pdf' || resourceForm.type === 'doc'
    if (!resourceForm.title || !resourceForm.subject) return
    if (!isFile && !resourceForm.url) return
    if (isFile && !selectedFile && !resourceForm.url) return

    setSaving(true)
    let finalUrl = resourceForm.url
    let finalSize = resourceForm.size

    // Handle File Upload
    if (isFile && selectedFile) {
      setUploadProgress(0)
      const fileRef = ref(storage, `resources/${Date.now()}_${selectedFile.name}`)
      const uploadTask = uploadBytesResumable(fileRef, selectedFile)

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snap) => {
            const prog = (snap.bytesTransferred / snap.totalBytes) * 100
            setUploadProgress(prog)
          },
          (err) => reject(err),
          async () => {
            finalUrl = await getDownloadURL(uploadTask.snapshot.ref)
            const mb = (selectedFile.size / (1024 * 1024)).toFixed(1)
            finalSize = `${mb} MB`
            resolve()
          }
        )
      })
    }

    const payload = {
      ...resourceForm,
      url: finalUrl,
      size: finalSize,
      tags: typeof resourceForm.tags === 'string'
        ? (resourceForm.tags as unknown as string).split(',').map((t) => t.trim()).filter(Boolean)
        : resourceForm.tags,
      updatedAt: serverTimestamp(),
    }
    
    if (editingId) {
      await updateDoc(doc(db, 'resources', editingId), payload)
    } else {
      await addDoc(collection(db, 'resources'), { ...payload, createdAt: serverTimestamp() })
    }
    
    setSaving(false)
    setUploadProgress(null)
    setSelectedFile(null)
    setShowForm(false)
  }
  const deleteResource = async (r: Resource) => {
    // If it's a hosted file, delete from Storage first
    if (r.url.includes('firebasestorage.googleapis.com')) {
      try {
        const fileRef = ref(storage, r.url)
        await deleteObject(fileRef)
      } catch (e) {
        console.error('Failed to delete file from storage', e)
      }
    }
    await deleteDoc(doc(db, 'resources', r.id))
    setDeleteConfirm(null)
  }

  // ── Link CRUD ──
  const openAddLink = () => {
    setEditingId(null)
    setLinkForm(blankLink())
    setShowForm(true)
  }
  const openEditLink = (l: UniversityLink) => {
    setEditingId(l.id)
    setLinkForm({ title: l.title, description: l.description, url: l.url, icon: l.icon, color: l.color, glowColor: l.glowColor })
    setShowForm(true)
  }
  const saveLink = async () => {
    if (!linkForm.title || !linkForm.url) return
    setSaving(true)
    const payload = { ...linkForm, updatedAt: serverTimestamp() }
    if (editingId) {
      await updateDoc(doc(db, 'universityLinks', editingId), payload)
    } else {
      await addDoc(collection(db, 'universityLinks'), { ...payload, createdAt: serverTimestamp() })
    }
    setSaving(false)
    setShowForm(false)
  }
  const deleteLink = async (id: string) => {
    await deleteDoc(doc(db, 'universityLinks', id))
    setDeleteConfirm(null)
  }

  // ── Subjects CRUD ──
  const addSubject = async () => {
    const trimmed = newSubject.trim()
    if (!trimmed || subjects.includes(trimmed)) return
    await addDoc(collection(db, 'subjects'), { name: trimmed })
    setNewSubject('')
  }
  const deleteSubject = async (name: string) => {
    const snap = await getDocs(query(collection(db, 'subjects'), where('name', '==', name)))
    for (const d of snap.docs) await deleteDoc(d.ref)
    setDeleteConfirm(null)
  }

  // ── Seed Firestore with defaults ──
  const seedDefaults = async () => {
    setSeeding(true)
    setSeedMsg('')
    try {
      const batch = await import('firebase/firestore').then(m => m.writeBatch(db))
      for (const r of staticResources) {
        const ref = doc(collection(db, 'resources'))
        batch.set(ref, { ...r, createdAt: serverTimestamp() })
      }
      for (const l of staticLinks) {
        const ref = doc(collection(db, 'universityLinks'))
        batch.set(ref, { ...l, createdAt: serverTimestamp() })
      }
      const subjectNames = ['Computer Science', 'AI/ML', 'Electronics', 'Web Dev', 'Cloud', 'Mathematics', 'Software Eng']
      for (const s of subjectNames) {
        const ref = doc(collection(db, 'subjects'))
        batch.set(ref, { name: s })
      }
      await batch.commit()
      setSeedMsg('✓ Default data seeded successfully!')
    } catch {
      setSeedMsg('⚠ Seed failed. Check Firestore rules or config.')
    }
    setSeeding(false)
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030308' }}>
        <div className="w-6 h-6 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
      </div>
    )
  }

  const s = { color: 'rgba(255,255,255,0.5)', fontSize: 13 }

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.07) 0%, transparent 50%), #030308', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} style={{ color: '#fff' }} />
            </div>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Admin Dashboard</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>Resource Command Center</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{user?.email}</span>
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Seed Banner */}
        {resources.length === 0 && links.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 24, padding: '16px 20px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24', marginBottom: 2 }}>Firestore is empty</p>
                <p style={s}>Pre-populate with the default resources, portals, and subjects to get started quickly.</p>
              </div>
            </div>
            <button
              onClick={seedDefaults}
              disabled={seeding}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, color: '#fbbf24', fontSize: 13, fontWeight: 600, cursor: seeding ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
            >
              <Database size={14} />
              {seeding ? 'Seeding…' : 'Seed Defaults'}
            </button>
          </motion.div>
        )}

        {seedMsg && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: seedMsg.startsWith('✓') ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', border: `1px solid ${seedMsg.startsWith('✓') ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`, borderRadius: 10, fontSize: 13, color: seedMsg.startsWith('✓') ? '#34d399' : '#fb7185' }}>
            {seedMsg}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 12, width: 'fit-content' }}>
          {([
            { key: 'resources', label: 'Resources', icon: FileText, count: resources.length },
            { key: 'links', label: 'University Links', icon: Link2, count: links.length },
            { key: 'subjects', label: 'Subjects', icon: BookOpen, count: subjects.length },
          ] as const).map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setShowForm(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
                borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                background: tab === key ? 'rgba(139,92,246,0.2)' : 'transparent',
                color: tab === key ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={14} />
              {label}
              <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '1px 7px', color: 'rgba(255,255,255,0.4)' }}>{count}</span>
            </button>
          ))}
        </div>

        {/* ── RESOURCES TAB ── */}
        {tab === 'resources' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Resources</h2>
                <p style={s}>{resources.length} resource{resources.length !== 1 ? 's' : ''} in library</p>
              </div>
              <button
                onClick={openAddResource}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}
              >
                <Plus size={15} /> Add Resource
              </button>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ marginBottom: 20 }}
                >
                  <Card style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{editingId ? 'Edit Resource' : 'New Resource'}</h3>
                      <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Input label="Title" value={resourceForm.title} onChange={(v) => setResourceForm({ ...resourceForm, title: v })} placeholder="Data Structures Notes" required />
                      <Input label="Subject" value={resourceForm.subject} onChange={(v) => setResourceForm({ ...resourceForm, subject: v })} placeholder="Computer Science" required />
                      <div style={{ gridColumn: '1 / -1' }}>
                        <Input label="Description" value={resourceForm.description} onChange={(v) => setResourceForm({ ...resourceForm, description: v })} placeholder="Brief description of the resource" />
                      </div>
                      <Select label="Type" value={resourceForm.type} onChange={(v) => setResourceForm({ ...resourceForm, type: v as Resource['type'] })} options={[{ value: 'pdf', label: 'PDF' }, { value: 'doc', label: 'Doc' }, { value: 'link', label: 'Link' }, { value: 'video', label: 'Video' }]} />
                      
                      {(resourceForm.type === 'pdf' || resourceForm.type === 'doc') ? (
                        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Upload File{(!editingId || !resourceForm.url) && <span style={{ color: '#f87171', marginLeft: 2 }}>*</span>}</label>
                          <div style={{ 
                            position: 'relative', overflow: 'hidden', padding: '16px', 
                            background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.2)', 
                            borderRadius: 12, textAlign: 'center', transition: 'all 0.2s',
                          }}>
                            <input
                              type="file"
                              accept={resourceForm.type === 'pdf' ? '.pdf' : '.doc,.docx,.txt'}
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                              <FileText size={24} style={{ color: selectedFile ? '#a78bfa' : 'rgba(255,255,255,0.2)' }} />
                              {selectedFile ? (
                                <p style={{ fontSize: 13, color: '#c4b5fd', fontWeight: 500 }}>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</p>
                              ) : (
                                <div>
                                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: 2 }}>Click or drag file to upload</p>
                                  {resourceForm.url && <p style={{ fontSize: 11, color: '#a78bfa' }}>File already attached. Upload a new one to replace.</p>}
                                </div>
                              )}
                            </div>
                            
                            {/* Inner Progress Bar */}
                            {uploadProgress !== null && (
                              <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, background: 'rgba(255,255,255,0.1)', width: '100%' }}>
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  animate={{ width: `${uploadProgress}%` }} 
                                  style={{ height: '100%', background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)' }} 
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <Input label="URL / Link" value={resourceForm.url} onChange={(v) => setResourceForm({ ...resourceForm, url: v })} placeholder="https://..." required />
                        </div>
                      )}

                      <Input label="Tags (comma-separated)" value={Array.isArray(resourceForm.tags) ? resourceForm.tags.join(', ') : resourceForm.tags as unknown as string} onChange={(v) => setResourceForm({ ...resourceForm, tags: v.split(',').map(t => t.trim()).filter(Boolean) })} placeholder="DSA, Arrays, Trees" />
                      {resourceForm.type !== 'pdf' && resourceForm.type !== 'doc' && (
                        <Input label="File Size (optional)" value={resourceForm.size || ''} onChange={(v) => setResourceForm({ ...resourceForm, size: v })} placeholder="4.2 MB" />
                      )}
                      <Input label="Date (optional)" value={resourceForm.date || ''} onChange={(v) => setResourceForm({ ...resourceForm, date: v })} type="date" />
                    </div>
                    <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button onClick={() => setShowForm(false)} style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button
                        onClick={saveResource}
                        disabled={saving}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
                      >
                        <Save size={14} /> {saving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resource list */}
            {resources.length === 0 ? (
              <Card style={{ padding: 40, textAlign: 'center' }}>
                <FileText size={32} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 12px' }} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No resources yet. Add one above or seed defaults.</p>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {resources.map((r) => (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: r.type === 'pdf' ? 'rgba(139,92,246,0.15)' : 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {r.type === 'pdf' ? <FileText size={16} style={{ color: '#a78bfa' }} /> : <Link2 size={16} style={{ color: '#22d3ee' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                          <span style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 6px', borderRadius: 4, marginRight: 6 }}>{r.subject}</span>
                          {r.type.toUpperCase()}
                          {r.tags?.length > 0 && ` · ${r.tags.slice(0, 3).join(', ')}`}
                        </p>
                      </div>
                      {deleteConfirm === r.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <span style={{ fontSize: 12, color: '#f87171' }}>Delete?</span>
                          <button onClick={() => deleteResource(r)} style={{ padding: '4px 10px', background: 'rgba(244,63,94,0.2)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 6, color: '#f87171', fontSize: 12, cursor: 'pointer' }}>Yes</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>No</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button onClick={() => openEditResource(r)} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }} title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleteConfirm(r.id)} style={{ padding: '6px 10px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer' }} title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── UNIVERSITY LINKS TAB ── */}
        {tab === 'links' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 2 }}>University Links</h2>
                <p style={s}>{links.length} portal{links.length !== 1 ? 's' : ''} configured</p>
              </div>
              <button
                onClick={openAddLink}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg, #0e7490, #06b6d4)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(6,182,212,0.25)' }}
              >
                <Plus size={15} /> Add Portal
              </button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ marginBottom: 20 }}>
                  <Card style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{editingId ? 'Edit Portal' : 'New Portal'}</h3>
                      <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={18} /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <Input label="Title" value={linkForm.title} onChange={(v) => setLinkForm({ ...linkForm, title: v })} placeholder="Student Portal" required />
                      <Input label="URL" value={linkForm.url} onChange={(v) => setLinkForm({ ...linkForm, url: v })} placeholder="https://..." required />
                      <div style={{ gridColumn: '1 / -1' }}>
                        <Input label="Description" value={linkForm.description} onChange={(v) => setLinkForm({ ...linkForm, description: v })} placeholder="Access fees, results & registrations" />
                      </div>
                      <Select label="Icon" value={linkForm.icon} onChange={(v) => setLinkForm({ ...linkForm, icon: v })} options={iconOptions} />
                      <Select label="Color" value={linkForm.color} onChange={(v) => setLinkForm({ ...linkForm, color: v })} options={colorOptions} />
                    </div>
                    <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button onClick={() => setShowForm(false)} style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                      <button onClick={saveLink} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg, #0e7490, #06b6d4)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                        <Save size={14} /> {saving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {links.length === 0 ? (
              <Card style={{ padding: 40, textAlign: 'center' }}>
                <Link2 size={32} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 12px' }} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No portals yet. Add one or seed defaults.</p>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {links.map((l) => (
                  <motion.div key={l.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card style={{ padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg, var(--tw-gradient-stops))`, backgroundImage: `linear-gradient(135deg, #8b5cf6, #06b6d4)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Link2 size={18} style={{ color: '#fff' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={() => openEditLink(l)} style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><Pencil size={12} /></button>
                          {deleteConfirm === l.id ? (
                            <>
                              <button onClick={() => deleteLink(l.id)} style={{ padding: '4px 8px', background: 'rgba(244,63,94,0.2)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 7, color: '#f87171', cursor: 'pointer', fontSize: 11 }}>Yes</button>
                              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 11 }}>No</button>
                            </>
                          ) : (
                            <button onClick={() => setDeleteConfirm(l.id)} style={{ padding: '4px 8px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 7, color: '#f87171', cursor: 'pointer' }}><Trash2 size={12} /></button>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{l.title}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.description}</p>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#22d3ee', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{l.url}</a>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SUBJECTS TAB ── */}
        {tab === 'subjects' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Subjects</h2>
              <p style={s}>These appear as filter tabs in the Resource Library.</p>
            </div>

            {/* Add subject */}
            <Card style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Machine Learning"
                  onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                  style={{ flex: 1, padding: '9px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none' }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(139,92,246,0.6)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
                <button
                  onClick={addSubject}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </Card>

            {subjects.length === 0 ? (
              <Card style={{ padding: 40, textAlign: 'center' }}>
                <BookOpen size={32} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 12px' }} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No subjects yet.</p>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {subjects.map((s) => (
                  <motion.div
                    key={s}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10 }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#c4b5fd' }}>{s}</span>
                    {deleteConfirm === `sub-${s}` ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => deleteSubject(s)} style={{ fontSize: 11, padding: '2px 7px', background: 'rgba(244,63,94,0.2)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 5, color: '#f87171', cursor: 'pointer' }}>Delete</button>
                        <button onClick={() => setDeleteConfirm(null)} style={{ fontSize: 11, padding: '2px 7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(`sub-${s}`)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: 2, display: 'flex' }}>
                        <X size={13} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
