import React, { useState } from 'react'
import { useKelvid } from './context/KelvidContext.jsx'

export default function Settings() {
  const { apiKey, setApiKey, health, user, logout } = useKelvid()
  const [key, setKey] = useState(apiKey || '')
  const [saved, setSaved] = useState(false)

  const save = (e) => {
    e.preventDefault()
    setApiKey(key)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Account and backend connection</p>
        </div>
      </header>

      {user && (
        <div className="card">
          <h3>Account</h3>
          <div className="setting-row">
            <span>Name</span>
            <strong>{user.name}</strong>
          </div>
          <div className="setting-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="setting-row">
            <span>Credits</span>
            <strong>{user.credits}</strong>
          </div>
          <button className="btn-ghost danger" onClick={logout}>Log out</button>
        </div>
      )}

      <div className="card">
        <h3>Backend API Key</h3>
        <p className="muted">Only needed if your backend requires <code>KELVID_API_KEY</code>.</p>
        <form onSubmit={save}>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste your API key"
          />
          <div className="row mt">
            <button type="submit" className="btn btn-primary">Save key</button>
            {saved && <span className="success">Saved ✓</span>}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Backend status</h3>
        <p>{health}</p>
        <p className="muted">API URL: <code>{import.meta.env.VITE_API_URL || 'same-origin'}</code></p>
      </div>
    </div>
  )
}
