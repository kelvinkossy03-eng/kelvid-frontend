import React, { useState } from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'

export default function Gallery() {
  const { gallery, filter, setFilter, refreshGallery, refreshJobs, removeItem, setRoute, user } = useKelvid()
  const [active, setActive] = useState(null)

  const shown = gallery.filter((x) => {
    const q = filter.toLowerCase()
    return !q || (x.prompt || '').toLowerCase().includes(q)
  })

  if (!user) {
    return (
      <div className="gate">
        <h2>Gallery is locked</h2>
        <p>Sign in to see your archive.</p>
        <button type="button" className="btn-main" onClick={() => setRoute('login')}>Sign in</button>
      </div>
    )
  }

  return (
    <div className="gal">
      <header className="gal-head">
        <div>
          <h1>Gallery</h1>
          <p>{gallery.length} clips stored</p>
        </div>
        <div className="gal-tools">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search prompts…"
          />
          <button type="button" className="btn-ghost" onClick={() => { refreshGallery(); refreshJobs() }}>
            Refresh
          </button>
        </div>
      </header>

      {shown.length === 0 ? (
        <div className="gate">
          <p>{gallery.length === 0 ? 'Nothing here yet. Generate from Studio.' : 'No matches.'}</p>
          {gallery.length === 0 && (
            <button type="button" className="btn-main" onClick={() => setRoute('studio')}>Go to Studio</button>
          )}
        </div>
      ) : (
        <div className="gal-masonry">
          {shown.map((x, i) => (
            <article key={x.filename} className="gal-item" style={{ animationDelay: `${Math.min(i, 12) * 60}ms` }} onClick={() => setActive(x)}>
              <video src={x.url} muted preload="metadata" />
              <div className="gal-item-info">
                <p>{x.prompt || 'Untitled'}</p>
                <span>{(x.created_at || '').slice(0, 10)}</span>
              </div>
              <button
                type="button"
                className="gal-item-del"
                onClick={(e) => { e.stopPropagation(); removeItem(x.filename) }}
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      )}

      {gallery.length > 0 && (
        <div className="gal-foot">
          <button
            type="button"
            className="btn-ghost danger"
            onClick={() => {
              if (window.confirm('Delete every video in the gallery?')) {
                gallery.forEach((g) => removeItem(g.filename))
              }
            }}
          >
            Delete all
          </button>
        </div>
      )}

      {active && (
        <div className="lightbox" onClick={() => setActive(null)}>
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            <video src={active.url} controls autoPlay playsInline />
            <div className="lightbox-meta">
              <p>{active.prompt}</p>
              <div className="lightbox-acts">
                <a href={active.url} download className="btn-main">Download</a>
                <button type="button" className="btn-ghost" onClick={() => setActive(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
