import React from 'react'

const GUEST_LINKS = [['landing', 'Home'], ['plans', 'Plans'], ['docs', 'Docs']]
const USER_LINKS = [['studio', 'Studio'], ['gallery', 'Gallery'], ['plans', 'Plans'], ['docs', 'Docs'], ['settings', 'Settings']]

export default function Nav({ route, setRoute, user, health, openAuth, accountOpen, setAccountOpen, signOut, toast }) {
  const links = user ? USER_LINKS : GUEST_LINKS
  const healthOnline = health.includes('online')

  return (
    <nav className="nav">
      <div className="nav-inner">
        <button
          type="button"
          className="brand-btn"
          onClick={() => setRoute(user ? 'studio' : 'landing')}
          aria-label="Kelvid Studio home"
        >
          <img className="logo-img" src="/logo.svg" alt="" width="36" height="36" />
          <span className="brand">
            <span className="brand-title">Kelvid Studio</span>
            <small>AI Video Generation</small>
          </span>
        </button>
        <div className="nav-links" role="navigation" aria-label="Primary">
          {links.map(([r, label]) => (
            <button key={r} type="button" className={route === r ? 'active' : ''} onClick={() => setRoute(r)}>
              {label}
            </button>
          ))}
        </div>
        <div className="spacer" />
        {user && (
          <>
            <span className="credit-pill" title="Remaining generation credits">
              Credits: {user.credits}
            </span>
            <div className="status-pill" title="Backend connection status">
              <span className={`dot ${healthOnline ? 'online' : 'offline'}`} />
              <span>{health}</span>
            </div>
          </>
        )}
        {!user && (
          <>
            <button type="button" className="btn-ghost" onClick={() => openAuth('signin')}>
              Sign in
            </button>
            <button type="button" className="btn btn-primary px-sm" onClick={() => openAuth('signup')}>
              Get started
            </button>
          </>
        )}
        {user && (
          <div className="account-menu">
            <button type="button" className="btn-ghost account-chip" onClick={() => setAccountOpen((v) => !v)} aria-haspopup="menu" aria-expanded={accountOpen}>
              <span aria-hidden="true">Account</span>
              <strong>{user.name}</strong>
            </button>
            {accountOpen && (
              <div className="account-dropdown" role="menu">
                <strong>{user.name}</strong>
                <small>{user.email} | {user.plan} plan | {user.credits} credits</small>
                <button type="button" className="btn-ghost" onClick={() => { setRoute('settings'); setAccountOpen(false) }}>
                  Settings
                </button>
                <button type="button" className="btn-ghost" onClick={() => { setRoute('plans'); setAccountOpen(false) }}>
                  Billing and plans
                </button>
                <button type="button" className="btn-ghost" onClick={() => { signOut(); setAccountOpen(false); toast('Signed out.') }}>
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}