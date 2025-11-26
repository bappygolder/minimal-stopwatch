'use client';

import { useEffect, useMemo, useRef, useState, DragEvent } from "react";
import { Eye, EyeOff, Maximize2, Minimize2, Plus, Moon, Sun } from "lucide-react";
import type { Timer } from "@/features/stopwatch/types";
import TimerCard from "@/features/stopwatch/components/timer-card";
import CompactTimerCard from "@/features/stopwatch/components/compact-timer-card";

export default function StopwatchApp() {
  const [timers, setTimers] = useState<Timer[]>([
    {
      id: 1,
      label: "Untitled",
      isRunning: false,
      elapsedMs: 0,
    },
  ]);

  const [isZenMode, setIsZenMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [primaryId, setPrimaryId] = useState<number | null>(1);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const hasRunningTimer = useMemo(
    () => timers.some((timer) => timer.isRunning),
    [timers]
  );

  useEffect(() => {
    if (!hasRunningTimer) {
      return;
    }

    let frameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      setTimers((previous) =>
        previous.map((timer) =>
          timer.isRunning
            ? { ...timer, elapsedMs: timer.elapsedMs + delta }
            : timer
        )
      );

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [hasRunningTimer]);

  // Load persisted timers from localStorage on first mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem("chrono-timers-v1");
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        timers?: Timer[];
        primaryId?: number | null;
      };

      if (Array.isArray(parsed.timers) && parsed.timers.length > 0) {
        setTimers(parsed.timers);
        setPrimaryId(
          parsed.primaryId ?? parsed.timers[0]?.id ?? primaryId,
        );
      }
    } catch (error) {
      console.error("Failed to read timers from localStorage", error);
    }
  }, []);

  // Persist timers to localStorage whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const payload = JSON.stringify({ timers, primaryId });
      window.localStorage.setItem("chrono-timers-v1", payload);
    } catch (error) {
      console.error("Failed to save timers to localStorage", error);
    }
  }, [timers, primaryId]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("chrono-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      return;
    }

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  // Apply theme class and persist – only after theme has been initialised
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!theme) return;

    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("chrono-theme", theme);
  }, [theme]);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) {
      return;
    }

    const handleChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
    };

    document.addEventListener('fullscreenchange', handleChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
    };
  }, []);

  const addTimer = () => {
    setTimers((previous) => {
      const nextId =
        previous.length > 0
          ? Math.max(...previous.map((timer) => timer.id)) + 1
          : 1;

      const newTimer = {
        id: nextId,
        label: "Untitled",
        isRunning: false,
        elapsedMs: 0,
      } as Timer;

      // If we already have a primary timer, insert new timers
      // directly after it so new histories appear at the top.
      let nextTimers: Timer[];
      if (previous.length > 0 && primaryId !== null) {
        const primaryIndex = previous.findIndex((t) => t.id === primaryId);
        if (primaryIndex >= 0) {
          nextTimers = [...previous];
          nextTimers.splice(primaryIndex + 1, 0, newTimer);
        } else {
          nextTimers = [...previous, newTimer];
        }
      } else {
        nextTimers = [...previous, newTimer];
      }

      // Keep current primary; new timers start as compact/history by default
      if (previous.length === 0) {
        setPrimaryId(nextId);
      }

      return nextTimers;
    });
  };

  const removeTimer = (id: number) => {
    setTimers((previous) => {
      if (previous.length <= 1) {
        return previous;
      }

      const next = previous.filter((timer) => timer.id !== id);

      if (primaryId === id) {
        const nextPrimary = next.length > 0 ? next[0].id : null;
        setPrimaryId(nextPrimary);
      }

      return next;
    });
  };

  const updateLabel = (id: number, label: string) => {
    setTimers((previous) =>
      previous.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              label,
            }
          : timer
      )
    );
  };

  const toggleTimer = (id: number) => {
    setTimers((previous) =>
      previous.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              isRunning: !timer.isRunning,
            }
          : timer
      )
    );
  };

  const resetTimer = (id: number) => {
    setTimers((previous) => {
      const target = previous.find((timer) => timer.id === id);
      if (!target) {
        return previous;
      }

      const shouldCreateHistory = target.isRunning && target.elapsedMs > 0;

      // Reset the original timer
      let nextTimers = previous.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              isRunning: false,
              elapsedMs: 0,
            }
          : timer
      );

      if (shouldCreateHistory) {
        const nextId =
          previous.length > 0
            ? Math.max(...previous.map((timer) => timer.id)) + 1
            : 1;
        const historyTimer: Timer = {
          id: nextId,
          label: target.label,
          isRunning: false,
          elapsedMs: target.elapsedMs,
        };

        // Insert new history directly after the primary timer so
        // newest histories appear at the top of the history list.
        const primaryIndex =
          primaryId !== null
            ? nextTimers.findIndex((timer) => timer.id === primaryId)
            : -1;

        if (primaryIndex >= 0) {
          const withHistory = [...nextTimers];
          withHistory.splice(primaryIndex + 1, 0, historyTimer);
          nextTimers = withHistory;
        } else {
          nextTimers = [historyTimer, ...nextTimers];
        }
      }

      return nextTimers;
    });
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id: number) => {
    setDraggedId(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(id));
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, targetId: number) => {
    event.preventDefault();

    if (draggedId === null || draggedId === targetId) {
      return;
    }

    setTimers((previous) => {
      const sourceIndex = previous.findIndex((timer) => timer.id === draggedId);
      const targetIndex = previous.findIndex((timer) => timer.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) {
        return previous;
      }

      if (sourceIndex === targetIndex) {
        return previous;
      }

      const updated = [...previous];
      const [moved] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, moved);

      // If we dragged a history timer onto the primary timer, promote the dragged timer
      if (primaryId !== null && targetId === primaryId && draggedId !== primaryId) {
        setPrimaryId(draggedId);
      }

      // If we dragged the primary timer onto a history timer, promote the target timer
      if (primaryId !== null && draggedId === primaryId && targetId !== primaryId) {
        setPrimaryId(targetId);
      }

      return updated;
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggedId(null);
  };

  const toggleZenMode = () => {
    setIsZenMode((value) => !value);
  };

  const toggleTheme = () => {
    setTheme((value) => (value === "dark" ? "light" : "dark"));
  };

  const toggleFullscreen = () => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(() => undefined);
    } else {
      document.exitFullscreen().catch(() => undefined);
    }
  };

  const promoteTimer = (id: number) => {
    setPrimaryId(id);
  };

  return (
    <div
      ref={containerRef}
      className="h-screen bg-chrono-bg-page text-foreground font-sans selection:bg-muted overflow-hidden"
    >
      {/* Top toolbar */}
      <div
        className={[
          "fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 transition-opacity duration-500",
          isZenMode || isFullscreen
            ? "opacity-0 hover:opacity-100"
            : "opacity-100",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <h1 className="text-xl font-bold text-chrono-fg-muted tracking-widest uppercase hidden sm:block">
          Chrono<span className="text-foreground">Minimal</span>
        </h1>

        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md p-1.5 rounded-full border border-border ml-auto">
          <button
            onClick={toggleZenMode}
            className={[
              "p-2 rounded-full transition-colors",
              isZenMode
                ? "bg-chrono-accent text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-card",
            ]
              .filter(Boolean)
              .join(" ")}
            title="Zen mode"
          >
            {isZenMode ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <button
            onClick={addTimer}
            className="p-2 rounded-full bg-card text-foreground hover:bg-card/80 transition-colors"
            title="Add stopwatch"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Main content: primary timer + history */}
      <div
        className={[
          "min-h-screen flex flex-col items-center p-4 transition-all duration-500 gap-6",
          timers.length >= 1 ? "pt-24 pb-24" : "justify-center",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {timers.length > 0 && (() => {
          const currentPrimaryId =
            primaryId && timers.some((timer) => timer.id === primaryId)
              ? primaryId
              : timers[0].id;

          const primaryTimer = timers.find(
            (timer) => timer.id === currentPrimaryId,
          )!;

          const secondaryTimers = timers.filter(
            (timer) => timer.id !== currentPrimaryId,
          );

          return (
            <>
              <TimerCard
                timer={primaryTimer}
                totalTimers={timers.length}
                isZenMode={isZenMode}
                isBeingDragged={draggedId === primaryTimer.id}
                onToggle={() => toggleTimer(primaryTimer.id)}
                onReset={() => resetTimer(primaryTimer.id)}
                onDelete={() => removeTimer(primaryTimer.id)}
                onUpdateLabel={(label) => updateLabel(primaryTimer.id, label)}
                onDragStart={(event) => handleDragStart(event, primaryTimer.id)}
                onDragOver={(event) => handleDragOver(event, primaryTimer.id)}
                onDrop={handleDrop}
              />

              <div className="w-full max-w-4xl mt-4">
                <div className="mb-2 flex items-baseline justify-between text-xs text-chrono-fg-muted">
                  <span>Total: {secondaryTimers.length}</span>
                </div>
                <div className="chrono-scroll max-h-[36vh] overflow-y-auto pr-1 flex flex-col gap-3 pb-32">
                  {secondaryTimers.map((timer) => (
                    <CompactTimerCard
                      key={timer.id}
                      timer={timer}
                      isPrimary={false}
                      isZenMode={isZenMode}
                      isBeingDragged={draggedId === timer.id}
                      onToggle={() => toggleTimer(timer.id)}
                      onReset={() => resetTimer(timer.id)}
                      onDelete={() => removeTimer(timer.id)}
                      onUpdateLabel={(label) => updateLabel(timer.id, label)}
                      onPromote={() => promoteTimer(timer.id)}
                      onDragStart={(event) => handleDragStart(event, timer.id)}
                      onDragOver={(event) => handleDragOver(event, timer.id)}
                      onDrop={handleDrop}
                    />
                  ))}
                </div>
              </div>
            </>
          );
        })()}
        {/* Fixed + button aligned with history area (bottom-right within max-w-4xl) */}
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 flex justify-end pointer-events-none">
          <button
            onClick={addTimer}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-md hover:shadow-lg transition-shadow pointer-events-auto"
            aria-label="Add timer"
          >
            <Plus size={22} />
          </button>
        </div>

        {/* Helper text at bottom of viewport */}
        <div
          className={[
            "fixed bottom-4 left-0 right-0 text-center text-chrono-fg-muted text-sm pointer-events-none transition-opacity duration-500",
            isZenMode ? "opacity-0" : "opacity-100",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          Click time to start or stop. Drag handle to reorder.
        </div>
      </div>
    </div>
  );
}
