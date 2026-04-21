# C in 30 Days

A practical, beginner-to-intermediate C programming course delivered through a modern interactive web interface.

## Snapshot
- Canonical URL: `https://c-in-30.nealfrazier.tech/`
- Author: `Neal Frazier`
- Stack: `React 19 + TypeScript + Vite 6 + Tailwind CSS 4`
- Deployment target: `Netlify`

## What This Site Delivers
- Structured 30-day C curriculum with progressive depth
- Interactive code-focused learning experience
- Supports Gemini key from env or user-supplied local key flow

## Local Development
### Prerequisites
- Node.js 20+
- npm 10+

### Setup
```bash
npm install
cp .env.example .env.local
```

Optional default key in `.env.local`:
```env
GEMINI_API_KEY="your_key_here"
```

The app can also use a user-provided key stored in browser local storage.

### Run
```bash
npm run dev
```
App runs on `http://localhost:3000`.

## Build and Quality
```bash
npm run lint
npm run build
npm run preview
```

## Deploy (Netlify)
- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback behavior is defined for Netlify deployment

## SEO Baseline
- Canonical and social URLs point to: `https://c-in-30.nealfrazier.tech/`
- `robots.txt` and `sitemap.xml` align to canonical host

## Project Layout
```text
src/
public/
index.html
vite.config.ts
```
