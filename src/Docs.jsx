import React from 'react'

export default function Docs() {
  return (
    <>
      <div className="page-hero">
        <h1>Docs and API key help</h1>
        <p>Connect the frontend to your backend, then generate from Studio.</p>
      </div>
      <div className="info-card">
        <h3>1. Set VITE_API_URL</h3>
        <p>In Vercel: Settings → Environment Variables → VITE_API_URL = your backend URL (for example https://kelvid-backend.onrender.com). Redeploy after saving.</p>
      </div>
      <div className="info-card">
        <h3>2. API key</h3>
        <p>Only needed if your backend sets KELVID_API_KEY. Paste it in Studio → API key field. Requests send it as the X-API-Key header.</p>
      </div>
      <div className="info-card">
        <h3>3. Health check</h3>
        <p>Open /api/health on your backend. It must return JSON with status ok. If it returns HTML, VITE_API_URL is wrong or the backend is down.</p>
      </div>
    </>
  )
}