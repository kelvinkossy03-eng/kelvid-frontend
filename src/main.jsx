import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './auth.jsx'
import AuthModal from './AuthModal.jsx'
import './sora.css'
import './auth.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <AuthModal />
    </AuthProvider>
  </React.StrictMode>
)
