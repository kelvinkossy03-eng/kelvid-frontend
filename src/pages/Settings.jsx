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
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div>
      <div className="page-title">
        <h1>Settings</h1>
        <p>Account, theme, backend</p>
      </div>
      <div className="card-grid">
        {user && (
          <div className="card">
            <h3>Account</h3>
            <div className="kv-row"><span>Name</span><strong>{user.name}</strong></div>
            <div className="kv-row"><span>Email</span><strong>{user.email}</strong></div>
            <div className="kv-row"><span>Credits</span><strong>{user.credits}</strong></div>
            <button type="button" className="btn-ghost danger" style={{ marginTop: 14 }} onClick={logout}>Log out</button>
          </div>
        )}
        <div className="card">
          <h3>Theme</h3>
          <div className="theme-row">
            <button type="button" className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')}>Light</button>
            <button type="button" className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')}>Dark</button>
          </div>
        </div>
        <div className="card">
          <h3>API key</h3>
          <p style={{ marginBottom: 8 }}>Only if backend requires KELVID_API_KEY.</p>
          <form onSubmit={save} className="field-stack">
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Paste key" />
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="submit" className="btn-main">Save</button>
              {saved && <span style={{ color: 'var(--ok)', fontSize: 13 }}>Saved</span>}
            </div>
          </form>
        </div>
        <div className="card">
          <h3>Backend</h3>
          <p>{health}</p>
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-3)' }}>
            <code>{import.meta.env.VITE_API_URL || 'same-origin'}</code>
          </p>
        </div>
      </div>
    </div>
  )
}
