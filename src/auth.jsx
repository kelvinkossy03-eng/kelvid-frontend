import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase.js'

const AuthCtx = createContext(null)

const NOT_CONFIGURED_MSG = 'Sign-in is not configured yet. Set the VITE_FIREBASE_* env vars (Firebase Console) and redeploy.'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  // If Firebase isn't configured there is nothing to wait for — start not-loading.
  const [loading, setLoading] = useState(Boolean(isFirebaseConfigured))

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return undefined
    }
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
    authConfigured: isFirebaseConfigured,
    openAuth: (mode = 'signin') => { setAuthMode(mode); setAuthOpen(true) },
    closeAuth: () => setAuthOpen(false),
    signIn: async (email, password) => {
      if (!auth) throw new Error(NOT_CONFIGURED_MSG)
      const cred = await signInWithEmailAndPassword(auth, email, password)
      return cred.user
    },
    signUp: async (name, email, password) => {
      if (!auth) throw new Error(NOT_CONFIGURED_MSG)
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (name) {
        await cred.user.updateProfile({ displayName: name })
      }
      return cred.user
    },
    signOut: async () => {
      if (!auth) return
      await firebaseSignOut(auth)
    },
  }), [user, loading, authOpen, authMode])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
