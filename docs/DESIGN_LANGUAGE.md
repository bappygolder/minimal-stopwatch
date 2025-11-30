# Minimal Stopwatch – Design Language Guide

_Last updated: 2025-11-30_

This document describes the **visual and interaction design language** of **Minimal Stopwatch** so that other projects can reuse the same look and feel. It is intended for designers, developers, and AI tooling that want to recreate or extend this style consistently.

---

## 1. Brand & Product Feel

- **Product name:** Minimal Stopwatch  
- **Tagline:** A distraction-free, high-precision multi-stopwatch for deep work.  
- **Attribution:** "Minimal Stopwatch" by **oLab** (lowercase `o`, uppercase `L`).

**Personality keywords:**

- Minimal  
- Calm  
- Focused  
- Precise  
- Keyboard-first  
- Professional but friendly

The experience should feel like a **precision instrument** that gets out of the way. Visual noise is kept to a minimum; interactions and motion are subtle and purposeful.

---

## 2. Layout & Structure

### 2.1 Page Layout

- **Overall structure:** Full-height flex column (`min-height: 100vh`):
  - Sticky header at the top.  
  - Scrollable main content area.  
  - Footer anchored with `margin-top: auto`.
- **Scrolling:**
  - Page scrolls within the main container (`overflow-y-auto`).  
  - Header and footer remain visually anchored.

### 2.2 Header

- **Positioning:** `position: sticky; top: 0;` with background blur.
- **Content:**
  - Left: product name in uppercase, wide tracking (e.g. Tailwind `tracking-widest`), light weight.  
  - Right: hamburger menu button (Lucide `Menu` icon) for app info and keyboard shortcuts.
- **Visibility rules:**
  - In multi-timer mode: header is visible.  
  - In Focus/Zen: header fades out to reduce distraction.  
  - If the menu is open, header becomes visible even in Focus/Zen so the menu panel can be seen.

### 2.3 Main Content

- **Timers column:**
  - Single centered column of timer cards.  
  - Maximum width ~ `max-width: 4xl` (a comfortable card width on desktop).  
  - Horizontal padding (~`1–2rem`) on all screen sizes.
- **Vertical rhythm:**
  - Consistent vertical gaps between timer cards (e.g. Tailwind `gap-8`).
  - Cards have generous top/bottom padding, making each timer feel like a standalone object.

### 2.4 Footer

- **Placement:** At the bottom of the scrollable area, using `mt-auto` on the content wrapper.
- **Content:**
  - Small, low-contrast text.  
  - Maintainer credit and year, centered.

---

## 3. Color System

Color is implemented with CSS variables and Tailwind tokens. Keeping the **same semantic names** is the best way to reproduce this design in other projects.

### 3.1 Semantic Tokens

- **Backgrounds:**
  - `--chrono-bg-page` – Main page background.  
    - A soft, dark-ish neutral (not pure black), low saturation.  
  - `--chrono-bg-card` – Card background color.  
    - Slightly lighter than the page background for depth.
- **Borders:**
  - `--chrono-border-subtle` – Low-contrast border color for cards and header bottom.
- **Text / Foreground:**
  - `--chrono-fg-primary` / `text-foreground` – Primary text (labels, digits).  
  - `--chrono-fg-muted` / `text-muted-foreground` – Secondary text, hints, helper copy.
- **Accent & Status:**
  - `--chrono-accent` – Primary accent color. Used for:
    - Active focus rings on timers.  
    - Title input focus border.  
    - Key icons (e.g. focus/zen).  
  - `--chrono-success` – Positive/action tint for **Start** / **Play** states.  
  - `--chrono-warning` – Attention tint for **Pause** / running indicator.  
  - `--chrono-danger` – Destructive and strong emphasis (reset, delete).

### 3.2 Usage Principles

- Backgrounds use **layered neutrals** with opacity (e.g. `bg-chrono-bg-card/40`) to give depth without heavy blocks of color.
- Accent is applied **sparingly**:
  - Focus rings, border highlights, selection hints.  
  - Keyboard-focused timer glow.  
- Muted text is used for **supporting information** (helper text, descriptions, hints) so primary labels and digits stand out.

---

## 4. Typography

### 4.1 Fonts

- **Primary UI font:** System sans-serif stack (e.g. `-apple-system, BlinkMacSystemFont, system-ui, sans-serif`).
- **Numeric / technical font:** Monospace for time displays and keyboard shortcut pills (`font-mono`).

### 4.2 Hierarchy & Styling

- **App title (header):**
  - All caps (`Minimal Stopwatch` displayed as `MINIMAL STOPWATCH` in UI).  
  - Light weight (`font-extralight`).  
  - Wide letter-spacing (`tracking-widest`).
