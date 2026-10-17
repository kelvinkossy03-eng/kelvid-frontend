import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthCtx = createContext(null)
const KEY = 'kelvid.auth.v1'

function readStored() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const v = JSON.parse(raw)
    if (!v || !v.email) return null
    return v
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStored())
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')

  useEffect(() => {
    try {
      if (user) localStorage.setItem(KEY, JSON.stringify(user))
      else localStorage.removeItem(KEY)
    } catch { /* ignore */ }
  }, [user])

  const value = useMemo(() => ({
    user,
    authOpen,
    authMode,
    openAuth: (mode = 'signin') => { setAuthMode(mode); setAuthOpen(true) },
    closeAuth: () => setAuthOpen(false),
    signIn: (email) => {
      const u = { email, name: email.split('@')[0], plan: 'Starter', credits: 65, joinedAt: new Date().toISOString() }
      setUser(u); setAuthOpen(false)
      return u
    },
    signUp: (name, email) => {
      const u = { email, name: name || email.split('@')[0], plan: 'Starter', credits: 65, joinedAt: new Date().toISOString() }
      setUser(u); setAuthOpen(false)
      return u
    },
    signOut: () => setUser(null),
  }), [user, authOpen, authMode])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
