import React from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Landing() {
  const { setRoute, user } = useKelvid()
  const { theme, toggle } = useTheme()

  return (
    <div className="lp">
      <header className="lp-top">
        <div className="lp-brand">
          <img src="/logo.svg" alt="" width="32" height="32" />
          <span>Kelvid</span>
        </div>
        <div className="lp-actions">
          <button type="button" className="lp-ghost" onClick={toggle}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          {user ? (
            <button type="button" className="lp-solid" onClick={() => setRoute('studio')}>Open app</button>
          ) : (
            <>
              <button type="button" className="lp-ghost" onClick={() => setRoute('login')}>Sign in</button>
              <button type="button" className="lp-solid" onClick={() => setRoute('login')}>Get started</button>
            </>
          )}
        </div>
      </header>

      <section className="lp-hero">
        <p className="lp-kicker">Text → video · cloud render</p>
        <h1>
          From a sentence<br />
          to a finished shot.
        </h1>
        <p className="lp-lead">
          Type what you see. Kelvid queues it on GPU, streams status live,
          and stores every clip in your private gallery.
        </p>
        <div className="lp-cta-row">
          <button type="button" className="lp-solid big" onClick={() => setRoute(user ? 'studio' : 'login')}>
            {user ? 'Continue to Studio' : 'Start generating — free'}
          </button>
          <button type="button" className="lp-ghost big" onClick={() => setRoute('studio')}>
            Peek at Studio
          </button>
        </div>
      </section>

      <section className="lp-stage">
        <div className="lp-stage-frame">
          <div className="lp-stage-bar">
            <span /><span /><span />
            <em>studio.kelvid.app</em>
          </div>
          <div className="lp-stage-body">
            <div className="lp-fake-prompt">
              Cinematic drone shot over a neon city at night, rain on asphalt, reflections…
            </div>
            <div className="lp-fake-preview">
              <div className="lp-fake-play">▶</div>
              <span>Preview · 8s · Wan2.2</span>
            </div>
            <div className="lp-fake-jobs">
              <div className="lp-job done"><i /> done · neon city</div>
              <div className="lp-job run"><i /> running · corgi astronaut</div>
              <div className="lp-job queue"><i /> queued · jungle waterfall</div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-grid">
        <article>
          <h3>Prompt → queue → clip</h3>
          <p>No install. No GPU on your machine. Jobs run in the cloud and update live.</p>
        </article>
        <article>
          <h3>Controls that matter</h3>
          <p>Frames, steps, guidance, negative prompts, seeds. Real parameters, not a toy slider.</p>
        </article>
        <article>
          <h3>Your archive</h3>
          <p>Every render is stored, searchable, downloadable. Delete when you are done.</p>
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
