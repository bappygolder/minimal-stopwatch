# History – From Demo to Next.js App

This document explains, in order, what was done to evolve this repository from a single React demo file into a structured Next.js stopwatch frontend.

## 1. Original State

- Repository contained **one file**: `stopwatch_app.jsx`.
- That file implemented:
  - A **Stopwatch** presentational component.
  - An **App** component that:
    - Managed an array of timers.
    - Used Firebase Auth (anonymous or custom token).
    - Persisted timers in Firestore under `artifacts/{appId}/users/{userId}/timer_data/main_state`.
    - Included drift-correction logic and a `requestAnimationFrame` loop.
    - Supported multiple timers, drag-and-drop reordering, Zen mode, fullscreen, and a polished Tailwind-based UI.

This file was treated as a **UI + behavior reference** for the new app.

## 2. Target Direction

You requested:

- A real project using **Next.js (app router)** + **Tailwind CSS** + **Lucide**.
- A **frontend-only** implementation first (no Firebase/DB wiring yet).
- Clean, upgradable structure and a **color token system** for theming.

Based on that, we decided to create a new Next.js app structure in this repo (Option B) and keep `stopwatch_app.jsx` as a reference.

## 3. Project Scaffolding

Created core project files in the existing repo (without deleting `stopwatch_app.jsx`):

- `package.json`
  - Added scripts: `dev`, `build`, `start`, `lint`.
  - Added dependencies: `next`, `react`, `react-dom`, `lucide-react`, `clsx`, `tailwind-merge`.
  - Added dev dependencies: `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `eslint`, `eslint-config-next`, `@types/*`.

- `tsconfig.json`
  - TypeScript config for a Next.js app with strict mode.
  - Path alias: `@/*` → project root.

- `next.config.mjs`
  - Minimal Next.js config with `reactStrictMode: true`.

- `postcss.config.cjs`
  - Standard Tailwind + autoprefixer setup.

- `tailwind.config.ts`
  - Tailwind configured to scan `app/`, `components/`, and `features/`.
  - Custom colors powered by CSS variables, including a `chrono` color namespace.

- `next-env.d.ts`
  - Standard Next.js TypeScript environment declarations.

## 4. Global Layout & Styles

- Created `app/layout.tsx`:
  - Imports `./globals.css`.
  - Defines the HTML skeleton and sets the `dark` class on `<html>`.

- Created `app/globals.css`:
  - Configured Tailwind `@tailwind base; @tailwind components; @tailwind utilities;`.
  - Defined **design tokens** as CSS variables:
    - Project tokens: `--chrono-bg-page`, `--chrono-bg-card`, `--chrono-border-subtle`, `--chrono-fg-primary`, `--chrono-fg-muted`, `--chrono-accent`, `--chrono-danger`, `--chrono-success`, `--chrono-warning`.
    - shadcn-like tokens: `--background`, `--foreground`, `--card`, `--muted`, `--border`, etc.
  - Set body defaults to use the `chrono` background and foreground tokens.

## 5. UI Utilities

- Created `lib/utils.ts` with a `cn` helper that combines `clsx` + `tailwind-merge`.
- Added minimal shadcn-style UI primitives under `components/ui/`:
  - `button.tsx` – rounded, token-aware button.
  - `card.tsx` – card shell using token-based background and border.
  - `input.tsx` – styled input using token-based borders and focus states.

These primitives ensure consistent look & feel and rely only on the token system, not hard-coded colors.

## 6. Stopwatch Feature Extraction

Created a feature module under `features/stopwatch/`:

- `types.ts`
  - Defined a small `Timer` type with `id`, `label`, `isRunning`, and `elapsedMs`.

- `components/timer-card.tsx`
  - Ported the **presentational stopwatch UI** from the original demo:
    - Label input.
    - Big `mm:ss.ms` time display with responsive typography.
    - Focus mode (overlay, enlarged typography).
    - Drag handle and delete button (only when multiple timers exist).
    - Play/pause and reset controls at the bottom.
  - Kept it stateless with respect to business logic:
    - Receives handlers via props: `onToggle`, `onReset`, `onDelete`, `onUpdateLabel`, and DnD handlers.
    - Uses `isRunning`, `isZenMode`, and `isBeingDragged` props to adjust its visual state.
  - Replaced inline colors with **token-based Tailwind classes** (e.g. `bg-chrono-bg-card`, `text-chrono-fg-muted`).

- `components/stopwatch-app.tsx`
  - Implemented the main client component (`'use client';`) that:
    - Owns the array of `Timer` objects and app UI state (zen, fullscreen, DnD).
    - Implements the `requestAnimationFrame` loop that updates `elapsedMs` for running timers.
    - Implements add/remove/toggle/reset actions purely in local state.
    - Implements drag-and-drop reordering by rearranging the `timers` array.
    - Implements Zen mode and fullscreen mode on a container `div`.
  - This component mirrors the behavior of the original `App` in `stopwatch_app.jsx`, but **without any Firebase or Firestore logic**.

## 7. Wiring the Page

- Created `app/page.tsx` that simply renders the stopwatch feature:

  ```tsx
  import StopwatchApp from "@/features/stopwatch/components/stopwatch-app";

  export default function Page() {
    return <StopwatchApp />;
  }
  ```

This makes the stopwatch UI the home page at `/`.

## 8. What Stayed Unchanged

- The original `stopwatch_app.jsx` file remains in the repo as a **reference implementation**.
  - It is not used by the new Next.js app.
  - Its Firebase-related logic is intentionally not wired into the new frontend.

## 9. Current Status

- The project is now a **Next.js app** with:
  - A functional, frontend-only stopwatch feature (multiple timers, focus, zen, fullscreen, drag-to-reorder).
  - A consistent **color token system** for theming.
- No database / Firebase is connected yet; all state is in-memory on the client.

Future work can build on this foundation to:

- Reintroduce Firebase/Firestore using a clean repository abstraction.
- Extend the stopwatch model (laps, history, export, presets).
- Add multi-theme support or brand-specific themes by redefining tokens.
