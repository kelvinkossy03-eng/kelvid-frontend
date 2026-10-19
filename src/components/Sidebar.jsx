import React from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

const NAV = [
  { id: 'studio', label: 'Studio', icon: '◆' },
  { id: 'gallery', label: 'Gallery', icon: '▦' },
  { id: 'plans', label: 'Plans', icon: '◈' },
  { id: 'docs', label: 'Docs', icon: '◎' },
  { id: 'settings', label: 'Settings', icon: '◐' },
]

export default function Sidebar() {
  const { route, setRoute, user, logout, health } = useKelvid()
  const { theme, toggle } = useTheme()

  return (
    <aside className="sidebar">
      <button type="button" className="side-brand" onClick={() => setRoute('landing')}>
        <img src="/logo.svg" alt="" width="28" height="28" />
        <span>Kelvid</span>
      </button>

      <nav className="side-nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`side-link ${route === item.id ? 'active' : ''}`}
            onClick={() => setRoute(item.id)}
          >
            <span className="side-icon">{item.icon}</span>
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
            <button type="button" className="side-logout" onClick={logout} title="Log out">⎋</button>
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
