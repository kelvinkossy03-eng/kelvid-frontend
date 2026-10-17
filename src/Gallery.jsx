import React from 'react'

export default function Gallery({ shown, gallery, filter, setFilter, refreshGallery, refreshJobs, removeItem }) {
  return (
    <>
      <div className="page-hero">
        <h1>Gallery</h1>
        <p>Every render is saved here. Search by prompt, click a video to play it, or delete what you no longer need.</p>
      </div>

      <div className="card-header">
        <div>
          <h2>{shown.length} videos</h2>
          <div className="card-sub">{gallery.length === 0 ? 'No renders yet — your archive fills up as you generate.' : `${gallery.length} total in your archive`}</div>
        </div>
        <div className="gap-8">
          <input
            className="gallery-search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search gallery by prompt..."
            aria-label="Search gallery by prompt"
          />
          <button type="button" className="btn-ghost" onClick={() => { refreshGallery(); refreshJobs() }}>Refresh</button>
        </div>
      </div>

      <div className="gallery-grid">
        {shown.map((x) => (
          <div className="gallery-item" key={x.filename}>
            <video src={x.url} controls muted preload="metadata" />
            <button
              type="button"
              className="gallery-delete"
              title="Delete"
              onClick={(e) => { e.stopPropagation(); removeItem(x.filename) }}
            >
              ✖
            </button>
            <div className="gallery-info">
              <div className="gallery-prompt">{x.prompt ? x.prompt.slice(0, 120) : ''}</div>
              <div className="gallery-meta">
                {(typeof x.model === 'string' ? x.model : (x.model && x.model.id) || '').split('/').pop()} | {(x.created_at || '').slice(0, 10)}
              </div>
            </div>
          </div>
        ))}
        {gallery.length > 0 && shown.length === 0 && (
          <div className="gallery-empty">
            <span className="big">🔍</span>
            <p>No videos match "{filter}". Clear the search to see everything.</p>
          </div>
        )}
        {gallery.length === 0 && (
          <div className="gallery-empty">
            <span className="big">📁</span>
            <p>No videos yet. Open Studio and generate your first clip — it will appear here automatically.</p>
          </div>
        )}
      </div>

      {gallery.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => { if (window.confirm('Delete all gallery videos?')) { gallery.forEach((g) => removeItem(g.filename)) } }}
          >
            Delete all videos
          </button>
        </div>
      )}
    </>
  )
}