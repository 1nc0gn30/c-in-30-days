<!-- xonettn -->
<div align="center">

# 📚 C in 30 Days

A practical, beginner-to-intermediate C programming course delivered through a modern interactive web interface.


![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Framer](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white)

![Deploy](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify&logoColor=white)

</div>

---

## Snapshot
- Canonical URL: `https://c-in-30.nealfrazier.tech/`
- Author: `Neal Frazier`
- Stack: `React 19 + TypeScript + Vite 6 + Tailwind CSS 4`
- Deployment target: `Netlify`

## What This Site Delivers
- Structured 30-day C curriculum with progressive depth
- Interactive code-focused learning experience
- Supports Gemini key from env or user-supplied local key flow

## 💻 Local Development
### 📋 Prerequisites
- Node.js 20+
- npm 10+

### ⚙️ Setup
```bash
npm install
cp .env.example .env.local
```

Optional default key in `.env.local`:
```env
GEMINI_API_KEY="your_key_here"
```

The app can also use a user-provided key stored in browser local storage.

### 🚀 Run
```bash
npm run dev
```
App runs on `http://localhost:3000`.

## 🔨 Build and Quality
```bash
npm run lint
npm run build
npm run preview
```

## 🚀 Deploy (Netlify)
- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback behavior is defined for Netlify deployment

## 🔍 SEO Baseline
- Canonical and social URLs point to: `https://c-in-30.nealfrazier.tech/`
- `robots.txt` and `sitemap.xml` align to canonical host

## Project Layout
```text
src/
public/
index.html
vite.config.ts
```

---

<div align="center">

**[xonettn]** · Built by [Neal Frazier](https://github.com/1nc0gn30) · [@AshAmplifies](https://twitter.com/AshAmplifies)

</div>
