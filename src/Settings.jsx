import React, { useState } from 'react'
import { apiFetch, setApiKey } from './api.js'

export default function Settings({ apiKey, setApiKey, health }) {
  const [key, setKey] = useState(apiKey || '')
  const [saved, setSaved] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setApiKey(key)
    try {
      await apiFetch('/api/health')
      localStorage.setItem('kelvid-api-key', key)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setSaved('bad')
    }
  }

  return (
    <div className="wrap">
      <div className="page-hero">
        <h1>Backend connection</h1>
        <p>Generate requests are signed with a single <b>X-API-Key</b> value. Paste the same key in your backend (KELVID_API_KEY) and here — the backend validates every generation call.</p>
      </div>

      <div className="glass-card" style={{ padding: 22 }}>
        <div className="card-header">
          <h2>X-API-Key (frontend)</h2>
        </div>
        <form onSubmit={save}>
          <div className="sora-field">
            <label htmlFor="apiKey">Key</label>
            <input
              id="apiKey"
              className="sora-input"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste KELVID_API_KEY"
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 14 }}>
            <button type="submit" className="btn btn-primary btn-generate">Save key</button>
            {saved === 'saved' && <span style={{ color: '#34d399', fontWeight: 800 }}>Saved ✓</span>}
            {saved === 'bad' && <span style={{ color: '#fb7185', fontWeight: 800 }}>Not reachable — check backend URL & key</span>}
          </div>
        </form>
      </div>

      <div className="info-card">
        <h3>Backend status</h3>
        <p>{health}</p>
        <p className="card-sub" style={{ margin: 0 }}>
          Backend URL: <code style={{ background: 'rgba(255,255,255,.08)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{import.meta.env.VITE_API_URL || 'same-origin'}</code>
        </p>
      </div>

      <div className="info-card" style={{ marginTop: 16 }}>
        <h3>Server setup</h3>
        <p className="card-sub" style={{ margin: 0 }}>
          On the backend, add <b>KELVID_API_KEY</b> to the environment / <code>.env</code>, restart the server, then paste the same value into the key field above.
        </p>
      </div>
    </div>
  )
}