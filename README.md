# Smart Library

A React + Vite library app with an **AI librarian powered by Ollama Cloud**.
Frontend only: no backend, no database, no serverless functions.

- Catalog with search and category filters
- Lending desk: lend a book for 14 days, take it back, overdue flagging
- AI librarian chat (streaming) that knows your live catalog
- "Fill with AI" when adding a book (category + description)
- Fade-in / fade-out animations while scrolling (respects reduced-motion)
- Library data is stored in the browser (localStorage)

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Click **Connect AI**, paste your key from https://ollama.com/settings/keys,
press **Test connection**, then **Save**.

## Deploy to Netlify

1. Push this folder to GitHub (or drag the folder into Netlify Drop after `npm run build`).
2. New site from Git. Build command `npm run build`, publish directory `dist`
   (already set in `netlify.toml`). No environment variables are required.
3. Open the site, click **Connect AI**, paste your key.

## How CORS is handled (no backend)

Browsers block cross-origin API calls unless the server allows them, so the app
calls `/ollama-api/*` on its own origin:

| Where | What forwards the request to `https://ollama.com/api/*` |
| --- | --- |
| `npm run dev` | Vite proxy in `vite.config.js` |
| Netlify | Rewrite rule + CORS headers in `netlify.toml` |

This is configuration only, not a server you maintain. Settings also has a
**Direct** mode that calls ollama.com straight from the browser; use it only if
Ollama allows your origin.

## About the API key

The key is entered by each user in Settings and kept in that browser's
localStorage. Do not put it in a `VITE_` environment variable: Vite would embed
it in the public JavaScript and anyone could read it.

## Structure

```
src/
  App.jsx  main.jsx  index.css
  lib/         ollama.js (API client), format.js, seed.js
  hooks/       useLibrary.js (localStorage data)
  components/  Hero, Catalog, Librarian, LendingDesk, AddBook, Settings, Reveal ...
netlify.toml   build + Ollama rewrite + CORS headers + SPA fallback
vite.config.js dev proxy for Ollama
```
