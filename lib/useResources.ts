'use client'

import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'
import {
  resources as staticResources,
  universityLinks as staticLinks,
  subjects as staticSubjects,
  type Resource,
  type UniversityLink,
} from './data'

const isFirebaseConfigured = () =>
  typeof window !== 'undefined' &&
  !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'your-project-id'

function docToResource(doc: DocumentData, id: string): Resource {
  const d = doc
  return {
    id: d.id || id,
    title: d.title || '',
    description: d.description || '',
    type: d.type || 'link',
    subject: d.subject || '',
    tags: d.tags || [],
    url: d.url || '#',
    size: d.size,
    date: d.date,
    icon: d.icon,
  }
}

function docToLink(doc: DocumentData, id: string): UniversityLink {
  const d = doc
  return {
    id: d.id || id,
    title: d.title || '',
    description: d.description || '',
    url: d.url || '#',
    icon: d.icon || 'Layout',
    color: d.color || 'from-violet-500 to-purple-600',
    glowColor: d.glowColor || 'rgba(139, 92, 246, 0.4)',
  }
}

export function useResources() {
  const [resources, setResources] = useState<Resource[]>(staticResources)
  const [universityLinks, setUniversityLinks] = useState<UniversityLink[]>(staticLinks)
  const [subjects, setSubjects] = useState<string[]>(staticSubjects)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false)
      return
    }

    const unsubResources = onSnapshot(
      query(collection(db, 'resources'), orderBy('title')),
      (snap) => {
        if (snap.empty) {
          setResources(staticResources)
        } else {
          const docs = snap.docs.map((d) => docToResource(d.data(), d.id))
          setResources(docs)
          // Derive unique subjects from live data
          const uniqueSubjects = ['All', ...Array.from(new Set(docs.map((r) => r.subject))).filter(Boolean).sort()]
          setSubjects(uniqueSubjects)
        }
        setLoading(false)
      },
      () => {
        // On error, fall back to static data
        setResources(staticResources)
        setLoading(false)
      }
    )

    const unsubLinks = onSnapshot(
      query(collection(db, 'universityLinks'), orderBy('title')),
      (snap) => {
        if (!snap.empty) {
          setUniversityLinks(snap.docs.map((d) => docToLink(d.data(), d.id)))
        }
      },
      () => setUniversityLinks(staticLinks)
    )

    return () => {
      unsubResources()
      unsubLinks()
    }
  }, [])

  return { resources, universityLinks, subjects, loading }
}
