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
    <nav className="nav">
      <div className="nav-inner">
        <button type="button" className="brand" onClick={() => setRoute('landing')}>
          <img src="/logo.svg" alt="" width="36" height="36" />
          <div>
            <strong>Kelvid</strong>
            <span>Studio</span>
          </div>
        </button>

        <div className="nav-links">
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
        </div>

        <div className="nav-right">
          <div className={`health ${health.startsWith('online') ? 'ok' : 'bad'}`}>
            <span className="dot" />
            {health}
          </div>

          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.name || user.email}</span>
              <span className="credits">{user.credits} credits</span>
              <button type="button" className="btn-ghost sm" onClick={() => setRoute('settings')}>Settings</button>
              <button type="button" className="btn-ghost sm" onClick={logout}>Log out</button>
            </div>
          ) : (
            <button type="button" className="btn btn-primary sm" onClick={() => setRoute('login')}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