- **Timer title:**
  - Regular sans serif.  
  - Left-aligned in multi-timer view; centered in Focus/Zen.  
  - Muted color when idle, accent underline/border on focus.  
  - Placeholder: `Type timer name…` in slightly transparent muted color.
- **Timer digits:**
  - Monospace, large, tight line height, very tight tracking.  
  - Hours/minutes/seconds vs milliseconds:
    - Main units: larger font-weight and size.  
    - Milliseconds: smaller, slightly offset, but horizontally aligned.
- **Helper text & hints:**
  - Very small (around `10px`).  
  - Often uppercase with extra letter-spacing (`tracking-widest`).  
  - Low contrast by default, brightened slightly on hover or active context.

### 4.3 Responsive Typography

- In multi-timer view, use viewport-based sizes (e.g. `text-[12vw]` → `text-[8rem]` on desktop).  
- In Focus/Zen, the timer uses a scale variable (e.g. `--timer-scale`), multiplied into relatively large base sizes, to allow smooth zooming without layout breakage.

---

## 5. Spacing, Corners, and Surfaces

### 5.1 Spacing

- **Page padding:**  
  - Around `1–1.5rem` (e.g. Tailwind `p-4` / `p-6`).
- **Timer cards:**  
  - Top padding substantial (e.g. `pt-20`) to create breathing room above the digits.  
  - Bottom padding (e.g. `pb-12`) to separate digits from control buttons.  
  - Horizontal padding (e.g. `px-8`).
- **Gaps:**  
  - `gap-8` between timer cards in the main stack.

### 5.2 Shape

- **Cards & panels:**  
  - `border-radius` similar to Tailwind `rounded-2xl`.  
  - Creates a soft, friendly appearance while still feeling modern.
- **Icon buttons:**  
  - Circular (`rounded-full`) or pill-shaped for timer controls, zoom buttons, menu trigger.

### 5.3 Surfaces & Shadows

- **Timers:**
  - Idle: `bg-chrono-bg-card/40` with subtle border.  
  - Running: `bg-chrono-bg-card/80` plus glow (e.g. `shadow-chrono-glow`).
- **Menu:**
  - Opaque background, clear border, and a noticeable drop shadow (`shadow-2xl`).
- **Highlighted timer:**
  - Accent ring + glow + slight scale up (`scale-[1.01]`).  
  - Used for keyboard selection and keyboard-based reordering feedback.

---

## 6. Iconography

Icons are sourced from **Lucide** (e.g. via `lucide-react`). Reusing the same icons and relative sizes helps maintain the visual identity.

### 6.1 Core Icons

- **Playback & control:**  
  - Start: `Play` (filled).  
  - Pause: `Pause` (filled).  
  - Stop/Reset: `Square` (filled).
- **Layout & modes:**  
  - Focus/Zen toggle: `Scan`.  
  - Exit/resize: `Minimize2`.
- **Structure:**  
  - Drag handle for reordering: `GripVertical`.
- **Menu & zoom:**  
  - App menu / info: `Menu`.  
  - Zoom in/out: `Plus`, `Minus`.  
  - Reset zoom: `RotateCcw`.

### 6.2 Icon Styling

- Typical size: `20–24px`.  
- Non-primary icons (e.g. drag handle, menu) use `text-muted-foreground` and brighten on hover (`hover:text-foreground` or `hover:text-chrono-accent`).  
- Icons inside circle buttons inherit the button’s color and keep consistent padding.

---

## 7. Components & States

### 7.1 Timer Card (Multi-Timer View)

**Container:**

- Relative, flex-column center alignment.  
- Pointer cursor for the overall card (clicking toggles start/stop).  
- Border + background per the color rules above.

**Title input (top):**

- Editable single-line input.  
- In multi-timer mode: left-aligned, in the card header.  
- On focus:
  - Border-bottom becomes accent-colored.  
  - Text color nudges towards accent.

**Main time display:**

- Centered block with monospace digits.  
- Hours/minutes/seconds large; milliseconds smaller and slightly offset.  
- All transitions are smooth when toggling Focus/Zen or zooming.

**Control row (bottom):**

- Two circular buttons: **Reset** (Square) and **Play/Pause**.  
- Visual language:
  - Reset: red tint (`text-chrono-danger`, `bg-card` with hover emphasis).  
  - Start: green-ish success tint.  
  - Pause: amber/yellowish warning tint.  
- Interactive feedback: hover color shift + scale transition.

### 7.2 Focus Mode & Zen Mode

