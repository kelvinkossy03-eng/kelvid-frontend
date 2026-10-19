import React from 'react'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { KelvidProvider, useKelvid } from './context/KelvidContext.jsx'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import ToastContainer from './components/ToastContainer.jsx'
import Login from './pages/Login.jsx'
import Landing from './pages/Landing.jsx'
import Studio from './pages/Studio.jsx'
import Gallery from './pages/Gallery.jsx'
import Plans from './pages/Plans.jsx'
import Docs from './pages/Docs.jsx'
import Settings from './pages/Settings.jsx'

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

function AppShell() {
  const { route, toasts } = useKelvid()

  if (route === 'login') return <Login />

  return (
    <div className="app">
      <Nav />
      <main className="page" key={route}>
        <div className="page-enter">
          {route === 'landing' && <Landing />}
          {route === 'studio' && <Studio />}
          {route === 'gallery' && <Gallery />}
          {route === 'plans' && <Plans />}
          {route === 'docs' && <Docs />}
          {route === 'settings' && <Settings />}
        </div>
      </main>
      <Footer />
      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <KelvidProvider>
          <AppShell />
        </KelvidProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
