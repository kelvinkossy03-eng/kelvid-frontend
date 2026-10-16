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
  const res = await fetch(apiUrl(path), opts)
  let data = null
  try { data = await res.json() } catch { /* non-json */ }
  if (!res.ok) throw new Error((data && data.detail) || `Request failed (${res.status})`)
  return data
}