- **Layout:**  
  - Timer card becomes a full-screen overlay (`fixed inset-0`).  
  - Centered vertically and horizontally, with space for title above and controls below.
- **Zoom:**  
  - Controlled by a numeric `focusScale` applied as a CSS variable.  
  - Zoom buttons in bottom-right: circular, blurred background, subtle border, tooltip labels.
- **Hints:**  
  - Temporary "Press Esc to exit" label near top-right in Focus (non-fullscreen) mode.

### 7.3 Hamburger Menu / Info Panel

- **Trigger:**  
  - Icon button in sticky header.
- **Panel:**
  - Right-aligned popover under the button.  
  - Rounded-2xl, `bg-card`, thin border, `shadow-2xl`.  
  - Animated with scale + fade + translate:  
    - Closed: `opacity-0 scale-95 -translate-y-2 pointer-events-none`.  
    - Open: `opacity-100 scale-100 translate-y-0`.
- **Sections:**
  1. Header: app name, attribution, maintainer link.  
  2. Keyboard shortcuts: grid of description (text) + `<kbd>` pill.  
  3. Divider line.  
  4. Footer links: GitHub, version.  
  5. Short description (how to use timers and drag handles).

### 7.4 Keyboard Shortcut Pills

- Implemented with `<kbd>` and styled consistently:
  - Monospace font.  
  - Solid foreground background (`bg-foreground`) and inverted text (`text-background`).  
  - Small rounded rectangle with padding (`px-1.5 py-0.5`).  
  - Fixed minimum width for better alignment.
- Letters are uppercase (`N`, `F`, `Z`, `D`, `R`, `T`, `M`).  
- Words are capitalized or title-case for special keys (`Space`, `Esc`).

---

## 8. Keyboard Interaction Language

### 8.1 Global Principles

- Shortcuts are only active when **inputs are not focused**.  
- There is a concept of an **active/selected timer** that keyboard shortcuts operate on.  
- Arrow keys move selection; mouse clicks sync the selection.

### 8.2 Core Shortcuts

These are both implemented and surfaced visually in the shortcuts list.

- **Timer lifecycle & navigation:**
  - `N` – Create new timer.  
  - `Space` – Start/Stop the active timer.  
  - `↑` – Select previous timer.  
  - `↓` – Select next timer.
- **Modes:**
  - `F` – Toggle Focus Mode (browser window).  
  - `Z` – Toggle Zen Mode (fullscreen).  
  - `Esc` – Exit Focus/Zen or clear focus.
- **Timer management:**
  - `D` – Delete active timer.  
  - `R` – Reset active timer.  
  - `T` – Focus the title input of the active timer for editing.  
  - `Enter` – Commit title when editing (blur and apply).
- **Reordering & menu:**
  - `Shift + ↑` / `Shift + ↓` – Move the active timer up/down in the list.  
  - `M` – Toggle menu open/closed.
- **Zoom (Focus/Zen only):**
  - `+` / `Shift + =` – Zoom in on the focused timer (up to scale ~3).  
  - `-` – Zoom out on the focused timer (down to scale ~0.5).

The design language expects that new projects reusing this style:

- Preserve the **active element** concept and visual highlight.  
- Follow the same keyboard-first philosophy, even if the exact actions differ.

---

## 9. Motion & Micro-interactions

- **Transitions:**
  - Typical durations: `200–500ms` for opacity, transform, and color transitions.  
  - Components use `transition-all` for smooth state changes.
- **Card feedback:**
  - Click/press: small scale-down (`active:scale-95`).  
  - Running: subtle glow and background intensification.
- **Highlight fade:**
  - When a timer is selected or moved by keyboard, it briefly shows a ring/glow and scale-up, then fades out.
- **Menu animation:**
  - Combined fade, slide, and scale gives a "Notion-like" dissolve/slide effect.

---

## 10. Reuse Checklist for New Projects

When applying this design language to a new app:

1. **Adopt the same layout:** sticky header, scrollable content, mt-auto footer.  
2. **Reuse the color semantics:** `chrono` background/foreground/accent/status variables.  
3. **Use system sans + monospace pairing** with similar sizes and hierarchy.  
4. **Build cards and panels** with rounded-2xl corners, layered neutral surfaces, and accent glows.  
5. **Implement a keyboard-first interaction model** with an active selection and shortcuts.  
6. **Use Lucide icons** with similar roles and sizes.  
7. **Preserve motion style:** gentle fade/scale transitions for state changes and popovers.  
8. **Document shortcuts in-app** using `<kbd>` pills in a menu/info panel.

Following this guide should let another project achieve a **visually consistent** and familiar Minimal Stopwatch experience, even in a different codebase or tech stack.
