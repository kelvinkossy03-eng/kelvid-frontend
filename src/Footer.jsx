import React from 'react'
import { useKelvid } from './context/KelvidContext.jsx'
import { API_BASE } from './api.js'

export default function Footer() {
  const { setRoute } = useKelvid()

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <strong>Kelvid Studio</strong>
          <span>React · FastAPI · Hugging Face</span>
        </div>
        <div className="footer-links">
          <button type="button" onClick={() => setRoute('docs')}>Docs</button>
          <button type="button" onClick={() => setRoute('plans')}>Pricing</button>
          <span>API: {API_BASE || 'same-origin'}</span>
        </div>
      </div>
    </footer>
  )
}
