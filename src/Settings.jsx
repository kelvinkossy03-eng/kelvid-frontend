import React, { useState } from 'react'
import { useKelvid } from './context/KelvidContext.jsx'
import { apiFetch } from './api.js'

export default function Settings() {
  const { apiKey, setApiKey, health, user, logout } = useKelvid()
  const [key, setKey] = useState(apiKey || '')
  const [status, setStatus] = useState(null)

  const save = async (e) => {
    e.preventDefault()
    setApiKey(key)
    try {
      await apiFetch('/api/health')
      setStatus('ok')
      setTimeout(() => setStatus(null), 2500)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Account and backend connection</p>
        </div>
      </div>

      {user && (
        <div className="settings-card">
          <h3>Account</h3>
          <div className="settings-row">
            <span>Name</span>
            <strong>{user.name}</strong>
          </div>
          <div className="settings-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="settings-row">
            <span>Credits</span>
            <strong>{user.credits}</strong>
          </div>
          <button type="button" className="btn-ghost danger" onClick={logout} style={{ marginTop: 16 }}>
            Log out
          </button>
        </div>
      )}

      <div className="settings-card">
        <h3>Backend API key</h3>
        <p className="muted">
          Only needed if your backend requires <code>KELVID_API_KEY</code>.
          Requests send it as the <code>X-API-Key</code> header.
        </p>
        <form onSubmit={save}>
          <div className="field">
            <label htmlFor="apiKey">API Key</label>
            <input
              id="apiKey"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste your KELVID_API_KEY"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save key</button>
            {status === 'ok' && <span className="success">Saved ✓</span>}
            {status === 'error' && <span className="error-text">Backend not reachable</span>}
          </div>
        </form>
      </div>

      <div className="settings-card">
        <h3>Backend status</h3>
        <p>{health}</p>
        <p className="muted">
          URL: <code>{import.meta.env.VITE_API_URL || 'same-origin'}</code>
        </p>
      </div>
    </div>
  )
}
