import React from 'react'
import { useKelvid } from './context/KelvidContext.jsx'

const FEATURES = [
  { icon: '01', title: 'Describe anything', body: 'A neon street in the rain. A corgi in space. Your words become the shot.' },
  { icon: '02', title: 'Full creative control', body: 'Duration, guidance, negative prompts, seeds. Not a black box.' },
  { icon: '03', title: 'Live render queue', body: 'Watch every job. Retry failures. Nothing disappears into the void.' },
  { icon: '04', title: 'Your private archive', body: 'Every render stays. Search it, replay it, download it, delete it.' },
]

const STEPS = [
  { n: '1', title: 'Write the shot', body: 'A single sentence is enough. Add negative prompts if you want precision.' },
  { n: '2', title: 'Let it render', body: 'Jobs queue on cloud GPUs. You see progress the moment it starts.' },
  { n: '3', title: 'Take the clip', body: 'It lands in your gallery. Download, share, or generate the next one.' },
]

export default function Landing() {
  const { setRoute, user } = useKelvid()

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-text">
          <span className="badge">Text to video</span>
          <h1>
            Write the scene.<br />
            <em>Get the film.</em>
          </h1>
          <p>
            Kelvid turns a sentence into a finished clip. No GPU. No install.
            Just a prompt, a queue, and a private gallery.
          </p>
          <div className="hero-actions">
            {user ? (
              <button className="btn btn-primary lg" onClick={() => setRoute('studio')}>
                Open Studio
              </button>
            ) : (
              <>
                <button className="btn btn-primary lg" onClick={() => setRoute('login')}>
                  Start free
                </button>
                <button className="btn-ghost lg" onClick={() => setRoute('studio')}>
                  See the studio
                </button>
              </>
            )}
          </div>
          <div className="stats">
            <div><strong>60s</strong><span>max length</span></div>
            <div><strong>720p</strong><span>output</span></div>
            <div><strong>65</strong><span>free credits</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="caption">
            “Cinematic drone shot over a neon city at night, rain, reflections”
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-label">Process</div>
        <h2>Three steps. Nothing extra.</h2>
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n} className="step">
              <div className="num">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-label">Capabilities</div>
        <h2>Built for people who care about the shot.</h2>
        <div className="features">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature">
              <div className="icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>Your first clips are free.</h2>
        <p>65 credits. No card. No trial expiry tricks.</p>
        <button className="btn btn-primary lg" onClick={() => setRoute(user ? 'studio' : 'login')}>
          {user ? 'Open Studio' : 'Create account'}
        </button>
      </section>
    </div>
  )
}
