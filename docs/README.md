# Minimal Stopwatch – Docs

This folder documents how this repository evolved from a single React demo file into a structured Next.js stopwatch app with Tailwind and a color token system.

## Files

- `README.md` (this file) – high-level overview and quickstart.
- `architecture.md` – app structure, feature layout, and theming model.
- `history-from-demo.md` – step-by-step record of what was changed from the original `stopwatch_app.jsx` to the current codebase.

## Quick Summary

- Original repo: a single `stopwatch_app.jsx` file implementing a stopwatch UI + Firebase-backed persistence.
- Target stack: **Next.js (app router)** + **Tailwind CSS** + **Lucide** + **token-based colors**, frontend-only to start.
- Current state: a functional multi-timer stopwatch page in `/app/page.tsx` powered by `features/stopwatch`, with a reusable color token system in `app/globals.css` and `tailwind.config.ts`.

For details, see the other docs in this folder.
