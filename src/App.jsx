import React from 'react'
import { KelvidProvider, useKelvid } from './context/KelvidContext.jsx'
import Nav from './Nav.jsx'
import Studio from './Studio.jsx'
import Gallery from './Gallery.jsx'
import Plans from './Plans.jsx'
import Docs from './Docs.jsx'
import Settings from './Settings.jsx'
import ToastContainer from './ToastContainer.jsx'
import Footer from './Footer.jsx'
import Landing from './Landing.jsx'
import Login from './pages/Login.jsx'

// ---------- error boundary ----------
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
          >
            Refresh page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function AppRoutes() {
  const { route, user } = useKelvid()

  // Protect studio & gallery — require login
  if ((route === 'studio' || route === 'gallery' || route === 'settings') && !user) {
    return <Login />
  }

  if (route === 'login') return <Login />

  return (
    <div className="app">
      <Nav />

      <main className="main-content">
        {route === 'landing' && <Landing />}
        {route === 'studio' && <Studio />}
        {route === 'gallery' && <Gallery />}
        {route === 'plans' && <Plans />}
        {route === 'docs' && <Docs />}
        {route === 'settings' && <Settings />}
      </main>

      <Footer />
      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <KelvidProvider>
        <AppRoutes />
      </KelvidProvider>
    </ErrorBoundary>
  )
}
