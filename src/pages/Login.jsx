import React, { useState } from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'

const ico = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export default function Login() {
  const { setRoute } = useKelvid()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const signup = mode === 'signup'

  const switchMode = (m) => { setMode(m); setErr('') }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErr('')
    if (!email.trim() || !password.trim()) {
      setErr('Email and password required')
      return
    }
    if (signup && password.length < 6) {
      setErr('Password must be at least 6 characters')
      return
    }
    // Do not pretend to authenticate users locally. A real identity provider must be configured first.
    setErr('Sign-in is not connected to an authentication service yet. No account was created. Please try again after authentication is configured.')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button type="button" className="auth-back rise" onClick={() => setRoute('landing')}>
          <svg {...ico} width="18" height="18"><path d="M15 5l-7 7 7 7" /></svg>
          Home
        </button>

        <div className="auth-brand rise"><span className="wordmark">Kelvid</span></div>
        <h1 className="rise d1">{signup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-sub rise d1">
          {signup ? 'Make your first video in under a minute.' : 'Sign in to pick up where you left off.'}
        </p>

        <div className="auth-tabs rise d2" role="tablist">
          <button type="button" role="tab" aria-selected={!signup} className={!signup ? 'active' : ''} onClick={() => switchMode('login')}>Sign in</button>
          <button type="button" role="tab" aria-selected={signup} className={signup ? 'active' : ''} onClick={() => switchMode('signup')}>Sign up</button>
        </div>

        <form className="auth-form rise d3" onSubmit={handleSubmit}>
          {signup && (
            <div className="auth-field glow-field">
              <svg {...ico}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
              <label htmlFor="name">Name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" />
            </div>
          )}
          <div className="auth-field glow-field">
            <svg {...ico}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3.5 7l8.5 6 8.5-6" /></svg>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" autoComplete="email" required />
          </div>
          <div className="auth-field glow-field">
            <svg {...ico}><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={signup ? 'new-password' : 'current-password'}
              required
            />
            <button type="button" className="eye" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? (
                <svg {...ico}><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.1 3.9M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.2-.9M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
              ) : (
                <svg {...ico}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
              )}
            </button>
          </div>

          {err && <div className="auth-error" role="alert">{err}</div>}

          <button type="submit" className="btn-main cta auth-submit" disabled={loading}>
            {loading ? '…' : signup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-note rise d4">
          {signup ? (
            <>Have an account? <button type="button" onClick={() => switchMode('login')}>Sign in</button></>
          ) : (
            <>No account? <button type="button" onClick={() => switchMode('signup')}>Sign up</button></>
          )}
        </p>
      </div>
    </div>
  )
}
