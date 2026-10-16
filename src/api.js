// Central API helper — all backend URLs flow through here.
// VITE_API_URL=http://localhost:8000 (dev) or https://your-backend... (prod).
// Blank = same-origin (Vite proxy or served together).
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function apiUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? path : '/' + path}`
}

export function resolveUrl(url) {
  if (!url) return url
  if (/^https?:\/\//i.test(url)) return url
  return apiUrl(url)
}

export async function apiFetch(path, opts = {}) {
  const headers = { ...(opts.headers || {}) }
  if (opts.body && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }
  const res = await fetch(apiUrl(path), { ...opts, headers })
  let data = null
  let bodyText = ''
  try { data = await res.json() } catch { bodyText = await res.text().catch(() => '') }
  if (!res.ok) throw new Error((data && data.detail) || bodyText || `Request failed (${res.status})`)
  return data
}
