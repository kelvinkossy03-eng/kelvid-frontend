import React from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

const ico = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

const ICONS = {
  studio: (
    <svg viewBox="0 0 24 24" {...ico}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 17v4M17 19h4" /></svg>
  ),
  gallery: (
    <svg viewBox="0 0 24 24" {...ico}><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /></svg>
  ),
  plans: (
    <svg viewBox="0 0 24 24" {...ico}><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>
  ),
  docs: (
    <svg viewBox="0 0 24 24" {...ico}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" {...ico}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" /></svg>
  ),
}

const NAV = [
  { id: 'studio', label: 'Studio' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'plans', label: 'Plans' },
  { id: 'docs', label: 'Docs' },
  { id: 'settings', label: 'Settings' },
]

export default function Sidebar() {
  const { route, setRoute, user, logout, health } = useKelvid()
  const { theme, toggle } = useTheme()

  return (
    <aside className="sidebar">
      <button type="button" className="side-brand" onClick={() => setRoute('landing')} aria-label="Kelvid home">
        <span className="wordmark">Kelvid</span>
      </button>

      <nav className="side-nav" aria-label="Main">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`side-link ${route === item.id ? 'active' : ''}`}
            aria-current={route === item.id ? 'page' : undefined}
            onClick={() => setRoute(item.id)}
          >
            <span className="side-icon">{ICONS[item.id]}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="side-foot">
        <div className={`side-health ${health.startsWith('online') ? 'on' : 'off'}`}>
          <i />
          <span>{health.startsWith('online') ? 'Online' : 'Offline'}</span>
        </div>

        <button type="button" className="side-theme" onClick={toggle} title="Toggle theme">
          {theme === 'dark' ? '☀ Light' : '☾ Dark'}
        </button>

        {user ? (
          <div className="side-user">
            <div className="side-avatar">{(user.name || 'U')[0].toUpperCase()}</div>
            <div className="side-user-meta">
              <strong>{user.name}</strong>
              <span>{user.credits} credits</span>
            </div>
            <button type="button" className="side-logout" onClick={logout} title="Log out" aria-label="Log out">⎋</button>
          </div>
        ) : (
          <button type="button" className="side-signin" onClick={() => setRoute('login')}>
            Sign in
          </button>
        )}
      </div>
    </aside>
  )
}
