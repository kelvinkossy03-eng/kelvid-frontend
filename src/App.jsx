import React from 'react'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { KelvidProvider, useKelvid } from './context/KelvidContext.jsx'
import Sidebar from './components/Sidebar.jsx'
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
    console.error(error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="crash">
          <h1>Something broke</h1>
          <p>{this.state.error?.message}</p>
          <button type="button" onClick={() => window.location.reload()}>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}

function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <i /><i />
    </div>
  )
}

function Shell() {
  const { route, toasts } = useKelvid()

  if (route === 'login') return <><Aurora /><Login /></>
  if (route === 'landing') {
    return (
      <>
        <Aurora />
        <Landing />
        <ToastContainer toasts={toasts} />
      </>
    )
  }

  return (
    <>
    <Aurora />
    <div className="shell">
      <Sidebar />
      <div className="workspace">
        <div className="workspace-inner" key={route}>
          {route === 'studio' && <Studio />}
          {route === 'gallery' && <Gallery />}
          {route === 'plans' && <Plans />}
          {route === 'docs' && <Docs />}
          {route === 'settings' && <Settings />}
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <KelvidProvider>
          <Shell />
        </KelvidProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
