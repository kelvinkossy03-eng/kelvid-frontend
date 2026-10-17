import React, { useState } from 'react'
import { useAuth } from './auth.jsx'

export default function AuthModal() {
  const { authOpen, authMode, closeAuth, signIn, signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState(authMode)

  React.useEffect(() => { setMode(authMode); setError('') }, [authMode, authOpen])
  if (!authOpen) return null

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (!email.includes('@')) { setError('Enter a valid email address.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (mode === 'signup') {
      if (!name.trim()) { setError('Enter your display name.'); return }
      signUp(name.trim(), email.trim())
    } else {
      signIn(email.trim())
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
              <input id="auth-name" className="sora-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" />
            </div>
          )}
          <div className="sora-field">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" className="sora-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" autoComplete="email" />
          </div>
          <div className="sora-field">
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" className="sora-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
          </div>
          {error && <div className="sora-error" role="alert">{error}</div>}
          <button className="sora-generate" type="submit">{mode === 'signup' ? 'Create account' : 'Sign in'}</button>
          <p className="modal-fine">Demo auth stored locally in your browser. Connect Supabase/Firebase/Auth0 for production accounts.</p>
        </form>
      </div>
    </div>
  )
}
