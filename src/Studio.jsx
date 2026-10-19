import React from 'react'
import { useKelvid } from './context/KelvidContext.jsx'
import { IDEAS } from './constants.js'
import { resolveUrl } from './api.js'

export default function Studio() {
  const {
    prompt, setPrompt,
    negativePrompt, setNegativePrompt,
    models, selectedModel, setSelectedModel,
    selectedProvider, setSelectedProvider,
    frames, setFrames, steps, setSteps, guide, setGuide, seed, setSeed,
    busy, error, submit, retryJob, removeItem,
    jobs, gallery, filter, setFilter,
    videoUrl, setVideoUrl, videoMeta, setVideoMeta,
    refreshGallery, refreshJobs,
  } = useKelvid()

  const shown = gallery.filter((x) => {
    const q = filter.toLowerCase()
    return !q || (x.prompt || '').toLowerCase().includes(q)
  })

  return (
    <div className="studio">
      {/* LEFT — Controls */}
      <aside className="studio-left">
        <form onSubmit={submit} className="gen-panel">
          <div className="panel-header">
            <h2>Create</h2>
            <p>Describe the video you want</p>
          </div>

          <div className="field">
            <div className="field-top">
              <label htmlFor="prompt">Prompt</label>
              <span className="count">{prompt.length}</span>
            </div>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cinematic drone shot over a neon city at night, rain reflecting on the streets..."
              rows={4}
            />
          </div>

          <div className="field">
            <label htmlFor="negative">Negative prompt</label>
            <textarea
              id="negative"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blurry, watermark, distorted faces, low quality..."
              rows={2}
            />
          </div>

          {/* Model selection */}
          <div className="field">
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
                    className={`model-card ${active ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedModel(id)
                      setSelectedProvider(provider)
                    }}
                  >
                    <span className="model-name">{label.split('/').pop()}</span>
                    <span className="model-provider">{provider}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Inspiration */}
          <div className="field">
            <label>Inspiration</label>
            <div className="chips">
              {IDEAS.map((idea, i) => (
                <button
                  key={i}
                  type="button"
                  className={`chip ${prompt === idea ? 'active' : ''}`}
                  onClick={() => setPrompt(idea)}
                  title={idea}
                >
                  {idea.slice(0, 28)}…
                </button>
              ))}
            </div>
          </div>

          {/* Advanced */}
          <details className="advanced">
            <summary>Advanced settings</summary>
            <div className="advanced-body">
              <div className="field">
                <label>Duration</label>
                <div className="chips">
                  {[24, 48, 96, 192, 384].map((f) => (
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
                  type="range"
                  min={8}
                  max={480}
                  value={frames}
                  onChange={(e) => setFrames(+e.target.value)}
                />
                <span className="hint">{frames} frames ≈ {Math.round(frames / 24)}s</span>
              </div>

              <div className="row-2">
                <div className="field">
                  <label>Steps ({steps})</label>
                  <input type="range" min={5} max={80} value={steps} onChange={(e) => setSteps(+e.target.value)} />
                </div>
                <div className="field">
                  <label>Guidance ({guide})</label>
                  <input type="range" min={1} max={20} step={0.5} value={guide} onChange={(e) => setGuide(+e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="seed">Seed (optional)</label>
                <input
                  id="seed"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Leave blank for random"
                />
              </div>
            </div>
          </details>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={busy || !prompt.trim()}
          >
            {busy ? 'Generating…' : 'Generate video'}
          </button>

          {error && <div className="error-box">{error}</div>}

          {/* Live queue */}
          <div className="queue">
            <div className="queue-title">Live queue</div>
            {jobs.length === 0 && (
              <p className="muted">No jobs yet. Your generations will appear here.</p>
            )}
            {jobs.slice(0, 8).map((j) => (
              <div className="job" key={j.job_id}>
                <span className={`badge ${j.status}`}>{j.status}</span>
                <span className="job-text">{(j.prompt || '').slice(0, 45) || '—'}</span>
                <div className="job-actions">
                  {j.status === 'done' && j.url && (
                    <button
                      type="button"
                      className="btn-ghost xs"
                      onClick={() => {
                        setVideoUrl(resolveUrl(j.url))
                        setVideoMeta(`From queue · ${j.job_id.slice(0, 6)}`)
                      }}
                    >
                      Play
                    </button>
                  )}
                  {j.status === 'failed' && (
                    <button type="button" className="btn-ghost xs" onClick={() => retryJob(j.job_id)}>
                      Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </form>
      </aside>

      {/* RIGHT — Preview + Gallery */}
      <section className="studio-right">
        <div className="preview-card">
          <div className="card-top">
            <div>
              <h3>Preview</h3>
              <p>{videoMeta || 'Your video will appear here'}</p>
            </div>
            {videoUrl && (
              <a className="btn-ghost sm" href={videoUrl} download>
                Download
              </a>
            )}
          </div>

          {!videoUrl ? (
            <div className="empty-state">
              <span className="empty-icon">🎬</span>
              <p>Generate a video to see it here</p>
            </div>
          ) : (
            <div className="video-wrap">
              <video key={videoUrl} src={videoUrl} controls autoPlay loop playsInline />
            </div>
          )}
        </div>

        <div className="gallery-card">
          <div className="card-top">
            <div>
              <h3>Gallery</h3>
              <p>{shown.length} video{shown.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="gallery-tools">
              <input
                className="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search…"
              />
              <button
                type="button"
                className="btn-ghost sm"
                onClick={() => { refreshGallery(); refreshJobs() }}
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="gallery-grid">
            {shown.map((x) => (
              <div
                className="g-item"
                key={x.filename}
                onClick={() => {
                  setVideoUrl(x.url)
                  setVideoMeta(x.prompt || '')
                }}
              >
                <video src={x.url} muted preload="metadata" />
                <button
                  className="g-delete"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeItem(x.filename)
                  }}
                >
                  ✕
                </button>
                <div className="g-info">
                  <p>{(x.prompt || '').slice(0, 60)}</p>
                  <span>{(x.created_at || '').slice(0, 10)}</span>
                </div>
              </div>
            ))}

            {shown.length === 0 && (
              <div className="empty-state small">
                <p>{gallery.length === 0 ? 'No videos yet' : 'No matches'}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
