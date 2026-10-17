import React from 'react'
import { API_BASE } from './api.js'

export default function Settings({ user, health, openAuth, signOut, toast, frames, selectedModel, selectedProvider }) {
  return (
    <>
      <div className="page-hero">
        <h1>Settings</h1>
        <p>Account, API connection, defaults, and data controls.</p>
      </div>
      <div className="info-card">
        <h3>Account</h3>
        <p>
          {user ? `${user.name} (${user.email}) — ${user.plan}, ${user.credits} credits` : 'You are browsing as a guest. Sign in to save your profile.'}
        </p>
        {!user && <button type="button" className="btn-ghost mt-2" onClick={() => openAuth('signin')}>Sign in</button>}
        {user && <button type="button" className="btn-ghost mt-2" onClick={() => { signOut(); toast('Signed out.') }}>Log out</button>}
      </div>
      <div className="info-card">
        <h3>API connection</h3>
        <p>Backend: {API_BASE || 'same-origin'} | Status: {health}</p>
        <div className="settings-row"><span>Backend API key header</span><span>X-API-Key</span></div>
        <div className="settings-row"><span>Default frames</span><span>{frames} frames ({Math.round(frames / 24)}s)</span></div>
        <div className="settings-row"><span>Default model</span><span>{selectedModel ? selectedModel.split('/').pop() : 'Auto-select'}</span></div>
      </div>
    </>
  )
}