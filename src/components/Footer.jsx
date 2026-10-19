import React from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'

export default function Footer() {
  const { setRoute } = useKelvid()
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <strong>Kelvid Studio</strong>
          <span>AI video generation</span>
        </div>
        <div className="footer-links">
          <button type="button" onClick={() => setRoute('docs')}>Docs</button>
          <button type="button" onClick={() => setRoute('plans')}>Pricing</button>
          <button type="button" onClick={() => setRoute('settings')}>Settings</button>
        </div>
      </div>
    </footer>
  )
}
