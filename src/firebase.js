import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Firebase is optional: if the VITE_FIREBASE_* env vars are missing or
// still placeholders, run the app in guest mode instead of crashing on load.
function hasRealConfig() {
  const { apiKey, projectId, appId } = firebaseConfig
  if (!apiKey || !projectId || !appId) return false
  // Placeholder values from .env.example must not reach initializeApp.
  if (/^your[-_]/i.test(apiKey) || /^your[-_]/i.test(projectId) || /^your[-_]/i.test(appId)) return false
  return true
}

let app = null
let auth = null

if (hasRealConfig()) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
  } catch (err) {
    console.warn('Firebase failed to initialize — continuing in guest mode:', err)
    app = null
    auth = null
  }
} else {
  console.warn('VITE_FIREBASE_* env vars are not configured — running in guest mode (sign-in disabled).')
}

export const isFirebaseConfigured = Boolean(auth)
export { auth }
export default app