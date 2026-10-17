import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from './firebase.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(false)
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          plan: 'Starter',
          credits: 65,
        })
      } else {
        setUser(null)
      }
    })
    return () => unsub()
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    authOpen,
    authMode,
    openAuth: (mode = 'signin') => { setAuthMode(mode); setAuthOpen(true) },
    closeAuth: () => setAuthOpen(false),
    signIn: async (email, password) => {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      return cred.user
    },
    signUp: async (name, email, password) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (name) {
        await cred.user.updateProfile({ displayName: name })
      }
      return cred.user
    },
    signOut: async () => {
      await firebaseSignOut(auth)
    },
  }), [user, authOpen, authMode, loading])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
