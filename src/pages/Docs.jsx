import React from 'react'

export default function Docs() {
  return (
    <div className="page-body">
      <header className="page-top">
        <div>
          <h1>Docs</h1>
          <p>Connect and use Kelvid Studio</p>
        </div>
      </header>
      <div className="panel">
        <h3>1. Set VITE_API_URL</h3>
        <p className="muted">In Vercel or Netlify, add <code>VITE_API_URL</code> pointing to your backend. Redeploy after saving.</p>
      </div>
      <div className="panel">
        <h3>2. API key</h3>
        <p className="muted">Only if the backend sets <code>KELVID_API_KEY</code>. Paste the same value in Settings. Sent as <code>X-API-Key</code>.</p>
      </div>
      <div className="panel">
        <h3>3. Health check</h3>
        <p className="muted">Open <code>/api/health</code> on the backend. It must return JSON with <code>status: "ok"</code>.</p>
      </div>
    </div>
  )
}
