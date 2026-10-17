import React from 'react'

export default function Gallery({ shown, gallery, filter, setFilter, refreshGallery, refreshJobs, removeItem }) {
  return (
    <>
      <div className="page-hero">
        <h1>Gallery</h1>
        <p>Every render is saved here. Use Studio search for quick filtering; this is your full archive view.</p>
      </div>
      <div className="info-card">
        <h3>{shown.length} videos</h3>
        <p>Tip: open Studio, then use Gallery search to filter by prompt text.</p>
      </div>
    </>
  )
}