import React, { useState } from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Settings() {
  const { apiKey, setApiKey, health, user, logout } = useKelvid()
  const { theme, setTheme } = useTheme()
  const [key, setKey] = useState(apiKey || '')
  const [saved, setSaved] = useState(false)

  const save = (e) => {
    e.preventDefault()
    setApiKey(key)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-body">
      <header className="page-top">
        <div>
          <h1>Settings</h1>
          <p>Account, theme, and backend</p>
        </div>
      </header>

      <div className="settings-grid">
        {user && (
          <div className="panel">
            <h3>Account</h3>
            <div className="kv"><span>Name</span><strong>{user.name}</strong></div>
            <div className="kv"><span>Email</span><strong>{user.email}</strong></div>
            <div className="kv"><span>Credits</span><strong>{user.credits}</strong></div>
            <button className="btn-ghost danger" onClick={logout} style={{ marginTop: 16 }}>Log out</button>
          </div>
        )}

        <div className="panel">
          <h3>Appearance</h3>
          <p className="muted" style={{ marginBottom: 12 }}>Choose light or dark mode</p>
          <div className="theme-pills">
            <button type="button" className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>Light</button>
            <button type="button" className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>Dark</button>
          </div>
        </div>

        <div className="panel">
          <h3>Backend API key</h3>
          <p className="muted" style={{ marginBottom: 12 }}>Only needed if your backend requires KELVID_API_KEY.</p>
          <form onSubmit={save}>
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Paste API key" />
            <div className="inline-row" style={{ marginTop: 12 }}>
              <button type="submit" className="btn btn-primary">Save key</button>
              {saved && <span className="ok-text">Saved</span>}
            </div>
          </form>
        </div>

        <div className="panel">
          <h3>Backend status</h3>
          <p>{health}</p>
          <p className="muted" style={{ marginTop: 8 }}>
            API URL: <code>{import.meta.env.VITE_API_URL || 'same-origin'}</code>
          </p>
        </div>
      </div>
    </div>
  )
}
