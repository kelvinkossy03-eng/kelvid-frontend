import React from 'react'
import { IDEAS } from './constants.js'
import { resolveUrl } from './api.js'

export default function Studio({
  prompt, setPrompt, negativePrompt, setNegativePrompt,
  models, setModels, selectedModel, setSelectedModel, selectedProvider, setSelectedProvider,
  frames, setFrames, steps, setSteps, guide, setGuide, seed, setSeed,
  apiKey, setApiKey,
  busy, error,
  submit, retryJob, removeItem,
  refreshGallery, refreshJobs, poll,
  jobs, gallery, filter, setFilter,
  videoUrl, setVideoUrl, videoMeta, setVideoMeta,
}) {
  const shown = gallery.filter((x) => {
    const q = filter.toLowerCase()
    return !q || (x.prompt || '').toLowerCase().includes(q)
  })

  return (
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
            <div className="field-label mt-10">
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
                <span className="text-sm text-muted">
                  Output: {frames} frames at 24 fps = {Math.round(frames / 24)} seconds (maximum 60 seconds)
                </span>
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
            {busy ? 'Queuing and generating...' : `Generate video`}
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
                  {j.error && <small className="text-danger">{String(j.error).slice(0, 80)}</small>}
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
            {videoUrl && <a className="btn-ghost text-none px-sm" href={videoUrl} download>⬇️ Download</a>}
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
            <div className="gap-8">
              <input
                className="gallery-search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search gallery by prompt..."
                aria-label="Search gallery by prompt"
              />
              <button type="button" className="btn-ghost px-sm" onClick={() => { refreshGallery(); refreshJobs() }}>⇨</button>
            </div>
          </div>
          <div className="gallery-grid">
            {shown.map((x) => (
              <div className="gallery-item" key={x.filename} onClick={() => { setVideoUrl(x.url); setVideoMeta(x.prompt) }}>
                <video src={x.url} muted preload="metadata" />
                <button className="gallery-delete" title="Delete" onClick={(e) => { e.stopPropagation(); removeItem(x.filename) }}>✖</button>
                <div className="gallery-info">
                  <div className="gallery-prompt">{x.prompt ? x.prompt.slice(0, 80) : ''}</div>
                  <div className="gallery-meta">
                    {(typeof x.model === 'string' ? x.model : (x.model && x.model.id) || '').split('/').pop()} | {(x.created_at || '').slice(0, 10)}
                  </div>
                </div>
              </div>
            ))}
            {gallery.length > 0 && (
              <button type="button" className="btn-ghost mt-10" onClick={() => { if (window.confirm('Delete all gallery videos?')) { gallery.forEach((g) => removeItem(g.filename)) } }}>Delete all videos</button>
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
  )
}