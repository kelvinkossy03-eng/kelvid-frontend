import React from 'react'
import { KelvidProvider, useKelvid } from './context/KelvidContext.jsx'
import Nav from './Nav.jsx'
import Login from './pages/Login.jsx'
import Landing from './Landing.jsx'
import Studio from './Studio.jsx'
import Gallery from './Gallery.jsx'
import Plans from './Plans.jsx'
import Docs from './Docs.jsx'
import Settings from './Settings.jsx'
import Footer from './Footer.jsx'
import ToastContainer from './ToastContainer.jsx'

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'Unexpected error'}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Refresh page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function AppContent() {
  const { route, toasts } = useKelvid()

  if (route === 'login') return <Login />

  return (
    <div className="app">
      <Nav />
      <div className="page">
        {route === 'landing' && <Landing />}
        {route === 'studio' && <Studio />}
        {route === 'gallery' && <Gallery />}
        {route === 'plans' && <Plans />}
        {route === 'docs' && <Docs />}
        {route === 'settings' && <Settings />}
      </div>
      <Footer />
      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <KelvidProvider>
        <AppContent />
      </KelvidProvider>
    </ErrorBoundary>
  )
}
