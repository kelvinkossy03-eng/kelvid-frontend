import React from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'

const PLANS = [
  { name: 'Starter', price: 'Free', features: ['65 credits', '720p', 'Community'], current: true },
  { name: 'Creator', price: '$19', features: ['1,000 credits', '1080p', 'Priority rendering', 'Commercial use'], hot: true },
  { name: 'Studio', price: '$79', features: ['5,000 credits', '4K', 'API access', 'Team seats'] },
]

const Tick = () => (
  <span className="tick" aria-hidden="true">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
  </span>
)

export default function Plans() {
  const { setRoute } = useKelvid()
  return (
    <div>
      <div className="page-title rise">
        <h1>Plans</h1>
        <p>Start free, scale when you need to</p>
      </div>
      <div className="plan-grid">
        {PLANS.map((p, i) => (
          <div key={p.name} className={`plan ${p.hot ? 'hot' : ''}`} style={{ animationDelay: `${i * 80}ms` }}>
            {p.hot && <span className="plan-tag">Best for creators</span>}
            <h3>{p.name}</h3>
            <div className="plan-price">{p.price}</div>
            <ul className="plan-list">
              {p.features.map((f) => (
                <li key={f}><Tick />{f}</li>
              ))}
            </ul>
            {p.current ? (
              <button type="button" className="btn-ghost" disabled>Current plan</button>
            ) : (
              <button type="button" className={`${p.hot ? 'btn-main cta' : 'btn-ghost'}`} onClick={() => setRoute('studio')}>
                Upgrade
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
