import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch, resolveUrl, setApiKey as setGlobalApiKey } from '../api.js'

const KelvidContext = createContext(null)

export function useKelvid() {
  const ctx = useContext(KelvidContext)
  if (!ctx) throw new Error('useKelvid must be used inside KelvidProvider')
  return ctx
}

export function KelvidProvider({ children }) {
  // ---- Auth ----
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kelvid-user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem('kelvid-api-key') || '')

  // ---- App state ----
  const [route, setRoute] = useState(user ? 'studio' : 'landing')
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [frames, setFrames] = useState(48)
  const [steps, setSteps] = useState(30)
  const [guide, setGuide] = useState(7.5)
  const [seed, setSeed] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [jobs, setJobs] = useState([])
  const [gallery, setGallery] = useState([])
  const [filter, setFilter] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoMeta, setVideoMeta] = useState('')
  const [toasts, setToasts] = useState([])
  const [health, setHealth] = useState('checking...')

  // ---- Auth helpers ----
  const login = useCallback((email, name = '') => {
    const u = { email, name: name || email.split('@')[0], credits: 65 }
    localStorage.setItem('kelvid-user', JSON.stringify(u))
    setUser(u)
    setRoute('studio')
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('kelvid-user')
    setUser(null)
    setRoute('landing')
  }, [])

  const setApiKey = useCallback((key) => {
    setApiKeyState(key)
    localStorage.setItem('kelvid-api-key', key)
    setGlobalApiKey(key)
  }, [])

  useEffect(() => {
    setGlobalApiKey(apiKey)
  }, [apiKey])

  // ---- Toasts ----
  const toast = useCallback((msg, type = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  // ---- Polling ----
  const polling = useRef(new Set())
  const pollJob = useCallback(async (id) => {
    if (polling.current.has(id)) return
    polling.current.add(id)
    const t0 = Date.now()
    try {
      for (;;) {
        await new Promise((r) => setTimeout(r, 3500))
        let j
        try {
          j = await apiFetch(`/api/jobs/${id}`)
        } catch (err) {
          toast(`Poll failed: ${err.message}`, 'error')
          break
        }
        const elapsed = Math.round((Date.now() - t0) / 1000)
        setVideoMeta(`Job ${j.job_id?.slice(0, 6) || id.slice(0, 6)} · ${j.status} · ${elapsed}s`)
        if (j.status === 'done') {
          setVideoUrl(resolveUrl(j.url))
          setVideoMeta(`Ready in ${elapsed}s · ${j.model || ''}`)
          toast('Video ready!', 'success')
          refreshGallery()
          refreshJobs()
          break
        }
        if (j.status === 'failed') {
          setError(j.error || 'Generation failed')
          toast(j.error || 'Generation failed', 'error')
          refreshJobs()
          break
        }
        refreshJobs()
      }
    } finally {
      polling.current.delete(id)
    }
  }, [toast])

  // ---- Data fetchers ----
  const refreshJobs = useCallback(async () => {
    try {
      const d = await apiFetch('/api/jobs')
      setJobs(d.jobs || [])
    } catch {}
  }, [])

  const refreshGallery = useCallback(async () => {
    try {
      const d = await apiFetch('/api/gallery')
      setGallery((d.items || []).map((x) => ({ ...x, url: resolveUrl(x.url) })))
    } catch {}
  }, [])

  // ---- Initial load ----
  useEffect(() => {
    apiFetch('/api/health')
      .then((d) => {
        if (d?.status === 'ok') setHealth(`online · v${d.version || '?'} · ${d.active_jobs || 0} active`)
        else setHealth(d?.status || 'unknown')
      })
      .catch(() => setHealth('offline'))

    apiFetch('/api/models')
      .then((d) => {
        setModels(d.models || [])
        if (d.default) setSelectedModel(d.default)
        if (d.provider) setSelectedProvider(d.provider)
      })
      .catch(() => {})

    refreshJobs()
    refreshGallery()

    const h = setInterval(() => {
      apiFetch('/api/health')
        .then((d) => {
          if (d?.status === 'ok') setHealth(`online · v${d.version || '?'} · ${d.active_jobs || 0} active`)
          else setHealth(d?.status || 'unknown')
        })
        .catch(() => setHealth('offline'))
    }, 20000)
    return () => clearInterval(h)
  }, [refreshJobs, refreshGallery])

  // ---- Generate ----
  const submit = useCallback(async (e) => {
    e?.preventDefault?.()
    if (!prompt.trim()) return
    setBusy(true)
    setError('')
    try {
      const body = {
        prompt: prompt.trim(),
        negative_prompt: negativePrompt || undefined,
        num_frames: frames,
        num_inference_steps: steps,
        guidance_scale: guide,
      }
      if (selectedModel) body.model = selectedModel
      if (selectedProvider) body.provider = selectedProvider
      if (seed) body.seed = parseInt(seed, 10)

      const d = await apiFetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (d.job_id) {
        setVideoMeta(`Queued · ${d.job_id.slice(0, 6)}`)
        pollJob(d.job_id)
        toast('Job queued', 'info')
      }
    } catch (err) {
      const msg = err.message || 'Generation failed'
      setError(msg)
      toast(msg, 'error')
    } finally {
      setBusy(false)
    }
  }, [prompt, negativePrompt, frames, steps, guide, selectedModel, selectedProvider, seed, pollJob, toast])

  const retryJob = useCallback(async (id) => {
    try {
      const d = await apiFetch(`/api/jobs/${id}/retry`, { method: 'POST' })
      if (d.job_id) pollJob(d.job_id)
      toast('Retrying...', 'info')
    } catch (err) {
      toast(err.message || 'Retry failed', 'error')
    }
  }, [pollJob, toast])

  const removeItem = useCallback(async (filename) => {
    try {
      await apiFetch(`/api/gallery/${filename}`, { method: 'DELETE' })
      refreshGallery()
      toast('Deleted', 'success')
    } catch (err) {
      toast(err.message || 'Delete failed', 'error')
    }
  }, [refreshGallery, toast])

  const value = {
    user, login, logout,
    apiKey, setApiKey,
    route, setRoute,
    prompt, setPrompt,
    negativePrompt, setNegativePrompt,
    models, selectedModel, setSelectedModel,
    selectedProvider, setSelectedProvider,
    frames, setFrames, steps, setSteps, guide, setGuide, seed, setSeed,
    busy, error, setError,
    submit, retryJob, removeItem,
    jobs, gallery, filter, setFilter,
    videoUrl, setVideoUrl, videoMeta, setVideoMeta,
    refreshJobs, refreshGallery,
    toasts, toast, health,
  }

  return (
    <KelvidContext.Provider value={value}>
      {children}
    </KelvidContext.Provider>
  )
}
