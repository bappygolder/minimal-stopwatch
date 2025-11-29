# Developer Guide

Welcome to the Minimal Stopwatch codebase! This guide is designed to help you understand the architecture, setup the project, and contribute effectively.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with CSS Variables for theming.
- **Icons**: [Lucide React](https://lucide.dev/)
- **State**: React `useState`, `useRef`, and `localStorage` for persistence.

---

## 📂 Project Structure

```text
/app
  layout.tsx       # Root layout (fonts, global styles)
  page.tsx         # Main entry point (renders StopwatchApp)
  globals.css      # Global styles & CSS variables
/features
  /stopwatch
    /components
      stopwatch-app.tsx  # Core logic (state, loop, shortcuts)
      timer-card.tsx     # Individual timer UI & controls
    types.ts             # TS definitions (Timer interface)
/docs              # Documentation (You are here)
```

---

## 🚀 Setup & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it.

3. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🧠 Core Concepts

### 1. Drift-Free Timing Loop
Standard `setInterval` is inaccurate over time because execution delays accumulate. Minimal Stopwatch uses a **delta-time** approach:

- We store a `lastUpdateTime` timestamp for each running timer.
- A global `requestAnimationFrame` loop runs constantly when *any* timer is active.
- In each frame, we calculate `delta = now - lastUpdateTime`.
- We add this `delta` to the timer's `elapsedMs` and update `lastUpdateTime`.

This ensures that even if the browser lags or the tab is backgrounded, the math remains accurate relative to the system clock.

### 2. Persistence (Hydration)
- State is saved to `localStorage` key `chrono-minimal-timers-v1`.
- On load, we check `window` existence (SSR safety) and parse the JSON.
- If parsing fails or data is invalid, we fall back to `DEFAULT_TIMERS`.
- Updates are debounced (saved 500ms after the last change) to avoid performance hits.

### 3. Focus & Zen Logic
- **Browser Focus (`isFocused`)**: A state variable `focusedTimerId` triggers a layout change where the selected timer takes over the screen CSS.
- **Zen Mode (`isFullscreen`)**: Uses the browser's `document.documentElement.requestFullscreen()` API.
- The app listens for the `fullscreenchange` event to sync React state with the browser's actual mode (e.g., if the user presses Esc).

### 4. Keyboard Navigation
- Global `keydown` listener in `StopwatchApp`.
- Shortcuts check `event.target` to ignore typing in input fields.
- **Arrow Keys**: Cycle through the `timers` array, updating `activeTimerId`.

---

## 🎨 Styling
We use semantic CSS variables in `globals.css` (e.g., `--chrono-bg-page`, `--chrono-accent`) mapped to Tailwind config. This allows for easy theming and dark mode adjustments without changing component code.
