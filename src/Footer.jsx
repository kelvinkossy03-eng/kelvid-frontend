import React from 'react'
import { useKelvid } from './context/KelvidContext.jsx'

export default function Footer() {
  const { setRoute } = useKelvid()
  return (
    <footer>
      <div><strong>Kelvid Studio</strong> · AI Video Generation</div>
      <div className="links">
        <button type="button" onClick={() => setRoute('docs')}>Docs</button>
        <button type="button" onClick={() => setRoute('plans')}>Pricing</button>
        <button type="button" onClick={() => setRoute('settings')}>Settings</button>
        <span>help@kelvid.studio</span>
      </div>
    </footer>
  )
}
