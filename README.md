# C in 30 Days

An interactive, 100% open-access 30-day C11 systems programming workbench with built-in daily lessons, knowledge checks, instant client-side C code verification, and a step-by-step Stack/Heap Memory Lab.

- **Canonical URL:** `https://c-in-30.nealfrazier.tech/`
- **Author:** Neal Frazier Tech ([@1nc0gn30](https://github.com/1nc0gn30)) • [NullAI Platform](https://nullai.tech)
- **Stack:** React 19 + TypeScript + Vite 6 + Tailwind CSS 4 + PrismJS

## What It Does
- **Complete 30-Day C11 Curriculum Offline:** Every day (Days 1–30, Weeks 1–5) ships with a systems-focused lesson, 2 multiple-choice knowledge checks, starter code, GCC-verified reference solution, and OS-aware `gcc -Wall -Wextra -std=c11` commands—zero login or API key required.
- **Deterministic Local C11 Verifier:** Validates balanced delimiters, entry points, and day-specific C constructs directly in the browser (`src/services/cEvaluator.ts`) with auto-saved drafts in `localStorage`.
- **Interactive Memory Lab:** Step line-by-line through Stack vs. Heap memory frames, LP64 pointer arithmetic strides (`sizeof(int) = 4`), `malloc`/`free` lifecycles, and dangling-pointer neutralization.
- **Portable Progress Tracking:** Tracks completed days and study streaks in `localStorage` with one-click JSON export/import in Settings.

## How It Works
- `src/data/curriculumPart1.ts` & `src/data/curriculumPart2.ts`: Structured 30-day C11 curriculum and reference solutions.
- `src/services/cEvaluator.ts`: Zero-dependency comment stripper, delimiter balancer, and per-exercise static rule engine.
- `src/components/MemoryLab.tsx`: Interactive stack/heap address frame visualizer.
- `tests/test_all.mjs`: Automated `node:test` suite that compiles and executes **all 30 reference C11 solutions with `gcc -Wall -Wextra -Werror -std=c11`**, exercises the local verifier, and audits SEO/AEO/Netlify production guardrails.

## Local Development & Verification

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # TypeScript strict check
npm run build      # Production bundle -> dist/
npm test           # Compiles & runs all 30 C11 solutions with gcc + guardrail checks
```

## Support
This project is 100% free and open-access. If it helped you learn C:
- **Buy Us a Coffee (Stripe):** https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X
- **Solana Tip Address:** `GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK`
