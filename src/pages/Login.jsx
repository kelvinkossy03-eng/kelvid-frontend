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
      setErr('Email and password required')
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
    }, 400)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src="/logo.svg" alt="" width="40" height="40" />
          <h1>Kelvid</h1>
          <p>Sign in to generate</p>
        </div>
        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setErr('') }}>Sign in</button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setErr('') }}>Sign up</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {err && <div className="auth-error">{err}</div>}
          <button type="submit" className="btn-main auth-submit" disabled={loading}>
            {loading ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <p className="auth-note">
          {mode === 'login' ? (
            <>No account? <button type="button" onClick={() => setMode('signup')}>Sign up</button></>
          ) : (
            <>Have an account? <button type="button" onClick={() => setMode('login')}>Sign in</button></>
          )}
        </p>
        <button type="button" className="auth-back" onClick={() => setRoute('landing')}>← Home</button>
      </div>
    </div>
  )
}
