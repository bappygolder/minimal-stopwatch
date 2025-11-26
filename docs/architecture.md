# Architecture

This document describes the frontend-only architecture of the **Minimal Stopwatch** app after the migration from the original `stopwatch_app.jsx` demo.

## Tech Stack

- **Framework**: Next.js (app router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **UI primitives**: light, shadcn-like components (`components/ui/*`), powered by a color token system
- **State**: React hooks and local component state only (no backend / database wired yet)

## High-Level Structure

```text
app/
  layout.tsx          # Root layout, loads global styles, sets dark theme
  page.tsx            # Renders the stopwatch feature
  globals.css         # Tailwind base + design tokens

components/
  ui/
    button.tsx        # Reusable token-aware button
    card.tsx          # Reusable card shell
    input.tsx         # Reusable input

features/
  stopwatch/
    types.ts          # `Timer` type
    components/
      stopwatch-app.tsx  # Main client component (state + layout)
      timer-card.tsx     # Presentational timer UI

lib/
  utils.ts            # `cn` helper (clsx + tailwind-merge)

tailwind.config.ts    # Tailwind config wired to design tokens
next.config.mjs       # Next.js config
package.json          # Scripts + dependencies
```

## Stopwatch Feature Design

### Timer model

```ts
export type Timer = {
  id: number;
  label: string;
  isRunning: boolean;
  elapsedMs: number;
};
```

The model is intentionally small and UI-focused so it can later be extended (e.g. laps, session IDs, user IDs) without breaking the UI.

### `stopwatch-app.tsx`

Responsibilities:

- Holds the **array of timers** and app-level UI state:
  - `timers: Timer[]`
  - `isZenMode: boolean`
  - `isFullscreen: boolean`
  - `draggedId: number | null` (for drag-and-drop)
- Implements **timer behavior**:
  - Add / remove timer
  - Update label
  - Toggle running / paused
  - Reset timer
- Implements **render loop**:
  - Uses `requestAnimationFrame` to update `elapsedMs` for all running timers.
  - Runs only when at least one timer is running.
- Implements **drag-and-drop** ordering:
  - `handleDragStart`, `handleDragOver`, `handleDrop` reorder the timers array.
- Implements **UI modes**:
  - Zen mode: hides header and footer until hover.
  - Fullscreen: uses the DOM fullscreen API on the root container.

### `timer-card.tsx`

Responsibilities:

- Presents a single timer:
  - Label input (inline, editable).
  - Time display (`mm:ss.ms`) with responsive typography.
  - Focus mode: enlarges and centers the timer in an overlay.
- Delegates all **business logic** to the parent via props:
  - `onToggle`, `onReset`, `onDelete`, `onUpdateLabel`.
  - DnD handlers: `onDragStart`, `onDragOver`, `onDrop`.
- Adapts its styling based on props:
  - Highlight when running.
  - Dim when being dragged.

This separation keeps UI components reusable, with behavior centralized in `stopwatch-app.tsx`.

## Theming & Color Tokens

### Design tokens

Tokens are defined as CSS variables in `app/globals.css`:

```css
:root {
  --chrono-bg-page: 5 5 5;
  --chrono-bg-card: 15 23 42;
  --chrono-border-subtle: 30 41 59;
  --chrono-fg-primary: 226 232 240;
  --chrono-fg-muted: 148 163 184;
  --chrono-accent: 129 140 248;
  --chrono-danger: 248 113 113;
  --chrono-success: 16 185 129;
  --chrono-warning: 245 158 11;
}
```

These represent **project-specific colors** in RGB, separate from Tailwind/shadcn defaults.

### Mapping tokens into Tailwind

In `tailwind.config.ts`, these tokens are mapped into Tailwind’s color system:

```ts
colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  card: "hsl(var(--card))",
  "card-foreground": "hsl(var(--card-foreground))",
  border: "hsl(var(--border))",
  chrono: {
    "bg-page": "rgb(var(--chrono-bg-page))",
    "bg-card": "rgb(var(--chrono-bg-card))",
    "border-subtle": "rgb(var(--chrono-border-subtle))",
    "fg-primary": "rgb(var(--chrono-fg-primary))",
    "fg-muted": "rgb(var(--chrono-fg-muted))",
    accent: "rgb(var(--chrono-accent))",
    danger: "rgb(var(--chrono-danger))",
    success: "rgb(var(--chrono-success))",
    warning: "rgb(var(--chrono-warning))",
  },
}
``;

Components use these semantic classes (e.g. `bg-chrono-bg-page`, `text-chrono-fg-muted`, `bg-card`, `text-muted-foreground`) instead of hard-coded hex values.

### Why this is upgradable

- Changing the **visual style** of the app only requires editing token values.
- You can add a **light theme** later by using `.light` / `.dark` wrappers and overriding the same tokens.
- If you later introduce official shadcn/ui components, they can reuse the same token set.

## Future Extensions

This frontend architecture is designed to stay stable while you:

- Wire in **Firebase/Firestore** or another backend using repositories and hooks.
- Add **laps**, **history**, or **export** features by extending the `Timer` model and adding new components under `features/stopwatch`.
- Introduce **multi-theme** or **brand customization** by swapping token definitions.
