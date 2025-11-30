# oLab Micro Projects – Technical Documentation

_Last updated: 2025-11-30_

This document describes the **technical architecture patterns** used in this class of oLab micro projects (with **Minimal Stopwatch** as the reference implementation). It is intended as a reusable template for building small, focused tools with the same structure and behaviour.

---

## 1. Goals & Principles

- **Small, focused tools**: Each project solves a single, well-defined problem (e.g. multi-stopwatch, timer dashboards, focused utilities).
- **Keyboard-first**: Core operations must be accessible via the keyboard and feel fast and predictable.
- **Minimal UI, rich interaction**: The UI is visually simple, but behaviour (shortcuts, focus modes, zoom, etc.) is powerful.
- **Portable patterns**: Architecture and patterns should be easy to copy to new repos.
- **Agent-friendly**: Documentation and state/layout choices are explicit so AI tools can understand and safely modify the project.

---

## 2. Recommended Stack

These projects typically use:

- **Framework:** Next.js (App Router, client components for interactive views).  
- **Language:** TypeScript.  
- **UI Library:** React with hooks (`useState`, `useEffect`, `useRef`, `useMemo`).  
- **Styling:** Tailwind CSS + CSS variables for theming.  
- **Icons:** Lucide (e.g. `lucide-react`).  
- **Persistence:** `localStorage` for small amounts of client state.  
- **Build tooling:** Defaults from Next.js / Vite / similar (no custom Webpack unless needed).

This stack can be swapped with other frameworks, but the patterns below assume a React-style component tree with hooks.

---

## 3. Project Structure Template

A typical oLab micro project following this pattern can use a structure like:

```text
/app
  layout.tsx              # Root layout (HTML, metadata, global providers)
  page.tsx                # Main entry point (renders the core feature component)
  globals.css             # Global styles and design tokens
/features
  /<feature-name>
    /components           # Feature-specific React components
      main-app.tsx        # Top-level feature container (state, shortcuts, layout)
      item-card.tsx       # Reusable card for each primary unit (timer, task, etc.)
    types.ts              # Shared TypeScript types for the feature
/docs
  DESIGN_LANGUAGE.md      # Shared visual & interaction language (this class of projects)
  TECHNICAL_DOCUMENTATION.md  # This file – shared architecture patterns
  DEVELOPER_GUIDE.md      # Project-specific setup and notes
  AI_CONTEXT.md           # AI-focused spec for deeper automation
```

For Minimal Stopwatch specifically, the feature is `stopwatch` and the main components are `stopwatch-app.tsx` and `timer-card.tsx`.

---

## 4. Core Architectural Patterns

### 4.1 Single Feature-Oriented Root Component

- Each micro project has a single **feature root** (e.g. `StopwatchApp`) rendered by the main page.  
- This root component owns:
  - Core state (list of items, selection, modes, layout state).  
  - Global keyboard shortcut handling.  
  - Persistence (save/load from `localStorage`).  
  - Layout shell (header, main content, footer, overlays like menus or focus modes).

**Pattern to reuse:**  
Use a single top-level React component for the main feature and have pages simply delegate to it, so logic stays encapsulated and easy to reuse.

### 4.2 State Management via Hooks

- **`useState`** for primary domain state (e.g. timers, active ID, focus mode, zoom scale).  
- **`useRef`** for:
  - Mutable values needed inside event listeners (`timersRef.current` mirror of state).  
  - DOM references (scroll containers, menus, inputs).  
- **`useEffect`** for:
  - Wiring and cleaning up global event listeners (e.g. `keydown`, `fullscreenchange`, `beforeunload`).  
  - Hydration and persistence side effects.

No global state library is required for these micro projects unless they grow beyond a single primary page.

### 4.3 Persistence & Hydration

- Use `localStorage` keys that are **namespaced per project** (e.g. `chrono-minimal-timers-v1`, `chrono-minimal-scale-v1`).  
- On mount:
  - Guard for `typeof window !== "undefined"` to handle SSR.  
  - Read and parse JSON; validate shapes and provide sane defaults on failure.  
  - Optionally, repair state (e.g. re-calc elapsed time for running timers based on current time).
- When state changes:
  - Debounce writes (e.g. 500ms) using `setTimeout` stored in a `useRef`.  
  - Save only necessary state (domain data + user preferences like zoom scale).

**Reuse advice:**  
In new projects, keep persistence logic in the feature root component and model it after this pattern to avoid scattered `localStorage` calls.

