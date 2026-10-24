import React from 'react'
import { useKelvid } from './context/KelvidContext.jsx'

const FEATURES = [
  { n: '01', title: 'Start with a thought', body: 'Write the scene in your own words. Set the mood, camera, movement, and details that make it yours.' },
  { n: '02', title: 'Shape the result', body: 'Fine-tune your generation with model controls, guidance, and negative prompts when you need them.' },
  { n: '03', title: 'Keep every good take', body: 'Track render jobs, revisit finished clips, and build a private library of ideas worth keeping.' },
]

export default function Landing() {
  const { setRoute, user } = useKelvid()
  const start = () => setRoute(user ? 'studio' : 'login')

  return (
    <main className="lp premium-landing">
      <header className="lp-top premium-top">
        <button type="button" className="premium-brand" onClick={() => setRoute('landing')} aria-label="Kelvid home">
          <span className="premium-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="wordmark lp-brand">kelvid<span className="brand-period">.</span></span>
        </button>
        <nav className="premium-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Studio features</a>
        </nav>
        <div className="lp-actions">
          <button type="button" className="lp-ghost" onClick={() => setRoute(user ? 'studio' : 'login')}>{user ? 'Open studio' : 'Sign in'}</button>
          <button type="button" className="lp-solid" onClick={start}>{user ? 'Create a video' : 'Try Kelvid'} <span aria-hidden="true">↗</span></button>
        </div>
      </header>

      <section className="premium-hero">
        <div className="premium-copy">
          <div className="premium-eyebrow"><span className="live-dot" /> YOUR IDEAS, IN MOTION</div>
          <h1>Make the scene<br />you <em>can’t stop</em><br />thinking about.</h1>
          <p className="lp-lead">A video studio for turning a clear idea into a moving image. Start with a prompt, make it yours, and keep the takes you love.</p>
          <div className="lp-cta-row">
            <button type="button" className="lp-solid big" onClick={start}>{user ? 'Open your studio' : 'Create your first video'} <span aria-hidden="true">↗</span></button>
            <button type="button" className="lp-ghost big" onClick={() => setRoute('studio')}>Explore the studio <span aria-hidden="true">→</span></button>
          </div>
          <div className="premium-proof">
            <span className="proof-icon">✳</span>
            <span><strong>Made for the first idea</strong><small>No editing timeline to learn. Just describe the shot.</small></span>
          </div>
        </div>

        <div className="premium-art" aria-label="Abstract cinematic video preview artwork">
          <div className="art-index"><span>KE / 001</span><span>PREVIEW STUDY</span></div>
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="art-sun" />
          <div className="art-mountain mountain-back" />
          <div className="art-mountain mountain-mid" />
          <div className="art-mountain mountain-front" />
          <div className="art-grain" />
          <div className="art-caption"><span className="caption-play">▶</span><span><strong>After the last light</strong><small>01:12 · Cinematic study</small></span><span className="caption-expand">↗</span></div>
          <div className="art-side-note">A FRAME FROM YOUR IMAGINATION</div>
        </div>
      </section>

      <section className="premium-ribbon" aria-label="Studio highlights">
        <span>YOUR PROMPT</span><i />
        <strong>One idea, a thousand directions.</strong>
        <i />
        <span>YOUR CREATIVE STUDIO</span>
      </section>

      <section className="premium-process" id="how-it-works">
        <div className="premium-section-head">
          <div><span className="premium-kicker">THE PROCESS</span><h2>Less setup.<br /><em>More making.</em></h2></div>
          <p>From a rough thought to a finished clip, Kelvid keeps the creative part in front of you.</p>
        </div>
        <div className="premium-steps">
          {FEATURES.map((feature) => <article className="premium-step" key={feature.n}>
            <span className="step-number">{feature.n}</span>
            <div className="step-rule" />
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
            <span className="step-arrow" aria-hidden="true">↗</span>
          </article>)}
        </div>
      </section>

      <section className="premium-cta">
        <div className="cta-noise" />
        <span className="premium-kicker">YOUR NEXT IDEA STARTS HERE</span>
        <h2>Give your imagination<br />somewhere to go.</h2>
        <p>Open the studio and make the first frame.</p>
        <button type="button" className="lp-solid big" onClick={start}>{user ? 'Back to your studio' : 'Start creating'} <span aria-hidden="true">↗</span></button>
      </section>

      <footer className="lp-foot premium-foot">
        <button type="button" onClick={() => setRoute('landing')} className="premium-footer-brand"><span className="premium-mark" aria-hidden="true"><i /><i /><i /></span> kelvid.</button>
        <span>Make something worth watching.</span>
        <button type="button" onClick={() => setRoute('docs')}>Documentation ↗</button>
        <small>© {new Date().getFullYear()} Kelvid Studio</small>
      </footer>
    </main>
  )
}
