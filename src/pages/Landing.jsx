import React from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Landing() {
  const { setRoute, user } = useKelvid()
  const { theme, toggle } = useTheme()
  return (
    <main className="lp">
      <header className="lp-top">
        <div className="lp-brand"><img src="/logo.svg" alt="" width="38" height="38" style={{borderRadius:12}} /><span className="wordmark">kelvid<span style={{color:'var(--accent)'}}>.</span></span></div>
        <div className="lp-actions">
          <button type="button" className="lp-ghost" onClick={toggle}>{theme === 'dark' ? '◐ Light mode' : '◑ Dark mode'}</button>
          <button type="button" className="lp-solid" onClick={() => setRoute(user ? 'studio' : 'login')}>{user ? 'Open studio ↗' : 'Sign in ↗'}</button>
        </div>
      </header>
      <section className="lp-hero">
        <div className="lp-prompt rise d1"><span className="spark" aria-hidden="true">✳</span><div className="lp-typed">A new world, one sentence away.</div><span className="lp-send" aria-hidden="true">↗</span></div>
        <h1 className="rise d2">Make a scene.<br/><em>Move people.</em></h1>
        <p className="lp-lead rise d3">An idea in your head. A moving image on your screen. Kelvid turns the way you imagine into cinematic video experiments — without a studio full of gear.</p>
        <div className="lp-cta-row rise d4"><button type="button" className="lp-solid big" onClick={() => setRoute(user ? 'studio' : 'login')}>{user ? 'Enter the studio' : 'Start creating'} <span aria-hidden="true">↗</span></button><button type="button" className="lp-ghost big" onClick={() => setRoute('studio')}>Explore the workspace</button></div>
        <div style={{marginTop:34,color:'var(--text-3)',fontSize:11,letterSpacing:'.14em',textTransform:'uppercase'}}><span style={{color:'var(--accent)'}}>●</span> A creative tool for ideas in motion <span style={{padding:'0 12px'}}>—</span> Built for the curious</div>
      </section>
      <section className="lp-grid">
        <article className="rise d1"><span style={{color:'var(--accent)',fontFamily:'var(--mono)',fontSize:11}}>01 / IMAGINE</span><h3>Start with a feeling.</h3><p>Write a scene in your own words. Strange, specific, impossible — that is where the interesting work starts.</p></article>
        <article className="rise d2"><span style={{color:'var(--accent)',fontFamily:'var(--mono)',fontSize:11}}>02 / DIRECT</span><h3>Shape the details.</h3><p>Choose your model, tune the render and guide the result instead of settling for a one-click black box.</p></article>
        <article className="rise d3"><span style={{color:'var(--accent)',fontFamily:'var(--mono)',fontSize:11}}>03 / KEEP</span><h3>Build your visual world.</h3><p>Review your generations, revisit the good accidents and keep the ideas worth taking further.</p></article>
      </section>
      <footer className="lp-foot"><span className="lp-brand"><img src="/logo.svg" alt="" width="26" height="26" style={{borderRadius:8}} /><span className="wordmark">kelvid<span style={{color:'var(--accent)'}}>.</span></span></span><span style={{marginLeft:'auto'}}>Your imagination, in motion.</span><button type="button" onClick={() => setRoute('docs')}>Field notes ↗</button><button type="button" onClick={() => setRoute('plans')}>Plans ↗</button></footer>
    </main>
  )
}
