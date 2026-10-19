import React from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'

const PLANS = [
  { name: 'Starter', price: 'Free', desc: '65 credits · 720p · community' },
  { name: 'Creator', price: '$19', desc: '1,000 credits · 1080p · priority · commercial' },
  { name: 'Studio', price: '$79', desc: '5,000 credits · 4K · API · team seats' },
]

export default function Plans() {
  const { setRoute } = useKelvid()
  return (
    <div>
      <div className="page-title">
        <h1>Plans</h1>
        <p>Start free, scale when you need to</p>
      </div>
      <div className="card-grid">
        {PLANS.map((p) => (
          <div key={p.name} className="card">
            <h3>{p.name}</h3>
            <div className="plan-price">{p.price}</div>
            <p>{p.desc}</p>
            <button type="button" className="btn-ghost" style={{ marginTop: 14 }} onClick={() => setRoute('studio')}>
              {p.price === 'Free' ? 'Current' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
