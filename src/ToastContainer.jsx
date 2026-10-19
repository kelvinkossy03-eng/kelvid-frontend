import React from 'react'
import { useKelvid } from './context/KelvidContext.jsx'

export default function ToastContainer() {
  const { toasts } = useKelvid()

  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type || 'info'}`}>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
