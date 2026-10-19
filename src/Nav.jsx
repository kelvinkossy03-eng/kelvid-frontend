import React from 'react'

const LINKS = [
  ['landing', 'Home'],
  ['studio', 'Studio'],
  ['gallery', 'Gallery'],
  ['plans', 'Plans'],
  ['docs', 'Docs'],
  ['settings', 'Settings'],
]

export default function Nav({ route, setRoute, apiKey, setApiKey }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <button
          type="button"
          className="brand-btn"
          onClick={() => setRoute('landing')}
          aria-label="Kelvid Studio home"
        >
          <img className="logo-img" src="/logo.svg" alt="" width="36" height="36" />
          <span className="brand">
            <span className="brand-title">Kelvid Studio</span>
            <small>AI Video Generation</small>
          </span>
        </button>
        <div className="nav-links" role="navigation" aria-label="Primary">
          {LINKS.map(([r, label]) => (
            <button
              key={r}
              type="button"
              className={route === r ? 'active' : ''}
              onClick={() => setRoute(r)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="spacer" />
        {apiKey ? (
          <div className="status-pill" title="Backend generation key active">
            <span className="dot online" />
            <span>API key · {apiKey.slice(0, 6)}…</span>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => setRoute('settings')}>
            Set API key
          </button>
        )}
      </div>
    </nav>
  )
}