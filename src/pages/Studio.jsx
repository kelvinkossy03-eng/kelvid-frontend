import React, { useState } from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'
import { IDEAS } from '../constants.js'
import { resolveUrl } from '../api.js'

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

  const [showAdv, setShowAdv] = useState(false)
  const [showNeg, setShowNeg] = useState(false)

  const shown = gallery.filter((x) => {
    const q = filter.toLowerCase()
    return !q || (x.prompt || '').toLowerCase().includes(q)
  })

  if (!user) {
    return (
      <div className="gate">
        <h2>Studio is locked</h2>
        <p>Sign in to generate and save videos.</p>
        <button type="button" className="btn-main" onClick={() => setRoute('login')}>Sign in</button>
      </div>
    )
  }

  return (
    <div className="studio-v2">
      {/* Top command bar */}
      <header className="stu-bar">
        <div className="stu-bar-left">
          <h1>Studio</h1>
          <span className="stu-pill">{jobs.filter((j) => j.status === 'running' || j.status === 'queued').length} active</span>
        </div>
        <div className="stu-bar-right">
          <button type="button" className={`stu-toggle ${showAdv ? 'on' : ''}`} onClick={() => setShowAdv((v) => !v)}>
            Advanced
          </button>
        </div>
      </header>

      {/* Main canvas: prompt + stage */}
      <div className="stu-canvas">
        <form className="stu-composer" onSubmit={submit}>
          <textarea
            className="stu-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the shot… e.g. drone over neon city in the rain"
            rows={3}
          />

          {showNeg && (
            <textarea
              className="stu-neg"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="Negative prompt — what to avoid"
              rows={2}
            />
          )}

          <div className="stu-toolbar">
            <div className="stu-models">
              {models.slice(0, 4).map((m) => {
                const id = typeof m === 'string' ? m : (m.id || m.model || '')
                const label = typeof m === 'string' ? m : (m.label || m.id || id)
                const provider = typeof m === 'string' ? 'fal-ai' : (m.provider || '')
                const active = selectedModel === id && selectedProvider === provider
                return (
                  <button
                    key={id + provider}
                    type="button"
                    className={`stu-model ${active ? 'on' : ''}`}
                    onClick={() => { setSelectedModel(id); setSelectedProvider(provider) }}
                  >
                    {label.split('/').pop()}
                  </button>
                )
              })}
            </div>

            <div className="stu-actions">
              <button type="button" className="stu-link" onClick={() => setShowNeg((v) => !v)}>
                {showNeg ? 'Hide negative' : 'Negative'}
              </button>
              <button type="submit" className="btn-main" disabled={busy || !prompt.trim()}>
                {busy ? 'Queuing…' : 'Generate'}
              </button>
            </div>
          </div>

          {showAdv && (
            <div className="stu-adv">
              <div className="stu-adv-row">
                <label>Duration
                  <div className="stu-seg">
                    {[24, 48, 96, 192].map((f) => (
                      <button key={f} type="button" className={frames === f ? 'on' : ''} onClick={() => setFrames(f)}>
                        {Math.round(f / 24)}s
                      </button>
                    ))}
                  </div>
                </label>
                <label>Steps
                  <input type="range" min={5} max={80} value={steps} onChange={(e) => setSteps(+e.target.value)} />
                  <em>{steps}</em>
                </label>
                <label>Guidance
                  <input type="range" min={1} max={20} step={0.5} value={guide} onChange={(e) => setGuide(+e.target.value)} />
                  <em>{guide}</em>
                </label>
                <label>Seed
                  <input type="text" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="random" />
                </label>
              </div>
            </div>
          )}

          <div className="stu-ideas">
            {IDEAS.map((idea, i) => (
              <button key={i} type="button" className="stu-idea" onClick={() => setPrompt(idea)}>
                {idea.slice(0, 40)}…
              </button>
            ))}
          </div>

          {error && <div className="stu-error">{error}</div>}
        </form>

        {/* Preview stage */}
        <div className="stu-stage">
          {!videoUrl ? (
            <div className="stu-stage-empty">
              <div className="stu-stage-mark">◎</div>
              <p>Generated video plays here</p>
            </div>
          ) : (
            <div className="stu-stage-player">
              <video key={videoUrl} src={videoUrl} controls autoPlay loop playsInline />
              <div className="stu-stage-meta">
                <span>{videoMeta}</span>
                <a href={videoUrl} download className="stu-link">Download</a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom strip: queue + recent gallery */}
      <div className="stu-strip">
        <div className="stu-strip-col">
          <div className="stu-strip-head">
            <h3>Queue</h3>
            <button type="button" className="stu-link" onClick={refreshJobs}>Refresh</button>
          </div>
          <div className="stu-queue">
            {jobs.length === 0 && <p className="stu-empty">No jobs yet</p>}
            {jobs.slice(0, 6).map((j) => (
              <div key={j.job_id} className="stu-qitem">
                <span className={`stu-status ${j.status}`}>{j.status}</span>
                <span className="stu-qtext">{(j.prompt || '').slice(0, 42)}</span>
                {j.status === 'done' && j.url && (
                  <button type="button" className="stu-link" onClick={() => { setVideoUrl(resolveUrl(j.url)); setVideoMeta(j.prompt) }}>Play</button>
                )}
                {j.status === 'failed' && (
                  <button type="button" className="stu-link" onClick={() => retryJob(j.job_id)}>Retry</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="stu-strip-col">
          <div className="stu-strip-head">
            <h3>Recent</h3>
            <input
              className="stu-search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter…"
            />
          </div>
          <div className="stu-thumbs">
            {shown.slice(0, 8).map((x) => (
              <button
                key={x.filename}
                type="button"
                className="stu-thumb"
                onClick={() => { setVideoUrl(x.url); setVideoMeta(x.prompt) }}
              >
                <video src={x.url} muted preload="metadata" />
              </button>
            ))}
            {shown.length === 0 && <p className="stu-empty">Gallery empty</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
