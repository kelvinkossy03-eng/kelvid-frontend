import React from 'react'
import { useKelvid } from './context/KelvidContext.jsx'

const FEATURES = [
  { icon: '🎬', title: 'Cinematic AI video', body: 'Describe any scene. Kelvid renders it in the cloud with state-of-the-art models.' },
  { icon: '⚙️', title: 'Pro controls', body: 'Duration, steps, guidance, negative prompts and seeds — full creative control.' },
  { icon: '📡', title: 'Live queue', body: 'Watch jobs in real time. Retry failures with one click.' },
  { icon: '🖼️', title: 'Private gallery', body: 'Every render is saved. Search, replay, download or delete anytime.' },
]

const STEPS = [
  { n: '01', title: 'Describe', body: 'Type a prompt and pick a model.' },
  { n: '02', title: 'Generate', body: 'We render it on powerful GPUs in the cloud.' },
  { n: '03', title: 'Download', body: 'Get your clip in the gallery within minutes.' },
]

export default function Landing() {
  const { setRoute, user } = useKelvid()

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-text">
          <span className="badge">Text → Video · Hugging Face</span>
          <h1>Words in.<br /><span className="gradient">Cinema out.</span></h1>
          <p>Turn a single sentence into a finished video. Professional controls, live queue, and a private gallery — all in your browser.</p>
          <div className="hero-actions">
            {user ? (
              <button className="btn btn-primary lg" onClick={() => setRoute('studio')}>Open Studio</button>
            ) : (
              <>
                <button className="btn btn-primary lg" onClick={() => setRoute('login')}>Get started free</button>
                <button className="btn-ghost lg" onClick={() => setRoute('studio')}>Try Studio</button>
              </>
            )}
          </div>
          <div className="stats">
            <div><strong>60s</strong><span>max length</span></div>
            <div><strong>720p</strong><span>quality</span></div>
            <div><strong>65</strong><span>free credits</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>How it works</h2>
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n} className="step">
              <span className="num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Everything you need</h2>
        <div className="features">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature">
              <span className="icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>Your first videos are free</h2>
        <p>Create an account and get 65 credits. No card required.</p>
        <button className="btn btn-primary lg" onClick={() => setRoute(user ? 'studio' : 'login')}>
          {user ? 'Open Studio' : 'Create free account'}
        </button>
      </section>
    </div>
  )
}
