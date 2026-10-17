import React, { useCallback, useEffect, useRef, useState } from 'react'
import { API_BASE, apiFetch, resolveUrl } from './api.js'
import { useAuth } from './auth.jsx'
import Nav from './Nav.jsx'
import Studio from './Studio.jsx'
import Gallery from './Gallery.jsx'
import Plans from './Plans.jsx'
import Docs from './Docs.jsx'
import Settings from './Settings.jsx'
import ToastContainer from './ToastContainer.jsx'
import Footer from './Footer.jsx'

window.onerror = (msg, url, line, col, err) => {
  console.error('Uncaught error:', msg, 'at', url, ':', line, ':', col, err)
  return false
}
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true, errorInfo })
    console.error('ErrorBoundary caught:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="wrap" style={{ padding: 40, textAlign: 'center', color: 'var(--text)' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null })
              window.location.reload()
            }}
            className="btn btn-primary"
          >
            Refresh page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function usePollJob(onDone) {
  const polling = useRef(new Set())
  const poll = useCallback(async (id) => {
    if (polling.current.has(id)) return
    polling.current.add(id)
    const t0 = Date.now()
    try {
      for (;;) {
        await new Promise((r) => setTimeout(r, 4000))
        let j
        try { j = await apiFetch(`/api/jobs/${id}`) } catch (err) {
          toast(`Poll failed: ${err.message}`)
          break
        }
        onDone(j, Math.round((Date.now() - t0) / 1000))
        if (j.status === 'done' || j.status === 'failed') break
      }
    } finally {
      polling.current.delete(id)
    }
  }, [onDone])
  return poll
}

