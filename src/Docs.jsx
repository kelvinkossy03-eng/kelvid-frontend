import React from 'react'

export default function Docs() {
  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <h1>Documentation</h1>
          <p>How to connect and use Kelvid Studio</p>
        </div>
      </header>
      <div className="card">
        <h3>1. Set VITE_API_URL</h3>
        <p className="muted">In your host (Vercel / Netlify): add environment variable <code>VITE_API_URL</code> pointing to your backend (e.g. https://your-backend.onrender.com). Redeploy after saving.</p>
      </div>
      <div className="card">
        <h3>2. API Key</h3>
        <p className="muted">Only needed if the backend has <code>KELVID_API_KEY</code> set. Paste the same value in Settings. Requests send it as the <code>X-API-Key</code> header.</p>
      </div>
      <div className="card">
        <h3>3. Health check</h3>
        <p className="muted">Open <code>/api/health</code> on your backend. It must return JSON with <code>status: "ok"</code>. If you see HTML, the URL is wrong or the backend is down.</p>
      </div>
    </div>
  )
}
