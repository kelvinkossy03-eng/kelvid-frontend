import React from 'react'
import { useKelvid } from './context/KelvidContext.jsx'

const LINKS = [
  { id: 'landing', label: 'Home' },
  { id: 'studio', label: 'Studio' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'plans', label: 'Plans' },
  { id: 'docs', label: 'Docs' },
]

export default function Nav() {
  const { route, setRoute, user, logout, health } = useKelvid()

  return (
    <header className="nav">
      <div className="nav-inner">
        <button
          type="button"
          className="brand"
          onClick={() => setRoute('landing')}
          aria-label="Kelvid Studio home"
        >
          <img src="/logo.svg" alt="" width="36" height="36" />
          <div>
            <strong>Kelvid</strong>
            <span>Studio</span>
          </div>
        </button>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <button
              key={l.id}
              type="button"
              className={route === l.id ? 'active' : ''}
              onClick={() => setRoute(l.id)}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="nav-right">
          <div className={`health-pill ${health.startsWith('online') ? 'online' : 'offline'}`}>
            <span className="dot" />
            <span className="health-text">{health}</span>
          </div>

          {user ? (
            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-credits">{user.credits} credits</span>
              </div>
              <button type="button" className="btn-ghost sm" onClick={() => setRoute('settings')}>
                Settings
              </button>
              <button type="button" className="btn-ghost sm" onClick={logout}>
                Log out
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-primary sm" onClick={() => setRoute('login')}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
