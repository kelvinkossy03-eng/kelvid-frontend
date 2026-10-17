import React from 'react'

export default function Nav({ route, setRoute, user, health, openAuth, accountOpen, setAccountOpen, signOut, toast }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <img className="logo-img" src="/logo.svg" alt="Kelvid Studio logo" width="36" height="36" />
        <div className="brand">
          <h1>Kelvid Studio</h1>
          <small>AI Video Generation</small>
        </div>
        <div className="nav-links" role="navigation" aria-label="Primary">
          {['studio', 'gallery', 'plans', 'docs', 'settings'].map((r) => (
            <button key={r} type="button" className={route === r ? 'active' : ''} onClick={() => setRoute(r)}>
              {r[0].toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        <div className="spacer" />
        <span className="credit-pill" title="Remaining generation credits">
          Credits: {user ? user.credits : 65}
        </span>
        <div className="status-pill" title="Backend connection status">
          <span className={`dot ${health.includes('NO HF TOKEN') ? 'offline' : health.includes('online') ? 'online' : 'offline'}`} />
          <span>{health}</span>
        </div>
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