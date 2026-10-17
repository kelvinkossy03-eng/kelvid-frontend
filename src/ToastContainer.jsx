import React from 'react'

export default function ToastContainer({ toasts }) {
  return (
    <div className="toasts-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">{t.msg}</div>
      ))}
    </div>
  )
}