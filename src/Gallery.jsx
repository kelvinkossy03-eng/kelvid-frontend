import React from 'react'
import { useKelvid } from './context/KelvidContext.jsx'

export default function Gallery() {
  const { gallery, filter, setFilter, refreshGallery, refreshJobs, removeItem, setVideoUrl, setVideoMeta, setRoute, user } = useKelvid()

  const shown = gallery.filter((x) => {
    const q = filter.toLowerCase()
    return !q || (x.prompt || '').toLowerCase().includes(q)
  })

  if (!user) {
    return (
      <div className="locked">
        <div className="locked-card">
          <h2>Sign in to view your gallery</h2>
          <button className="btn btn-primary" onClick={() => setRoute('login')}>Sign in</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <h1>Gallery</h1>
          <p>All your generated videos in one place</p>
        </div>
        <div className="row">
          <input
            className="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by prompt..."
          />
          <button className="btn-ghost" onClick={() => { refreshGallery(); refreshJobs() }}>Refresh</button>
        </div>
      </header>

      <div className="gallery-grid large">
        {shown.map((x) => (
          <div key={x.filename} className="g-item">
            <video src={x.url} controls muted preload="metadata" />
            <button className="del" onClick={() => removeItem(x.filename)}>×</button>
            <div className="g-info">
              <p>{(x.prompt || '').slice(0, 100)}</p>
              <span>{(x.created_at || '').slice(0, 10)}</span>
            </div>
          </div>
        ))}
      </div>

      {shown.length === 0 && (
        <div className="empty">
          <span>📁</span>
          <p>{gallery.length === 0 ? 'No videos yet. Go to Studio and generate your first one.' : 'No matches for your search.'}</p>
          {gallery.length === 0 && (
            <button className="btn btn-primary" onClick={() => setRoute('studio')}>Open Studio</button>
          )}
        </div>
      )}

      {gallery.length > 0 && (
        <div className="danger-zone">
          <button
            className="btn-ghost danger"
            onClick={() => {
              if (window.confirm('Delete ALL videos? This cannot be undone.')) {
                gallery.forEach((g) => removeItem(g.filename))
              }
            }}
          >
            Delete all videos
          </button>
        </div>
      )}
    </div>
  )
}
