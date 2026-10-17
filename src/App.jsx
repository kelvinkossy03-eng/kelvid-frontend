import React, { useCallback, useEffect, useRef, useState } from 'react'
import { API_BASE, apiFetch, resolveUrl } from './api.js'
import { useAuth } from './auth.jsx'

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
  const { user, openAuth, signOut } = useAuth()
  const [route, setRoute] = useState('studio')
  const [accountOpen, setAccountOpen] = useState(false)
  const [prompt, setPrompt] = useState(IDEAS[0])
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

  const [showSettings, setShowSettings] = useState(false)
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [frames, setFrames] = useState(48)
  const [steps, setSteps] = useState(30)
  const [guide, setGuide] = useState(7.5)
  const [seed, setSeed] = useState('')

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
          <img className="logo-img" src="/logo.svg" alt="Kelvid Studio logo" width="36" height="36" />
          <div className="brand">
            <h1>Kelvid Studio</h1>
            <small>AI Video Generation</small>
          </div>
          <div className="nav-links" role="navigation" aria-label="Primary">
            {['studio', 'gallery', 'plans', 'docs', 'settings'].map((r) => (
              <button key={r} type="button" className={route === r ? 'active' : ''} onClick={() => setRoute(r)}>
                {r[0].toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <div className="spacer" />
          <span className="credit-pill" title="Remaining generation credits">Credits: {user ? user.credits : 65}</span>
          <div className="status-pill" title="Backend connection status">
            <span className={`dot ${health.includes('NO HF TOKEN') ? 'offline' : health.includes('online') ? 'online' : 'offline'}`} />
            <span>{health}</span>
          </div>
          {!user && (
            <>
              <button type="button" className="btn-ghost" onClick={() => openAuth('signin')}>Sign in</button>
              <button type="button" className="btn btn-primary" style={{ padding: '8px 14px' }} onClick={() => openAuth('signup')}>Get started</button>
            </>
          )}
          {user && (
            <div className="account-menu">
              <button type="button" className="btn-ghost account-chip" onClick={() => setAccountOpen((v) => !v)} aria-haspopup="menu" aria-expanded={accountOpen}>
                <span aria-hidden="true">Account</span>
                <strong>{user.name}</strong>
              </button>
              {accountOpen && (
                <div className="account-dropdown" role="menu">
                  <strong>{user.name}</strong>
                  <small>{user.email} | {user.plan} plan | {user.credits} credits</small>
                  <button type="button" className="btn-ghost" onClick={() => { setRoute('settings'); setAccountOpen(false) }}>Settings</button>
                  <button type="button" className="btn-ghost" onClick={() => { setRoute('plans'); setAccountOpen(false) }}>Billing and plans</button>
                  <button type="button" className="btn-ghost" onClick={() => { signOut(); setAccountOpen(false); toast('Signed out.') }}>Log out</button>
                </div>
              )}
            </div>
          )}
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
                placeholder="Describe the video you want to create..."
                rows={4}
              />
              <div className="field-label" style={{ marginTop: 10 }}>
                <label htmlFor="negativePrompt">Negative prompt</label>
              </div>
              <textarea
                id="negativePrompt"
                name="negativePrompt"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="What to avoid: blurry, watermark, distorted faces..."
                rows={2}
              />
            </div>

            <div className="field-group">
              <div className="field-label">
                <label htmlFor="model">Model</label>
              </div>
              <div className="model-cards">
                {models.length === 0 && <span className="muted">Loading models...</span>}
                {models.map((m) => {
                  const modelId = typeof m === 'string' ? m : (m.id || m.model || '')
                  const modelLabel = typeof m === 'string' ? m : (m.label || m.id || modelId)
                  const modelProvider = typeof m === 'string' ? 'fal-ai' : (m.provider || '')
                  const isSelected = selectedModel === modelId && selectedProvider === modelProvider
                  return (
                    <label
                      key={modelId}
                      className={`model-card ${isSelected ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="model"
                        value={JSON.stringify({ id: modelId, provider: modelProvider })}
                        checked={isSelected}
                        onChange={() => {
                          setSelectedModel(modelId)
                          setSelectedProvider(modelProvider)
                        }}
                      />
                      <span>{modelLabel.split('/').pop()}</span>
                      <span className="model-provider">{modelProvider}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="field-group">
              <div className="field-label">
                <span>Try an inspiration prompt</span>
                <span className="field-count">Tap to fill the prompt box</span>
              </div>
              <div className="chips">
                {IDEAS.map((idea, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`chip ${prompt === idea ? 'active' : ''}`}
                    onClick={() => setPrompt(idea)}
                    title={idea}
                  >
                    {idea.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            <details className="glass" open>
              <summary>Advanced settings — duration, quality, seed (click to collapse)</summary>
              <div className="accordion-body row-2">
                <div>
                  <label htmlFor="frames">Duration and frames</label>
                  <div className="chips" style={{ marginBottom: 8 }}>
                    {[96, 192, 384, 720, 1440].map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={`chip ${frames === f ? 'active' : ''}`}
                        onClick={() => setFrames(f)}
                      >
                        {Math.round(f / 24)}s
                      </button>
                    ))}
                  </div>
                  <input
                    id="frames"
                    name="frames"
                    type="range"
                    min={8}
                    max={1440}
                    value={frames}
                    onChange={(e) => setFrames(+e.target.value)}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Output: {frames} frames at 24 fps = {Math.round(frames / 24)} seconds (maximum 60 seconds)</span>
                </div>
                <div>
                  <label htmlFor="steps">Steps ({steps})</label>
                  <input
                    id="steps"
                    name="steps"
                    type="range"
                    min={5}
                    max={80}
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
              <summary>Backend API key — only if your server requires one</summary>
              <div className="accordion-body">
                <label htmlFor="apiKey">API key (sent as X-API-Key header)</label>
                <input
                  id="apiKey"
                  name="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste server key... (see Docs page)"
                />
              </div>
            </details>

            <button className="btn btn-primary btn-generate" type="submit" disabled={busy || !prompt.trim()} title={!prompt.trim() ? 'Enter a prompt first' : 'Generate video'}>
              {busy ? 'Queuing and generating...' : `Generate video (${user ? user.credits : 65} credits available)`}
            </button>
            {!prompt.trim() && <div className="err-msg">Enter a prompt above to enable Generate.</div>}

            {error && <div className="err-msg" role="alert">Generation error: {error}</div>}

            <div className="live-queue-label">Live queue — queued, running, done, failed</div>
            <div className="jobs-list">
              {jobs.length === 0 && <div className="job-row"><small>No jobs yet. Your generations will appear here with timestamps and status.</small></div>}
              {jobs.slice(0, 10).map((j) => (
                <div className="job-row" key={j.job_id} title={`Job ${j.job_id} — ${j.status}`}>
                  <span className={`status-badge ${j.status}`}>{j.status}</span>
                  <small className="job-prompt">{j.prompt ? j.prompt.slice(0, 60) : '(no prompt)'} | {(j.created_at || '').slice(0, 19).replace('T', ' ')}</small>
                  <div className="job-actions">
                  {j.status === 'done' && j.url && (
                    <button type="button" className="btn-ghost" onClick={() => { setVideoUrl(resolveUrl(j.url)); setVideoMeta(`From queue ${j.job_id.slice(0, 6)}`) }}>Play</button>
                  )}
                  {j.status === 'failed' && (
                    <button type="button" className="btn-ghost" onClick={() => retryJob(j.job_id)}>Retry</button>
                  )}
                  {j.error && <small style={{ color: 'var(--danger)' }}>{String(j.error).slice(0, 80)}</small>}
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
                <div className="card-sub">{videoMeta || 'Your video will appear here with playback controls.'}</div>
              </div>
              {videoUrl && (
                <a className="btn-ghost" href={videoUrl} download style={{ textDecoration: 'none' }}>⬇️ Download</a>
              )}
            </div>
            {!videoUrl && (
              <div className="preview-empty">
                <span className="big">🎬</span>
                <p>Generate your first video to see playback, download, and share controls here.</p>
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
                <div className="card-sub">{shown.length} videos in your archive</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="gallery-search"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search gallery by prompt..."
                  aria-label="Search gallery by prompt"
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
                      {(typeof x.model === 'string' ? x.model : (x.model && x.model.id) || '').split('/').pop()} | {(x.created_at || '').slice(0, 10)}
                    </div>
                  </div>
                </div>
              ))}
              {gallery.length > 0 && (
                <button type="button" className="btn-ghost" style={{ marginBottom: 10 }} onClick={() => { if (window.confirm('Delete all gallery videos?')) { gallery.forEach((g) => removeItem(g.filename)) } }}>Delete all videos</button>
              )}
              {shown.length === 0 && gallery.length === 0 && (
                <div className="gallery-empty">
                  <span className="big">📁</span>
                  <p>No videos match. Generate your first video from Studio, or clear the search above.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {route !== 'studio' && (
        <div className="page-shell">
          {route === 'gallery' && (
            <>
              <div className="page-hero"><h1>Gallery</h1><p>Every render is saved here. Use Studio search for quick filtering; this is your full archive view.</p></div>
              <div className="info-card"><h3>{shown.length} videos</h3><p>Tip: open Studio, then use Gallery search to filter by prompt text.</p></div>
            </>
          )}
          {route === 'plans' && (
            <>
              <div className="page-hero"><h1>Plans and credits</h1><p>Start free with 65 credits. Each generation uses credits based on duration and steps.</p></div>
              <div className="card-grid">
                <div className="info-card"><h3>Starter — Free</h3><p>65 credits, 720p, community support. Current default plan.</p></div>
                <div className="info-card"><h3>Creator — $19/mo</h3><p>1,000 credits, 1080p, priority queue, commercial use.</p></div>
                <div className="info-card"><h3>Studio — $79/mo</h3><p>5,000 credits, 4K upscales, API access, team seats.</p></div>
              </div>
              <div className="info-card"><h3>How credits work</h3><p>Short clips use fewer credits. Longer duration, more frames, and higher steps cost more. Failed jobs are not charged.</p></div>
            </>
          )}
          {route === 'docs' && (
            <>
              <div className="page-hero"><h1>Docs and API key help</h1><p>Connect the frontend to your backend, then generate from Studio.</p></div>
              <div className="info-card"><h3>1. Set VITE_API_URL</h3><p>In Vercel: Settings → Environment Variables → VITE_API_URL = your backend URL (for example https://kelvid-backend.onrender.com). Redeploy after saving.</p></div>
              <div className="info-card"><h3>2. API key</h3><p>Only needed if your backend sets KELVID_API_KEY. Paste it in Studio → API key field. Requests send it as the X-API-Key header.</p></div>
              <div className="info-card"><h3>3. Health check</h3><p>Open /api/health on your backend. It must return JSON with status ok. If it returns HTML, VITE_API_URL is wrong or the backend is down.</p></div>
            </>
          )}
          {route === 'settings' && (
            <>
              <div className="page-hero"><h1>Settings</h1><p>Account, API connection, defaults, and data controls.</p></div>
              <div className="info-card">
                <h3>Account</h3>
                <p>{user ? `${user.name} (${user.email}) — ${user.plan}, ${user.credits} credits` : 'You are browsing as a guest. Sign in to save your profile.'}</p>
                {!user && <button type="button" className="btn-ghost" style={{ marginTop: 8 }} onClick={() => openAuth('signin')}>Sign in</button>}
                {user && <button type="button" className="btn-ghost" style={{ marginTop: 8 }} onClick={() => { signOut(); toast('Signed out.') }}>Log out</button>}
              </div>
              <div className="info-card">
                <h3>API connection</h3>
                <p>Backend: {API_BASE || 'same-origin'} | Status: {health}</p>
                <div className="settings-row"><span>Backend API key header</span><span>X-API-Key</span></div>
                <div className="settings-row"><span>Default frames</span><span>{frames} frames ({Math.round(frames / 24)}s)</span></div>
                <div className="settings-row"><span>Default model</span><span>{selectedModel ? selectedModel.split('/').pop() : 'Auto-select'}</span></div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="toasts-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>

      <footer>
        <div><strong>Kelvid Studio</strong> | React + FastAPI + Hugging Face | API: {API_BASE || 'same-origin'}</div>
        <div style={{ marginTop: 8, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span>Terms</span><span>Privacy</span><span>Support: help@kelvid.studio</span>
          <button type="button" className="btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setRoute('docs')}>Docs</button>
          <button type="button" className="btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setRoute('plans')}>Pricing</button>
        </div>
      </footer>
      </div>
    </ErrorBoundary>
  )
}







