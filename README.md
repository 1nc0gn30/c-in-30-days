# c-in-30-days

A practical 30-day C programming course with daily exercises, guided projects,and fundamentals for modern systems programming.

## Overview
A practical 30-day C programming course with daily exercises, guided projects,and fundamentals for modern systems programming.

## Tech Stack
- React
- Vite
- Express

## Project Structure
```
c-in-30-days/
  - public
  - src
  (20 files total)
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
git clone https://github.com/1nc0gn30/c-in-30-days.git
cd c-in-30-days
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Available Scripts
  npm run dev - vite --port=3000 --host=0.0.0.0
  npm run build - vite build
  npm run preview - vite preview
  npm run clean - rm -rf dist
  npm run lint - tsc --noEmit

## Original README
<details>
<summary>Click to expand original README</summary>

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

</details>

## TODO / Roadmap
- [ ] Add unit tests
- [ ] Add LICENSE file
- [ ] Add Dockerfile for containerized deployment
- [ ] Add deployment configuration
- [ ] Consider adding Tailwind CSS
- [ ] Add CI/CD pipeline
- [ ] Add contribution guidelines (CONTRIBUTING.md)
- [ ] Improve error handling and edge cases
- [ ] Add environment variable documentation
- [ ] Update dependencies to latest versions
- [ ] Add code comments and inline documentation

## Deployment
This project can be deployed to Netlify, Vercel, or any static host.

## Author
**Neal Frazier** - [@AshAmplifies](https://github.com/1nc0gn30)

## Links
- GitHub: https://github.com/1nc0gn30/c-in-30-days

---
*This README was enhanced as part of the neals-projects-2026 batch update.*
