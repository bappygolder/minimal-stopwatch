# AI Context Specification

**Purpose**: This file serves as the technical source of truth for LLMs and AI Agents working on ChronoMinimal. Read this before proposing code changes.

---

## 1. Data Models

### Timer Schema (`Timer` type)
```typescript
interface Timer {
  id: number;              // Unique identifier (timestamp or incremental)
  label: string;           // User-defined title
  isRunning: boolean;      // Active state
  elapsedMs: number;       // Total accumulated time in milliseconds
  lastUpdateTime?: number; // Timestamp of last frame update (if running)
}
```

### Key State Variables (`StopwatchApp`)
- `timers`: `Timer[]` - Main source of truth.
- `focusedTimerId`: `number | null` - ID of timer in Browser Focus mode.
- `activeTimerId`: `number | null` - ID of timer currently selected for keyboard shortcuts.
- `isFullscreen`: `boolean` - Tracks `document.fullscreenElement` state.
- `focusScale`: `number` - Zoom level for the focused timer display (0.5 to 3.0).

---

## 2. Logic & Rules

### Timing Mechanism
- **Loop**: `requestAnimationFrame`.
- **Calculation**: `elapsedMs += (Date.now() - lastUpdateTime)`.
- **Correction**: Update `lastUpdateTime` to `Date.now()` immediately after adding delta.
- **Concurrency**: Single loop handles *all* running timers. `timers.map` iterates and updates only if `timer.isRunning` is true.

### Timer Creation Workflow
1. User triggers creation (`N` key or UI button).
2. New timer added to **top** of list (`[newTimer, ...previous]`).
3. `isRunning` initialized to `false`.
4. `label` initialized to empty string `""`.
5. **Auto-Focus**: Input field for title is automatically focused (`createdTimerId` state).
6. **Commit**: Timer starts automatically **only after** title is committed (Blur or Enter key).

### Navigation & Shortcuts
- **Arrow Up/Down**: Cycles `activeTimerId` based on index in `timers` array. Clamps at 0 and length-1 (no loop).
- **Spacebar**: Toggles start/stop for `activeTimerId`.
- **F**: Toggles Browser Focus (CSS layout change).
- **Z**: Toggles Zen Mode (Fullscreen API).
- **Constraint**: Shortcuts disabled if user is typing in an `input` or `textarea`.

### Drag & Drop
- **HTML5 DnD API**: Used via `onDragStart`, `onDragOver`, `onDrop`.
- **Logic**: Reorders the `timers` array by splicing the dragged item from `sourceIndex` to `targetIndex`.

---

## 3. UI/UX Micro-Interactions

- **Sticky Header**: `sticky top-0 bg-chrono-bg-page/95 backdrop-blur-sm`. Hides when `focusedTimerId` is active.
- **Footer**: `mt-auto`. Pushed to bottom of viewport on short content; scrolls naturally on long content.
- **Visual Feedback**:
  - **Highlight**: `ring-2 ring-chrono-accent` applied transiently (200ms) on keyboard interaction.
  - **Hover Controls**: Timer controls fade in on hover (`group-hover:opacity-100`) or interaction; auto-hide after 3 seconds.
- **Focus Mode**:
  - Container becomes `fixed inset-0 z-50`.
  - Typography scales using `vw` units multiplied by `--timer-scale`.
  - Zoom controls appear bottom-right.

---

## 4. Design Tokens (Tailwind Config)

Do not introduce hardcoded hex values. Use these CSS variables mapped in `globals.css`:

| Token Class | Usage |
| :--- | :--- |
| `bg-chrono-bg-page` | Main application background (very dark). |
| `bg-chrono-bg-card` | Timer card background. |
| `text-chrono-fg-primary` | Primary text color. |
| `text-chrono-fg-muted` | Secondary/Label text color. |
| `text-chrono-accent` | Active elements, focus rings, highlights. |
| `text-chrono-danger` | Delete/Reset actions. |
| `text-chrono-success` | Start button (inactive state). |
| `text-chrono-warning` | Pause button (active state). |

---

## 5. File Locations
- **Main Logic**: `/features/stopwatch/components/stopwatch-app.tsx`
- **UI Component**: `/features/stopwatch/components/timer-card.tsx`
- **Global Styles**: `/app/globals.css`
