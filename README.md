# Kelvid Frontend 🎬

React + Vite studio UI for the Kelvid text-to-video API.
Points at any Kelvid backend via `VITE_API_URL`.

## Quickstart

```powershell
copy .env.example .env
# edit .env → VITE_API_URL=http://localhost:8000
npm install
npm run dev        # http://localhost:5173
```

## Build / deploy

```powershell
npm run build      # → dist/
npm run preview
```

Deploy `dist/` to Vercel / Netlify / GitHub Pages, with env:

```
VITE_API_URL=https://your-backend.onrender.com
```

Backend must allow this origin: set its `CORS_ORIGINS` to your frontend URL.
