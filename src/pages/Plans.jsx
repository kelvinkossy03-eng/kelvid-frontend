import React from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'

const PLANS = [
  { name: 'Starter', price: 'Free', desc: '65 credits · 720p · community support', cta: 'Current plan' },
  { name: 'Creator', price: '$19/mo', desc: '1,000 credits · 1080p · priority queue · commercial use', cta: 'Upgrade' },
  { name: 'Studio', price: '$79/mo', desc: '5,000 credits · 4K · API access · team seats', cta: 'Upgrade' },
]

export default function Plans() {
  const { setRoute } = useKelvid()
  return (
    <div className="page-body">
      <header className="page-top">
        <div>
          <h1>Plans</h1>
          <p>Start free. Upgrade when you need more.</p>
        </div>
      </header>
      <div className="plans-grid">
        {PLANS.map((p) => (
          <div key={p.name} className="plan-card">
            <h3>{p.name}</h3>
            <div className="plan-price">{p.price}</div>
            <p>{p.desc}</p>
            <button className="btn-ghost" onClick={() => setRoute('studio')}>{p.cta}</button>
          </div>
        ))}
      </div>
      <div className="panel" style={{ marginTop: 24 }}>
        <h3>How credits work</h3>
        <p className="muted">Shorter clips use fewer credits. Longer duration and higher steps cost more. Failed jobs are not charged.</p>
      </div>
    </div>
  )
}
