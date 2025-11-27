# Minimal Stopwatch

A beautiful, distraction-free multi-timer application built with **Next.js**, **Tailwind CSS**, and **React**.

![Project Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **Multiple Timers**: Run as many stopwatches as you need simultaneously.
- **Drag & Drop**: Reorder timers easily with a smooth drag interface.
- **Zen Mode**: Toggle a clean, minimal UI that hides everything except the timers.
- **Focus Mode**: Click "Maximize" on any timer to focus on just that one task.
- **Local Persistence**: Your timers are saved to your browser's Local Storage, so they're waiting for you when you come back.
- **Keyboard Accessible**: Fully usable with keyboard navigation.

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
