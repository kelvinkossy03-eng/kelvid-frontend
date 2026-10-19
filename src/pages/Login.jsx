import React, { useState } from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'

export default function Login() {
  const { login, setRoute } = useKelvid()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setErr('')
    if (!email.trim() || !password.trim()) {
      setErr('Email and password are required')
      return
    }
    if (mode === 'signup' && password.length < 6) {
      setErr('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setTimeout(() => {
      login(email.trim().toLowerCase(), name.trim())
      setLoading(false)
    }, 500)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src="/logo.svg" alt="Kelvid" width="48" height="48" />
          <h1>Kelvid Studio</h1>
          <p>Cinematic AI video generation</p>
        </div>

        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setErr('') }}>
            Sign in
          </button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setErr('') }}>
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
          </div>

          {err && <div className="auth-error">{err}</div>}

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="auth-note">
          {mode === 'login' ? (
            <>No account? <button type="button" onClick={() => setMode('signup')}>Create one</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => setMode('login')}>Sign in</button></>
          )}
        </p>

        <button type="button" className="auth-guest" onClick={() => setRoute('landing')}>
          ← Back to home
        </button>
      </div>
    </div>
  )
}
