import React, { useCallback, useEffect, useRef, useState } from 'react'
import { API_BASE, apiFetch, resolveUrl } from './api.js'

// Global error handlers — log errors so we can diagnose blank-screen issues in production
window.onerror = (msg, url, line, col, err) => {
  console.error('Uncaught error:', msg, 'at', url, ':', line, ':', col, err)
  return false
}
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

// Simple ErrorBoundary so a render/effect crash shows a fallback UI instead of a blank screen
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

const IDEAS = [
  'Cinematic drone shot over a neon city at night, rain, reflections',
  'Corgi astronaut floating in space, stars, cinematic light',
  'Waterfall in a tropical jungle at sunrise, mist, drone shot',
  'Retro car driving through desert at sunset, film grain',
  'Underwater city with glowing whales, fantasy, volumetric light',
]

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
  const [prompt, setPrompt] = useState(IDEAS[0])
  const [negativePrompt, setNegativePrompt] = useState('')
  const [models, setModels] = useState([])
  const [model, setModel] = useState('')
  const [provider, setProvider] = useState('fal-ai')
  const [frames, setFrames] = useState(48)
  const [steps, setSteps] = useState(30)
  const [guide, setGuide] = useState(7.5)
  const [seed, setSeed] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [health, setHealth] = useState('connecting…')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [jobs, setJobs] = useState([])
  const [gallery, setGallery] = useState([])
  const [filter, setFilter] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoMeta, setVideoMeta] = useState('')
  const [toasts, setToasts] = useState([])

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
    setVideoMeta(`Job ${j.job_id.slice(0, 6)} · ${j.status} · ${elapsed}s`)
    refreshJobs()
    if (j.status === 'done') {
      setVideoUrl(url)
      setVideoMeta(`Done in ${elapsed}s · ${j.model}`)
      toast('Video ready!')
      refreshGallery()
    }
    if (j.status === 'failed') setError('Failed: ' + (j.error || 'unknown'))
  }, [refreshJobs, refreshGallery, toast])

  const poll = usePollJob(handleJob)

  useEffect(() => {
    apiFetch('/api/health').then((d) => {
      if (!d) return
      setHealth(d.token_configured ? `online v${d.version} · ${d.active_jobs} active` : 'online · NO HF TOKEN')
    }).catch(() => setHealth(API_BASE ? `cannot reach ${API_BASE}` : 'offline'))
    apiFetch('/api/models').then((d) => {
      if (!d) return
      setModels(d.models || [])
      if (d.default) setModel(d.default)
      if (d.provider) setProvider(d.provider)
    }).catch(() => toast('Failed to load models'))
    void refreshJobs().catch(() => toast('Failed to load jobs'))
    void refreshGallery().catch(() => toast('Failed to load gallery'))
    const h = setInterval(() => {
      apiFetch('/api/health').then((d) => {
        if (!d) return
        setHealth(d.token_configured ? `online v${d.version} · ${d.active_jobs} active` : 'online · NO HF TOKEN')
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
        provider,
        negative_prompt: negativePrompt || undefined,
        num_frames: frames,
        num_inference_steps: steps,
        guidance_scale: guide,
      }
      if (model) body.model = model
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
        setVideoMeta(`Queued · ${d.job_id.slice(0, 6)}`)
      }
      setBusy(false)
    } catch (err) {
      const msg = err.message || 'Generation failed'
      setError(msg)
      toast(msg)
      setBusy(false)
    }
  }, [prompt, negativePrompt, model, frames, steps, guide, seed, apiKey, poll, toast])
  const retryJob = useCallback(async (id) => {
    try {
      const headers = {}
      if (apiKey) headers['X-API-Key'] = apiKey
      const d = await apiFetch(`/api/jobs/${id}/retry`, { method: 'POST', headers })
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
      await apiFetch(`/api/gallery/${filename}`, { method: 'DELETE', headers })
      refreshGallery()
      toast('Deleted')
    } catch (err) {
      const msg = err.message || 'Delete failed'
      setError(msg)
      toast(msg)
    }
  }, [refreshGallery, toast, apiKey])

  const shown = gallery.filter((x) => {
    const q = filter.toLowerCase()
    return !q || (x.prompt || '').toLowerCase().includes(q)
  })

  return (
    <ErrorBoundary>
      <div className="wrap">
      <nav className="nav">
        <div className="nav-inner">
          <div className="logo">K</div>
          <div className="brand">
            <h1>Kelvid Studio</h1>
            <small>AI Video Generation</small>
          </div>
          <div className="spacer" />
          <div className="status-pill">
            <span className={`dot ${health.includes('NO HF TOKEN') ? 'offline' : health.includes('online') ? 'online' : 'offline'}`} />
            <span>{health}</span>
          </div>
        </div>
      </nav>

      <main>
        <div className="panel-left">
          <form onSubmit={submit} className="gen-form">
            <div className="field-group">
              <div className="field-label">
                <label htmlFor="prompt">Prompt</label>
                <span className="field-count">{prompt.length}</span>
              </div>
              <textarea
                id="prompt"
                name="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video you want to create…"
                rows={4}
              />
            </div>

            <div className="field-group">
              <div className="field-label">
                <label htmlFor="model">Model</label>
              </div>
              <select
                id="model"
                name="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}>
                <option value="">Auto-select</option>
                {models.map((m) => {
                  const modelId = typeof m === 'string' ? m : (m.id || m.model || '')
                  return (
                    <option key={modelId} value={modelId}>{modelId.split('/').pop()}</option>
                  )
                })}
              </select>
            </div>

            <div className="field-group">
              <div className="field-label">
                <span>Inspiration</span>
              </div>
              <div className="chips">
                {IDEAS.map((idea, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`chip ${prompt === idea ? 'active' : ''}`}
                    onClick={() => setPrompt(idea)}
                  >
                    {idea.slice(0, 30)}…
                  </button>
                ))}
              </div>
            </div>

            <details className="glass">
              <summary>âš™ï¸ Advanced settings</summary>
              <div className="accordion-body row-2">
                <div>
                  <label htmlFor="frames">Frames</label>
                  <input
                    id="frames"
                    name="frames"
                    type="range"
                    min={8}
                    max={150}
                    value={frames}
                    onChange={(e) => setFrames(+e.target.value)}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{frames} frames</span>
                </div>
                <div>
                  <label htmlFor="steps">Steps ({steps})</label>
                  <input
                    id="steps"
                    name="steps"
                    type="range"
                    min={5}
                    max={60}
                    value={steps}
                    onChange={(e) => setSteps(+e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="guidance">Guidance ({guide})</label>
                  <input
                    id="guidance"
                    name="guidance"
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={guide}
                    onChange={(e) => setGuide(+e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="seed">Seed</label>
                  <input
                    id="seed"
                    name="seed"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="blank = random"
                  />
                </div>
              </div>
            </details>

            <details className="glass">
              <summary>ðŸ”‘ API key (if server requires)</summary>
              <div className="accordion-body">
                <label htmlFor="apiKey">X-API-Key</label>
                <input
                  id="apiKey"
                  name="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="paste server key…"
                />
              </div>
            </details>

            <button className="btn btn-primary btn-generate" type="submit" disabled={busy}>
              {busy ? 'Queuing…' : 'âœ¨ Generate video'}
            </button>

            {error && <div className="err-msg">{error}</div>}

            <div className="live-queue-label">Live queue</div>
            <div className="jobs-list">
              {jobs.length === 0 && <div className="job-row"><small>No jobs yet</small></div>}
              {jobs.slice(0, 10).map((j) => (
                <div className="job-row" key={j.job_id}>
                  <span className={`status-badge ${j.status}`}>{j.status}</span>
                  <small className="job-prompt">{j.prompt ? j.prompt.slice(0, 60) : ''}</small>
                  <div className="job-actions">
                  {j.status === 'done' && j.url && (
                    <button type="button" className="btn-ghost" onClick={() => { setVideoUrl(resolveUrl(j.url)); setVideoMeta('From queue') }}>Play</button>
                  )}
                  {j.status === 'failed' && (
                    <button type="button" className="btn-ghost" onClick={() => retryJob(j.job_id)}>Retry</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          </form>
        </div>

        <div className="panel-right">
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h2>Preview</h2>
                <div className="card-sub">{videoMeta || 'Your video will appear here.'}</div>
              </div>
              {videoUrl && (
                <a className="btn-ghost" href={videoUrl} download style={{ textDecoration: 'none' }}>⬇️ Download</a>
              )}
            </div>
            {!videoUrl && (
              <div className="preview-empty">
                <span className="big">🎬</span>
                <p>Generate your first video to see it here.</p>
              </div>
            )}
            {videoUrl && (
              <div className="video-player">
                <video className="main" key={videoUrl} src={videoUrl} controls autoPlay loop playsInline />
              </div>
            )}
          </div>

          <div className="glass-card">
            <div className="card-header">
              <div>
                <h2>Gallery</h2>
                <div className="card-sub">{shown.length} videos</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="gallery-search"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search prompts…"
                />
                <button type="button" className="btn-ghost" onClick={() => { refreshGallery(); refreshJobs() }}>⇨️</button>
              </div>
            </div>
            <div className="gallery-grid">
              {shown.map((x) => (
                <div className="gallery-item" key={x.filename} onClick={() => { setVideoUrl(x.url); setVideoMeta(x.prompt) }}>
                  <video src={x.url} muted preload="metadata" />
                  <button className="gallery-delete" title="Delete" onClick={(e) => { e.stopPropagation(); removeItem(x.filename) }}>✖️</button>
                  <div className="gallery-info">
                    <div className="gallery-prompt">{x.prompt ? x.prompt.slice(0, 80) : ''}</div>
                    <div className="gallery-meta">
                      {(typeof x.model === 'string' ? x.model : (x.model && x.model.id) || '').split('/').pop()} · {(x.created_at || '').slice(0, 10)}
                    </div>
                  </div>
                </div>
              ))}
              {shown.length === 0 && (
                <div className="gallery-empty">
                  <span className="big">📁</span>
                  <p>No videos yet. Generate your first one!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="toasts-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>

      <footer>
        Kelvid · React + FastAPI + Hugging Face · API: {API_BASE || 'same-origin'}
      </footer>
      </div>
    </ErrorBoundary>
  )
}







