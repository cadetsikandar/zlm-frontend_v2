# ZLM Dashboard — Frontend

**Zarwango-Lubega-Muyizzi Publishing** | NP/DNP Textbook Automation Dashboard

## Features

- ✅ Login & Register pages with JWT auth
- ✅ Dashboard with 28-book production grid, live stats, charts
- ✅ Books list with track filtering & status badges
- ✅ Book Detail with per-chapter generation, QA, download
- ✅ Book Setup — create books, inline chapter management
- ✅ Chapters — global chapter table with bulk actions
- ✅ QA Reports — violation breakdown, executive summaries
- ✅ Prompts — view & edit master AI prompts
- ✅ Users — invite, edit, role-based permissions matrix
- ✅ Dark academica design system with Syne + DM Sans fonts
- ✅ Recharts visualizations
- ✅ Auto-polling when chapters are actively generating

## Deploy to Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Set environment variable
In Vercel dashboard → Project → Settings → Environment Variables:
```
REACT_APP_API_URL = https://your-backend-api-url.com
```

### 3. Deploy
```bash
cd zlm-frontend
vercel --prod
```

Or connect GitHub repo to Vercel for auto-deploy on push.

## Local Development

```bash
npm install
npm start
```

The `"proxy": "http://localhost:3001"` in package.json routes all `/api/*` calls to your local backend.

## Vercel + Backend Notes

If your backend is on Railway, Render, or AWS ECS, set `REACT_APP_API_URL` to its URL.

Make sure your backend has CORS configured to allow your Vercel domain:
```
FRONTEND_URL=https://your-app.vercel.app
```

## Default Login

| Role  | Email                          | Password       |
|-------|-------------------------------|----------------|
| Admin | admin@zlm-publishing.com      | Admin@ZLM2026! |
| Dev   | faiqfarooq04@gmail.com        | Dev@ZLM2026!   |

⚠️ Change passwords immediately after first login!
