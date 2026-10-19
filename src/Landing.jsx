import React from 'react'
import { useKelvid } from './context/KelvidContext.jsx'

const FEATURES = [
  {
    icon: '🎬',
    title: 'Cinematic AI video',
    body: 'Describe any scene in plain language. Kelvid renders it in the cloud with state-of-the-art models.',
  },
  {
    icon: '⚡',
    title: 'Pro controls',
    body: 'Duration, steps, guidance, negative prompts and seeds — full creative control.',
  },
  {
    icon: '📡',
    title: 'Live queue',
    body: 'Watch jobs progress in real time. Retry failures with one click.',
  },
  {
    icon: '🖼️',
    title: 'Private gallery',
    body: 'Every render is saved. Search, replay, download or delete anytime.',
  },
]

const STEPS = [
  { n: '01', title: 'Describe', body: 'Type a prompt and pick a model.' },
  { n: '02', title: 'Generate', body: 'We render on cloud GPUs. Watch progress live.' },
  { n: '03', title: 'Download', body: 'Your video lands in the gallery ready to share.' },
]

export default function Landing() {
  const { setRoute, user } = useKelvid()

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <span className="badge">Text → Video · Hugging Face</span>
          <h1>
            Words in.
            <br />
            <span className="gradient">Cinema out.</span>
          </h1>
          <p className="hero-sub">
            Kelvid turns a sentence into a finished clip. Pro controls, live queue,
            and a private gallery — all in your browser.
          </p>
          <div className="hero-cta">
            {user ? (
              <button type="button" className="btn btn-primary lg" onClick={() => setRoute('studio')}>
                Open Studio
              </button>
            ) : (
              <>
                <button type="button" className="btn btn-primary lg" onClick={() => setRoute('login')}>
                  Get started free
                </button>
                <button type="button" className="btn-ghost lg" onClick={() => setRoute('studio')}>
                  Try Studio
                </button>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div><strong>60s</strong><span>max length</span></div>
            <div><strong>720p</strong><span>quality</span></div>
            <div><strong>65</strong><span>free credits</span></div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <h2>Three steps to your first clip</h2>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.n}>
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <h2>Everything you need</h2>
        <div className="features">
          {FEATURES.map((f) => (
            <div className="feature" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <h2>Your first videos are free</h2>
        <p>Create an account and get 65 credits. No card required.</p>
        <button
          type="button"
          className="btn btn-primary lg"
          onClick={() => setRoute(user ? 'studio' : 'login')}
        >
          {user ? 'Open Studio' : 'Create free account'}
        </button>
      </section>
    </div>
  )
}
