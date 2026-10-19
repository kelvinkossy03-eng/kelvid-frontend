import React from 'react'
import { useKelvid } from './context/KelvidContext.jsx'

const PLANS = [
  { name: 'Starter', price: 'Free', desc: '65 credits · 720p · community support', cta: 'Current plan' },
  { name: 'Creator', price: '$19/mo', desc: '1,000 credits · 1080p · priority queue · commercial use', cta: 'Upgrade' },
  { name: 'Studio', price: '$79/mo', desc: '5,000 credits · 4K · API access · team seats', cta: 'Upgrade' },
]

export default function Plans() {
  const { setRoute } = useKelvid()
  return (
    <div className="page-content">
      <header className="page-header">
        <div>
          <h1>Plans & Credits</h1>
          <p>Start free. Upgrade when you need more.</p>
        </div>
      </header>
      <div className="features">
        {PLANS.map((p) => (
          <div key={p.name} className="feature">
            <h3>{p.name}</h3>
            <p style={{ fontSize: 22, fontWeight: 700, margin: '8px 0', color: 'var(--text)' }}>{p.price}</p>
            <p>{p.desc}</p>
            <button className="btn-ghost" style={{ marginTop: 14 }} onClick={() => setRoute('studio')}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h3>How credits work</h3>
        <p className="muted">Shorter clips use fewer credits. Longer duration and higher steps cost more. Failed jobs are not charged.</p>
      </div>
    </div>
  )
}
