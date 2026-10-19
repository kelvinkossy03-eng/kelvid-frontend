import React from 'react'

export default function Docs() {
  return (
    <div>
      <div className="page-title">
        <h1>Docs</h1>
        <p>Connect frontend to backend</p>
      </div>
      <div className="card-grid">
        <div className="card">
          <h3>1. VITE_API_URL</h3>
          <p>Set env var to your backend URL, then redeploy.</p>
        </div>
        <div className="card">
          <h3>2. API key</h3>
          <p>If backend has <code>KELVID_API_KEY</code>, paste it in Settings.</p>
        </div>
        <div className="card">
          <h3>3. Health</h3>
          <p><code>/api/health</code> must return JSON with status ok.</p>
        </div>
      </div>
    </div>
  )
}
