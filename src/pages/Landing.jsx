import React, { useEffect, useRef } from 'react'
import { useKelvid } from '../context/KelvidContext.jsx'

const FEATURES = [
  { n: '01', title: 'Describe anything', body: 'A neon street in the rain. A corgi in space. Your words become the shot.' },
  { n: '02', title: 'Full creative control', body: 'Duration, guidance, negative prompts, seeds. Not a black box.' },
  { n: '03', title: 'Live render queue', body: 'Watch every job. Retry failures. Nothing disappears into the void.' },
  { n: '04', title: 'Private archive', body: 'Every render stays. Search it, replay it, download it, delete it.' },
]

const STEPS = [
  { n: '1', title: 'Write the shot', body: 'A single sentence is enough. Add negative prompts for precision.' },
  { n: '2', title: 'Let it render', body: 'Jobs queue on cloud GPUs. You see progress the moment it starts.' },
  { n: '3', title: 'Take the clip', body: 'It lands in your gallery. Download, share, or generate the next one.' },
]

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const els = root.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('revealed'))
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return ref
}

export default function Landing() {
  const { setRoute, user } = useKelvid()
  const rootRef = useReveal()

  return (
    <div className="landing" ref={rootRef}>
      <section className="hero">
        <div className="hero-copy" data-reveal>
          <span className="eyebrow">Text to video</span>
          <h1>
            Write the scene.<br />
            <span className="accent-text">Get the film.</span>
          </h1>
          <p className="hero-sub">
            Kelvid turns a sentence into a finished clip. No GPU. No install.
            Just a prompt, a queue, and a private gallery.
          </p>
          <div className="hero-cta">
            {user ? (
              <button className="btn btn-primary lg" onClick={() => setRoute('studio')}>Open Studio</button>
            ) : (
              <>
                <button className="btn btn-primary lg" onClick={() => setRoute('login')}>Start free</button>
                <button className="btn-ghost lg" onClick={() => setRoute('studio')}>See the studio</button>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div><strong>60s</strong><span>max length</span></div>
            <div><strong>720p</strong><span>output</span></div>
            <div><strong>65</strong><span>free credits</span></div>
          </div>
        </div>
        <div className="hero-panel" data-reveal data-delay="1">
          <div className="hero-panel-inner">
            <span className="hero-panel-label">Example prompt</span>
            <p className="hero-panel-quote">
              “Cinematic drone shot over a neon city at night, rain, reflections”
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head" data-reveal>
          <span className="eyebrow">Process</span>
          <h2>Three steps. Nothing extra.</h2>
        </div>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div key={s.n} className="step" data-reveal data-delay={i}>
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head" data-reveal>
          <span className="eyebrow">Capabilities</span>
          <h2>Built for people who care about the shot.</h2>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feature" data-reveal data-delay={i % 2}>
              <span className="feature-n">{f.n}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-block" data-reveal>
        <h2>Your first clips are free.</h2>
        <p>65 credits. No card. No trial games.</p>
        <button className="btn btn-primary lg" onClick={() => setRoute(user ? 'studio' : 'login')}>
          {user ? 'Open Studio' : 'Create account'}
        </button>
      </section>
    </div>
  )
}
