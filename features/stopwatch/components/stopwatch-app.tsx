'use client';

import { useEffect, useMemo, useRef, useState, DragEvent } from "react";
import { Plus } from "lucide-react";
import type { Timer } from "@/features/stopwatch/types";
import TimerCard from "@/features/stopwatch/components/timer-card";
import GlobalMenu from "./global-menu";

const STORAGE_KEY = "chrono-minimal-timers-v1";
const STORAGE_KEY_SCALE = "chrono-minimal-scale-v1";

const DEFAULT_TIMERS: Timer[] = [
  {
    id: 1,
    label: "First timer",
    isRunning: false,
    elapsedMs: 0,
  },
];

export default function StopwatchApp() {
  const [timers, setTimers] = useState<Timer[]>(DEFAULT_TIMERS);

  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [focusedTimerId, setFocusedTimerId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [focusScale, setFocusScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [returnToMode, setReturnToMode] = useState<"focus" | "multi">("multi");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const timersRef = useRef(timers);

  // Keep ref synced with state for event listeners
  timersRef.current = timers;

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timersRef.current));
      } catch {
        // Ignore write errors
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [theme]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        // Exiting fullscreen: decide where to go based on previous mode
        if (returnToMode === "multi") {
          setFocusedTimerId(null);
        }
        // If returnToMode is "focus", we intentionally keep focusedTimerId set
        // to return to Browser Focus Mode.
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [returnToMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && focusedTimerId !== null && !document.fullscreenElement) {
        setFocusedTimerId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedTimerId]);

  useEffect(() => {
    if (focusedTimerId !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [focusedTimerId]);

  const addTimer = () => {
    setTimers((previous) => {
      const nextId =
        previous.length > 0
          ? Math.max(...previous.map((timer) => timer.id)) + 1
          : 1;

      return [
        {
          id: nextId,
          label: `Timer ${nextId}`,
          isRunning: false,
          elapsedMs: 0,
          lastUpdateTime: Date.now(),
        },
        ...previous,
      ];
    });
  };

  const removeTimer = (id: number) => {
    setTimers((previous) => {
      if (previous.length <= 1) {
        return previous;
      }

      return previous.filter((timer) => timer.id !== id);
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
    setTimers((previous) =>
      previous.map((timer) =>
        timer.id === id
          ? {
              ...timer,
              isRunning: false,
              elapsedMs: 0,
            }
          : timer
      )
    );
  };

  const toggleFocus = async (id: number, isZen: boolean) => {
    const isAlreadyFocused = focusedTimerId === id;
    const isFullscreen = !!document.fullscreenElement;

    if (isAlreadyFocused) {
      if (isFullscreen) {
        // We are in Zen mode. Just exit fullscreen.
        // The fullscreenchange handler will decide whether to stay focused or not
        // based on returnToMode.
        try {
          await document.exitFullscreen();
        } catch (e) {
          // Ignore fullscreen errors
        }
        return;
      }

      if (isZen) {
        // Upgrade from Focus -> Zen
        setReturnToMode("focus");
        try {
          await document.documentElement.requestFullscreen();
        } catch (e) {
          // Ignore fullscreen errors
        }
        return;
      }

      // Exit Focus Mode (Browser) -> Multi
      setFocusedTimerId(null);
    } else {
      setFocusedTimerId(id);
      if (isZen) {
        // Multi -> Zen
        setReturnToMode("multi");
        try {
          await document.documentElement.requestFullscreen();
        } catch (e) {
          // Ignore fullscreen errors
        }
      }
    }
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

      return updated;
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggedId(null);
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-chrono-bg-page text-foreground font-sans selection:bg-muted overflow-y-auto transition-opacity duration-500 ${
        hasHydrated ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={[
          "fixed top-0 left-0 right-0 p-6 flex justify-center sm:justify-between items-center z-40 transition-opacity duration-500",
          focusedTimerId !== null ? "opacity-0 pointer-events-none" : "opacity-100",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="relative flex items-center gap-3">
          <span className="text-lg font-light tracking-widest text-foreground uppercase cursor-default select-none">
            Stopwatch
          </span>

          <GlobalMenu
            theme={theme}
            onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          />
        </div>
      </div>

      <div
        className={[
          "min-h-screen flex flex-col items-center p-4 transition-all duration-500 gap-8",
          timers.length >= 1 ? "pt-24 pb-24" : "justify-center",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {timers.map((timer) => (
          <TimerCard
            key={timer.id}
            timer={timer}
            totalTimers={timers.length}
            isBeingDragged={draggedId === timer.id}
            isFocused={focusedTimerId === timer.id}
            isZen={isFullscreen}
            focusScale={focusScale}
            onScaleChange={setFocusScale}
            onToggleFocus={(isZen) => toggleFocus(timer.id, isZen)}
            onToggle={() => toggleTimer(timer.id)}
            onReset={() => resetTimer(timer.id)}
            onDelete={() => removeTimer(timer.id)}
            onUpdateLabel={(label) => updateLabel(timer.id, label)}
            onDragStart={(event) => handleDragStart(event, timer.id)}
            onDragOver={(event) => handleDragOver(event, timer.id)}
            onDrop={handleDrop}
          />
        ))}
        <footer className="fixed bottom-2 left-0 right-0 text-center text-xs text-muted-foreground/30 transition-colors hover:text-muted-foreground/80 z-30">
          &copy;{" "}
          <a
            href="https://www.linkedin.com/in/bappygolder/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-all"
          >
            Bappy Golder
          </a>{" "}
          | 2025
        </footer>
      </div>

      {focusedTimerId === null && (
        <button
          onClick={addTimer}
          className="fixed bottom-8 right-8 p-4 rounded-full bg-background/50 backdrop-blur-sm border border-border text-muted-foreground hover:text-background hover:border-foreground hover:bg-foreground hover:scale-105 transition-all duration-500 shadow-sm z-40 group"
        >
          <Plus size={24} className="transition-transform duration-500" />
          <span className="absolute bottom-full mb-3 right-0 px-3 py-1.5 bg-card/90 backdrop-blur border border-border/50 rounded-lg text-xs font-medium text-foreground shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap">
            Add another timer
          </span>
        </button>
      )}

    </div>
  );
}
