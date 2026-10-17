import React from 'react'
import { API_BASE } from './api.js'

export default function Footer({ setRoute }) {
  return (
    <footer>
      <div>
        <strong>Kelvid Studio</strong> | React + FastAPI + Hugging Face | API: {API_BASE || 'same-origin'}
      </div>
      <div className="gap-8 px-sm">
        <span>Terms</span>
        <span>Privacy</span>
        <span>Support: help@kelvid.studio</span>
        <button type="button" className="btn-ghost px-sm" onClick={() => setRoute('docs')}>
          Docs
        </button>
        <button type="button" className="btn-ghost px-sm" onClick={() => setRoute('plans')}>
          Pricing
        </button>
      </div>
    </footer>
  )
}