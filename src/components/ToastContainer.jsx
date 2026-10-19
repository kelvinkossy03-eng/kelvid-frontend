import React from 'react'

export default function ToastContainer({ toasts }) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type || 'info'}`}>{t.msg}</div>
      ))}
    </div>
  )
}