### 4.4 Global Keyboard Shortcuts

- Attach a single `window.addEventListener('keydown', handler)` in the root component.  
- Early-return when the event target is an input/textarea/select to avoid interfering with typing.  
- Normalize the key via `event.key.toLowerCase()` and gate through a **whitelist** of recognized shortcuts.  
- Use a single `activeId` (or similar) to determine which item shortcuts act on.  
- Use a `ref` (e.g. `itemsRef`) for the current list inside the handler to avoid stale closures.

Example behaviours (as used in Minimal Stopwatch and recommended for similar tools):

- Letter keys for high-level actions (`N`, `F`, `Z`, `D`, `R`, `T`, `M`).  
- Arrow keys to select/scroll through items.  
- `Shift + Arrow` for structural changes (e.g. reordering items).  
- `Space` or `Enter` for primary action toggles.  
- `Esc` for exiting modes or clearing focus.  
- Additional shortcuts constrained to certain modes (e.g. `+`/`-` only when in Focus/Zen mode).

Keep this pattern for consistency across oLab micro projects so users can transfer muscle memory.

### 4.5 Layout Modes & Fullscreen Handling

- Represent modes with small, explicit pieces of state:
  - `focusedItemId` (or `focusedTimerId`).  
  - `isFullscreen` or `isZen` flags derived from browser fullscreen APIs.  
  - A `previousModeRef` to remember whether to return to multi-view or focus view when fullscreen exits.
- Use `document.documentElement.requestFullscreen()` and `document.exitFullscreen()` within `try/catch` to avoid crashing on platforms that disallow fullscreen.  
- Listen to `fullscreenchange` to keep React state in sync with the actual browser mode.

This pattern lets any micro project have a **multi-view** and one or more **focus modes** without complex routing.

### 4.6 Reordering via Drag & Keyboard

- Use HTML5 drag-and-drop (`draggable` on cards, `onDragStart`, `onDragOver`, `onDrop`) for mouse-based reordering.  
- For keyboard users, support `Shift + ArrowUp/ArrowDown` to reorder the selected item in the array.  
- Implement reordering by:
  - Finding source and target indices in the current list.  
  - Splicing the array to move the item.  
  - Keeping the same `activeId` so focus stays on the moved item.
- Optionally scroll the active item into view using a `data-*` attribute and `scrollIntoView`.

This pattern works for any ordered list of "cards" (timers, tasks, notes, etc.).

---

## 5. Styling & Theming

- Centralize semantic design tokens in `globals.css` using CSS variables (`--chrono-*`).  
- Map those variables into Tailwind via utility classes (e.g. `bg-chrono-bg-page`, `text-foreground`).  
- Keep components free of hard-coded colors so other projects can retheme by changing variables.

For a full visual spec, see `DESIGN_LANGUAGE.md`.

---

## 6. Documentation Strategy

For similar oLab micro projects, we recommend the same documentation layout:

- **README.md** – Product overview, key features, basic usage, and quick keyboard shortcuts table.  
- **docs/DEVELOPER_GUIDE.md** – Project-specific setup and architecture notes.  
- **docs/AI_CONTEXT.md** – High-density, machine-oriented spec describing state shape, rules, and invariants.  
- **docs/DESIGN_LANGUAGE.md** – Shared visual and interaction design language for this class of tools.  
- **docs/TECHNICAL_DOCUMENTATION.md** – This shared architecture playbook for similarly-structured projects.

This split makes it easy to copy these docs into a new repository and adapt only what is project-specific.

---

## 7. Reuse Checklist for New oLab Micro Projects

When creating a new project in this family, you can:

1. Copy this `TECHNICAL_DOCUMENTATION.md` and `DESIGN_LANGUAGE.md` into the new repo.  
2. Scaffold a Next.js (or similar) app with a single main feature page and root component.  
3. Create a `/features/<feature>` folder with `components`, `types`, and any helpers.  
4. Implement global keyboard handling in the feature root using the whitelisting pattern.  
5. Use semantic CSS variables and Tailwind utilities for theming.  
6. Implement multi-view vs focus/zen modes with a small state surface.  
7. Save and hydrate state from `localStorage` in the feature root.  
8. Document your project using the docs layout described above.

Following these patterns should help new oLab micro projects feel familiar, predictable, and easy to maintain, while still allowing each tool to have its own domain-specific behaviour.
