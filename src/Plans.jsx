import React from 'react'

export default function Plans({ shown }) {
  return (
    <>
      <div className="page-hero">
        <h1>Plans and credits</h1>
        <p>Start free with 65 credits. Each generation uses credits based on duration and steps.</p>
      </div>
      <div className="card-grid">
        <div className="info-card">
          <h3>Starter — Free</h3>
          <p>65 credits, 720p, community support. Current default plan.</p>
        </div>
        <div className="info-card">
          <h3>Creator — $19/mo</h3>
          <p>1,000 credits, 1080p, priority queue, commercial use.</p>
        </div>
        <div className="info-card">
          <h3>Studio — $79/mo</h3>
          <p>5,000 credits, 4K upscales, API access, team seats.</p>
        </div>
      </div>
      <div className="info-card">
        <h3>How credits work</h3>
        <p>Short clips use fewer credits. Longer duration, more frames, and higher steps cost more. Failed jobs are not charged.</p>
      </div>
    </>
  )
}