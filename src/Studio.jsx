import React from 'react'
import { useKelvid } from './context/KelvidContext.jsx'
import { IDEAS } from './constants.js'
import { resolveUrl } from './api.js'

export default function Studio() {
  const {
    prompt, setPrompt, negativePrompt, setNegativePrompt,
    models, selectedModel, setSelectedModel, selectedProvider, setSelectedProvider,
    frames, setFrames, steps, setSteps, guide, setGuide, seed, setSeed,
    busy, error, submit, retryJob, removeItem,
    jobs, gallery, filter, setFilter,
    videoUrl, setVideoUrl, videoMeta, setVideoMeta,
    refreshGallery, refreshJobs, user, setRoute,
  } = useKelvid()

  const shown = gallery.filter((x) => {
    const q = filter.toLowerCase()
    return !q || (x.prompt || '').toLowerCase().includes(q)
  })

  if (!user) {
    return (
      <div className="locked">
        <div className="locked-card">
          <h2>Sign in to use Studio</h2>
          <p>Create a free account to generate videos and save them to your gallery.</p>
          <button className="btn btn-primary" onClick={() => setRoute('login')}>Sign in / Create account</button>
        </div>
      </div>
    )
  }

  return (
    <div className="studio">
      <aside className="studio-left">
        <form onSubmit={submit} className="gen-panel">
          <div className="section">
            <div className="label-row">
              <label htmlFor="prompt">Prompt</label>
              <span className="count">{prompt.length}</span>
            </div>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to create..."
              rows={4}
            />
            <label htmlFor="negative" className="mt">Negative prompt</label>
            <textarea
              id="negative"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blurry, watermark, distorted faces..."
              rows={2}
            />
          </div>

          <div className="section">
            <label>Model</label>
            <div className="model-grid">
              {models.length === 0 && <span className="muted">Loading models...</span>}
              {models.map((m) => {
                const id = typeof m === 'string' ? m : (m.id || m.model || '')
                const label = typeof m === 'string' ? m : (m.label || m.id || id)
                const provider = typeof m === 'string' ? 'fal-ai' : (m.provider || '')
                const active = selectedModel === id && selectedProvider === provider
                return (
                  <button
                    key={id + provider}
                    type="button"
                    className={`model-btn ${active ? 'active' : ''}`}
                    onClick={() => { setSelectedModel(id); setSelectedProvider(provider) }}
                  >
                    <strong>{label.split('/').pop()}</strong>
                    <span>{provider}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="section">
            <label>Inspiration</label>
            <div className="chips">
              {IDEAS.map((idea, i) => (
                <button
                  key={i}
                  type="button"
                  className={`chip ${prompt === idea ? 'active' : ''}`}
                  onClick={() => setPrompt(idea)}
                >
                  {idea.slice(0, 28)}...
                </button>
              ))}
            </div>
          </div>

          <details className="advanced" open>
            <summary>Advanced settings</summary>
            <div className="adv-grid">
              <div>
                <label>Duration</label>
                <div className="chips">
                  {[24, 48, 96, 192, 384].map((f) => (
                    <button key={f} type="button" className={`chip ${frames === f ? 'active' : ''}`} onClick={() => setFrames(f)}>
                      {Math.round(f / 24)}s
                    </button>
                  ))}
                </div>
                <input type="range" min={8} max={720} value={frames} onChange={(e) => setFrames(+e.target.value)} />
                <span className="hint">{frames} frames · ~{Math.round(frames / 24)}s</span>
              </div>
              <div>
                <label>Steps ({steps})</label>
                <input type="range" min={5} max={80} value={steps} onChange={(e) => setSteps(+e.target.value)} />
              </div>
              <div>
                <label>Guidance ({guide})</label>
                <input type="range" min={1} max={20} step={0.5} value={guide} onChange={(e) => setGuide(+e.target.value)} />
              </div>
              <div>
                <label>Seed</label>
                <input type="text" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="blank = random" />
              </div>
            </div>
          </details>

          <button type="submit" className="btn btn-primary generate" disabled={busy || !prompt.trim()}>
            {busy ? 'Generating...' : 'Generate video'}
          </button>

          {error && <div className="error-box">{error}</div>}

          <div className="queue">
            <div className="queue-title">Live queue</div>
            {jobs.length === 0 && <p className="muted">No jobs yet</p>}
            {jobs.slice(0, 8).map((j) => (
              <div key={j.job_id} className="job">
                <span className={`badge ${j.status}`}>{j.status}</span>
                <span className="job-text">{(j.prompt || '').slice(0, 40)}</span>
                <div className="job-actions">
                  {j.status === 'done' && j.url && (
                    <button type="button" className="btn-ghost sm" onClick={() => { setVideoUrl(resolveUrl(j.url)); setVideoMeta(j.prompt) }}>Play</button>
                  )}
                  {j.status === 'failed' && (
                    <button type="button" className="btn-ghost sm" onClick={() => retryJob(j.job_id)}>Retry</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </form>
      </aside>

      <section className="studio-right">
        <div className="preview-card">
          <div className="card-head">
            <div>
              <h2>Preview</h2>
              <p>{videoMeta || 'Your video will appear here'}</p>
            </div>
            {videoUrl && <a className="btn-ghost sm" href={videoUrl} download>Download</a>}
          </div>
          {!videoUrl ? (
            <div className="empty">
              <span>🎬</span>
              <p>Generate a video to see it here</p>
            </div>
          ) : (
            <video key={videoUrl} src={videoUrl} controls autoPlay loop playsInline />
          )}
        </div>

        <div className="gallery-card">
          <div className="card-head">
            <div>
              <h2>Gallery</h2>
              <p>{shown.length} videos</p>
            </div>
            <div className="row">
              <input
                className="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search..."
              />
              <button type="button" className="btn-ghost sm" onClick={() => { refreshGallery(); refreshJobs() }}>↻</button>
            </div>
          </div>
          <div className="gallery-grid">
            {shown.map((x) => (
              <div key={x.filename} className="g-item" onClick={() => { setVideoUrl(x.url); setVideoMeta(x.prompt) }}>
                <video src={x.url} muted preload="metadata" />
                <button className="del" onClick={(e) => { e.stopPropagation(); removeItem(x.filename) }}>×</button>
                <div className="g-info">
                  <p>{(x.prompt || '').slice(0, 60)}</p>
                </div>
              </div>
            ))}
            {shown.length === 0 && (
              <div className="empty small">
                <p>No videos yet</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
