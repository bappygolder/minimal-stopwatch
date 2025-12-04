# Minimal Stopwatch

A beautiful, distraction-free multi-timer application built with **Next.js**, **Tailwind CSS**, and **React**.

![Project Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **Multiple Timers**: Run as many stopwatches as you need simultaneously.
- **Drag & Drop**: Reorder timers easily with a smooth drag interface.
- **Zoom Controls**: Scale your timers up to 3x with viewport-aware sizing.
- **Hamburger Menu**: Quick access to shortcuts, credits, and app info via the header menu.
- **Zen Mode**: Toggle a clean, minimal UI that hides everything except the timers.
- **Focus Mode**: Click "Maximize" on any timer to focus on just that one task.
- **Local Persistence**: Your timers are saved to your browser's Local Storage, so they're waiting for you when you come back.
- **Keyboard Accessible**: Fully usable with keyboard navigation.

## ⌨️ Keyboard Shortcuts

### Focus & Zen
- **F** — Toggle Focus Mode on selected timer  
- **Z** — Toggle Zen Mode on selected timer  
- **Shift + Enter** — Commit title → Start timer (if fresh) → Enter Focus Mode  
- **Cmd/Ctrl + Shift + Enter** — Commit title → Start timer (if fresh) → Enter Zen Mode  
- **+** — Zoom In (when in Focus/Zen)  
- **−** — Zoom Out (when in Focus/Zen)  
- **Shift + Click Focus/Zen icon** — Enter Zen Mode instantly  

### Core Actions
- **N** — Create new timer  
- **T** — Edit title of selected timer  
- **Enter** — Commit title  
  _If empty: assign default name without auto-start. If non-empty and timer is fresh: commit and auto-start._  
- **Space** — Start/Stop selected timer  
- **D** — Delete selected timer  
- **R** — Reset selected timer  
- **Cmd/Ctrl + Shift + R** — Full Reset (remove all timers, restore a fresh Timer #1 at 0:00)  

### Navigation
- **↑ / ↓** — Move focus up/down through timers (scrolls to keep selection in view)  
- **Shift + ↑ / Shift + ↓** — Move selected timer up/down in the list  
- **Cmd/Ctrl + Shift + ↑** — Move selected timer to top  

### App Controls
- **M** — Toggle menu  
- **Cmd/Ctrl + /** — Show “Keyboard Shortcuts” popup  
- **Cmd/Ctrl + Shift + C** — Toggle Compact View layout  
- **Esc** — Exit Focus/Zen or close open panels (shortcuts, About, etc.)  

## 🚀 Quick Start

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the development server**:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom Design Tokens.
- **Icons**: [Lucide React](https://lucide.dev/)
- **State**: React Hooks + Local Storage (No database required).

## 📂 Project Structure

The project follows a feature-based architecture:

- **`app/`**: Next.js App Router pages and global layouts.
- **`features/stopwatch/`**: The core business logic and components for the stopwatch functionality.
- **`components/ui/`**: Reusable UI primitives (buttons, cards, inputs).
- **`docs/`**: Detailed documentation.

For a deep dive into the code structure, check out [architecture.md](./architecture.md).

## ⚠️ Legacy Reference

You may notice a file named **`stopwatch_app.jsx`** in the root directory.
- This is the **original prototype** of the application.
- It contains references to Firebase which are **not used** in the current version.
- It is kept only for historical reference and can be safely ignored.

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🔄 Changelog

- **Nov 2025**: New timers now auto-start and automatically focus the title input for rapid workflow.
- **Nov 2025**: Consolidated Info Card into a unified Hamburger Menu for a cleaner UI.
- **Nov 2025**: Added full keyboard shortcut support (N, Space, F, Z), redesigned the info card, and improved Zen Mode behavior.