export default function App() {
  const { user, openAuth, signOut } = useAuth()
  const [route, setRoute] = useState('studio')
  const [accountOpen, setAccountOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [models, setModels] = useState([])

  const [apiKey, setApiKey] = useState('')
  const [health, setHealth] = useState('connecting...')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [jobs, setJobs] = useState([])
  const [gallery, setGallery] = useState([])
  const [filter, setFilter] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoMeta, setVideoMeta] = useState('')
  const [toasts, setToasts] = useState([])

  const [showSettings, setShowSettings] = useState(false)
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [frames, setFrames] = useState(48)
  const [steps, setSteps] = useState(30)
  const [guide, setGuide] = useState(7.5)
  const [seed, setSeed] = useState('')

  const toast = useCallback((msg) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500)
  }, [])

  const refreshJobs = useCallback(async () => {
    try {
      const d = await apiFetch('/api/jobs')
      setJobs(d.jobs || [])
    } catch (err) {
      toast(err.message || 'Failed to load jobs')
    }
  }, [toast])

  const refreshGallery = useCallback(async () => {
    try {
      const d = await apiFetch('/api/gallery')
      setGallery((d.items || []).map((x) => ({ ...x, url: resolveUrl(x.url) })))
    } catch (err) {
      toast(err.message || 'Failed to load gallery')
    }
  }, [toast])

  const handleJob = useCallback((j, elapsed) => {
    if (!j) return
    const url = resolveUrl(j.url)
    setVideoMeta(`Job ${j.job_id.slice(0, 6)} | ${j.status} | ${elapsed}s`)
    refreshJobs()
    if (j.status === 'done') {
      setVideoUrl(url)
      setVideoMeta(`Done in ${elapsed}s | ${j.model}`)
      toast('Video ready!')
      refreshGallery()
    }
    if (j.status === 'failed') setError('Failed: ' + (j.error || 'unknown'))
  }, [refreshJobs, refreshGallery, toast])

  const poll = usePollJob(handleJob)

  useEffect(() => {
    apiFetch('/api/health').then((d) => {
      if (!d) return
      setHealth(d.token_configured ? `online v${d.version} | ${d.active_jobs} active` : 'online | NO HF TOKEN')
    }).catch(() => setHealth(API_BASE ? `cannot reach ${API_BASE}` : 'offline'))
    apiFetch('/api/models').then((d) => {
      if (!d) return
      setModels(d.models || [])
      if (d.default) setSelectedModel(d.default)
      if (d.provider) setSelectedProvider(d.provider)
    }).catch(() => toast('Failed to load models'))
    void refreshJobs().catch(() => toast('Failed to load jobs'))
    void refreshGallery().catch(() => toast('Failed to load gallery'))
    const h = setInterval(() => {
      apiFetch('/api/health').then((d) => {
        if (!d) return
        setHealth(d.token_configured ? `online v${d.version} | ${d.active_jobs} active` : 'online | NO HF TOKEN')
      }).catch(() => setHealth('cannot reach backend'))
    }, 15000)
    return () => clearInterval(h)
  }, [])

  const submit = useCallback(async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return
    setBusy(true)
    setError('')
    try {
      const body = {
        prompt,
        negative_prompt: negativePrompt || undefined,
        num_frames: frames,
        num_inference_steps: steps,
        guidance_scale: guide,
      }
      if (selectedModel) body.model = selectedModel
      if (selectedProvider) body.provider = selectedProvider
      if (seed) body.seed = parseInt(seed, 10)
      const headers = { 'Content-Type': 'application/json' }
      if (apiKey) headers['X-API-Key'] = apiKey
      const d = await apiFetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      if (d.job_id) {
        poll(d.job_id)
        setVideoMeta(`Queued | ${d.job_id.slice(0, 6)}`)
      }
      setBusy(false)
    } catch (err) {
      const msg = err.message || 'Generation failed'
      setError(msg)
      toast(msg)
      setBusy(false)
    }
  }, [prompt, negativePrompt, selectedModel, selectedProvider, frames, steps, guide, seed, apiKey, poll, toast])

  const retryJob = useCallback(async (id) => {
    try {
      const headers = {}
      if (apiKey) headers['X-API-Key'] = apiKey
      const d = await apiFetch('/api/jobs/' + id + '/retry', { method: 'POST', headers })
      if (d.job_id) poll(d.job_id)
    } catch (err) {
      const msg = err.message || 'Retry failed'
      setError(msg)
      toast(msg)
    }
  }, [poll, apiKey, toast])

  const removeItem = useCallback(async (filename) => {
    try {
      const headers = {}
      if (apiKey) headers['X-API-Key'] = apiKey
      await apiFetch('/api/gallery/' + filename, { method: 'DELETE', headers })
      refreshGallery()
      toast('Deleted')
    } catch (err) {
      const msg = err.message || 'Delete failed'
      setError(msg)
      toast(msg)
    }
  }, [refreshGallery, toast, apiKey])

  const userCredits = user ? user.credits : 65

  return (
    <ErrorBoundary>
      <div className="wrap">
        <Nav
          route={route}
          setRoute={setRoute}
          user={user}
          health={health}
          openAuth={openAuth}
          accountOpen={accountOpen}
          setAccountOpen={setAccountOpen}
          signOut={signOut}
          toast={toast}
        />

        {route === 'studio' && (
          <Studio
            prompt={prompt}
            setPrompt={setPrompt}
            negativePrompt={negativePrompt}
            setNegativePrompt={setNegativePrompt}
            models={models}
            setModels={setModels}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            frames={frames}
            setFrames={setFrames}
            steps={steps}
            setSteps={setSteps}
            guide={guide}
            setGuide={setGuide}
            seed={seed}
            setSeed={setSeed}
            apiKey={apiKey}
            setApiKey={setApiKey}
            busy={busy}
            error={error}
            submit={submit}
            retryJob={retryJob}
            removeItem={removeItem}
            refreshGallery={refreshGallery}
            refreshJobs={refreshJobs}
            poll={poll}
            jobs={jobs}
            gallery={gallery}
            filter={filter}
            setFilter={setFilter}
            videoUrl={videoUrl}
            setVideoUrl={setVideoUrl}
            videoMeta={videoMeta}
            setVideoMeta={setVideoMeta}
          />
        )}

        {route === 'gallery' && <Gallery
          shown={gallery.filter((x) => {
            const q = filter.toLowerCase()
            return !q || (x.prompt || '').toLowerCase().includes(q)
          })}
          gallery={gallery}
          filter={filter}
          setFilter={setFilter}
          refreshGallery={refreshGallery}
          refreshJobs={refreshJobs}
          removeItem={removeItem}
        />}

        {route === 'plans' && <Plans />}

        {route === 'docs' && <Docs />}

        {route === 'settings' && <Settings
          user={user}
          health={health}
          openAuth={openAuth}
          signOut={signOut}
          toast={toast}
          frames={frames}
          selectedModel={selectedModel}
          selectedProvider={selectedProvider}
        />}

        <ToastContainer toasts={toasts} />
        <Footer setRoute={setRoute} />
      </div>
    </ErrorBoundary>
  )
}