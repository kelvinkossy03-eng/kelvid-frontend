import React from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

const LINKS = [
  { id: 'landing', label: 'Home' },
  { id: 'studio', label: 'Studio' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'plans', label: 'Plans' },
  { id: 'docs', label: 'Docs' },
]

export default function Nav() {
  const { route, setRoute, user, logout, health } = useKelvid()
  const { theme, toggle } = useTheme()

  return (
    <nav className="nav">
      <div className="nav-inner">
        <button type="button" className="brand" onClick={() => setRoute('landing')}>
          <img src="/logo.svg" alt="" width="30" height="30" />
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
            <span className="health-text">{health}</span>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.name || user.email}</span>
              <span className="credits">{user.credits}</span>
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
