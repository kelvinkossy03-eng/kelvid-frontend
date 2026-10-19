import React from 'react'
import { useKelvid } from './context/KelvidContext.jsx'

export default function Gallery() {
  const {
    gallery, filter, setFilter,
    refreshGallery, refreshJobs, removeItem,
    setVideoUrl, setVideoMeta, setRoute,
  } = useKelvid()

  const shown = gallery.filter((x) => {
    const q = filter.toLowerCase()
    return !q || (x.prompt || '').toLowerCase().includes(q)
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Gallery</h1>
          <p>All your generated videos in one place</p>
        </div>
        <div className="page-actions">
          <input
            className="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by prompt…"
          />
          <button
            type="button"
            className="btn-ghost"
            onClick={() => { refreshGallery(); refreshJobs() }}
          >
            Refresh
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setRoute('studio')}>
            + New video
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="empty-state large">
          <span className="empty-icon">📁</span>
          <h3>{gallery.length === 0 ? 'No videos yet' : 'No matches found'}</h3>
          <p>
            {gallery.length === 0
              ? 'Open Studio and generate your first clip.'
              : `Nothing matches "${filter}".`}
          </p>
          {gallery.length === 0 && (
            <button type="button" className="btn btn-primary" onClick={() => setRoute('studio')}>
              Go to Studio
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="gallery-grid large">
            {shown.map((x) => (
              <div className="g-item" key={x.filename}>
                <video src={x.url} controls muted preload="metadata" />
                <button
                  className="g-delete"
                  type="button"
                  onClick={() => removeItem(x.filename)}
                >
                  ✕
                </button>
                <div className="g-info">
                  <p>{(x.prompt || '').slice(0, 100)}</p>
                  <span>
                    {(typeof x.model === 'string' ? x.model : x.model?.id || '')
                      .split('/')
                      .pop()}{' '}
                    · {(x.created_at || '').slice(0, 10)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {gallery.length > 0 && (
            <div className="danger-zone">
              <button
                type="button"
                className="btn-ghost danger"
                onClick={() => {
                  if (window.confirm('Delete all videos? This cannot be undone.')) {
                    gallery.forEach((g) => removeItem(g.filename))
                  }
                }}
              >
                Delete all videos
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
