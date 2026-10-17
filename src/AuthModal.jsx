import React, { useState } from 'react'
import { useAuth } from './auth.jsx'

export default function AuthModal() {
  const { authOpen, authMode, closeAuth, signIn, signUp, loading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState(authMode)

  React.useEffect(() => { setMode(authMode); setError('') }, [authMode, authOpen])
  if (!authOpen) return null

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (!email.includes('@')) { setError('Enter a valid email address.'); setSubmitting(false); return }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); setSubmitting(false); return }
      if (mode === 'signup') {
        if (!name.trim()) { setError('Enter your display name.'); setSubmitting(false); return }
        await signUp(name.trim(), email.trim(), password)
      } else {
        await signIn(email.trim(), password)
      }
      closeAuth()
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={closeAuth} role="dialog" aria-modal="true" aria-label="Account sign in">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <img src="/logo.svg" alt="Kelvid Studio" width="36" height="36" />
          <div>
            <h2>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
            <p>{mode === 'signup' ? 'Start with 65 free credits. No card required.' : 'Sign in to generate, save, and manage videos.'}</p>
          </div>
          <button className="btn-ghost" onClick={closeAuth} aria-label="Close">Close</button>
        </div>
        <div className="modal-tabs" role="tablist">
          <button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')}>Sign in</button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign up</button>
        </div>
        <form onSubmit={submit} className="modal-form">
          {mode === 'signup' && (
            <div className="sora-field">
              <label htmlFor="auth-name">Display name</label>
              <input id="auth-name" className="sora-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" disabled={loading} />
            </div>
          )}
          <div className="sora-field">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" className="sora-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" autoComplete="email" disabled={loading} />
          </div>
          <div className="sora-field">
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" className="sora-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} disabled={loading} />
          </div>
          {error && <div className="sora-error" role="alert">{error}</div>}
          <button className="sora-generate" type="submit" disabled={loading || submitting}>
            {loading ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
          <p className="modal-fine">Powered by Firebase Authentication. Your account lives in the cloud, not local storage.</p>
        </form>
      </div>
    </div>
  )
}
