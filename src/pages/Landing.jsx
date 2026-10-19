import React, { useEffect, useState } from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { IDEAS } from '../constants.js'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Types out the example prompts one after another.
function TypingPrompt() {
  const [i, setI] = useState(0)
  const [n, setN] = useState(0)
  const reduce = prefersReducedMotion()

  useEffect(() => {
    if (reduce) return undefined
    const full = IDEAS[i]
    if (n < full.length) {
      const t = setTimeout(() => setN(n + 1), 38)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => { setI((i + 1) % IDEAS.length); setN(0) }, 1800)
    return () => clearTimeout(t)
  }, [i, n, reduce])

  const text = reduce ? IDEAS[0] : IDEAS[i].slice(0, n)
  return (
    <div className="lp-prompt rise d3" aria-hidden="true">
      <svg className="spark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></svg>
      <div className="lp-typed">{text}{!reduce && <span className="caret" />}</div>
      <div className="lp-send">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
      </div>
    </div>
  )
}

function FloatingCards() {
  return (
    <div className="lp-float rise" aria-hidden="true">
      <div className="lp-card a"><div className="lp-sun" /><div className="lp-hill" /></div>
      <div className="lp-card b"><div className="lp-sun" /><div className="lp-hill" /></div>
      <div className="lp-card c">
        <div className="lp-sun" /><div className="lp-hill" />
        <span className="lp-badge">0:05</span>
      </div>
    </div>
  )
}

export default function Landing() {
  const { setRoute, user } = useKelvid()
  const { theme, toggle } = useTheme()

  return (
    <div className="lp">
      <header className="lp-top">
        <div className="lp-brand wordmark">Kelvid</div>
        <div className="lp-actions">
          <button type="button" className="lp-ghost" onClick={toggle}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          {user ? (
            <button type="button" className="lp-solid" onClick={() => setRoute('studio')}>Open app</button>
          ) : (
            <button type="button" className="lp-solid" onClick={() => setRoute('login')}>Sign in</button>
          )}
        </div>
      </header>

      <section className="lp-hero">
        <FloatingCards />
        <TypingPrompt />

        <h1 className="rise d2">
          Type it.<br /><em>Watch it move.</em>
        </h1>
        <p className="lp-lead rise d3">
          Describe a shot in a sentence. Kelvid renders it on cloud GPUs,
          shows live status, and keeps every clip in your private gallery.
        </p>
        <div className="lp-cta-row rise d4">
          <button type="button" className="lp-solid big cta" onClick={() => setRoute(user ? 'studio' : 'login')}>
            {user ? 'Continue to Studio' : 'Get started free'}
          </button>
          <button type="button" className="lp-ghost big" onClick={() => setRoute('studio')}>
            Peek at Studio
          </button>
        </div>
      </section>

      <section className="lp-grid">
        <article className="rise d1">
          <h3>Prompt, queue, clip</h3>
          <p>No install and no GPU on your machine. Jobs run in the cloud and update live.</p>
        </article>
        <article className="rise d2">
          <h3>Controls that matter</h3>
          <p>Frames, steps, guidance, negative prompts and seeds. Real parameters, not a toy slider.</p>
        </article>
        <article className="rise d3">
          <h3>Your archive</h3>
          <p>Every render is stored, searchable and downloadable. Delete it when you are done.</p>
        </article>
      </section>

      <footer className="lp-foot">
        <span>Kelvid Studio</span>
        <button type="button" onClick={() => setRoute('docs')}>Docs</button>
        <button type="button" onClick={() => setRoute('plans')}>Pricing</button>
      </footer>
    </div>
  )
}
