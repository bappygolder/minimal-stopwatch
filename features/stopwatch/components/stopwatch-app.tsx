'use client';

import { useEffect, useMemo, useRef, useState, DragEvent } from "react";
import { Plus } from "lucide-react";
import type { Timer } from "@/features/stopwatch/types";
import TimerCard from "@/features/stopwatch/components/timer-card";

const STORAGE_KEY = "chrono-minimal-timers-v1";

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
  const [isLogoDescriptionOpen, setIsLogoDescriptionOpen] = useState(false);

  const hasRunningTimer = useMemo(
    () => timers.some((timer) => timer.isRunning),
    [timers]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHasHydrated(true);
        return;
      }

      const parsed = JSON.parse(raw) as unknown;

      if (!Array.isArray(parsed)) {
        setHasHydrated(true);
        return;
      }

      const next = parsed.map((item) => {
        const candidate = item as Partial<Timer>;
        const isRunning = Boolean(candidate.isRunning);
        let elapsedMs = typeof candidate.elapsedMs === "number" ? candidate.elapsedMs : 0;
        let lastUpdateTime = candidate.lastUpdateTime;

        if (isRunning && lastUpdateTime) {
          const now = Date.now();
          const drift = now - lastUpdateTime;
          elapsedMs += drift;
          lastUpdateTime = now;
        }

        return {
          id: typeof candidate.id === "number" ? candidate.id : Date.now(),
          label: typeof candidate.label === "string" ? candidate.label : "Timer",
          isRunning,
          elapsedMs,
          lastUpdateTime,
        } satisfies Timer;
      });

      if (next.length === 0) {
        setTimers(DEFAULT_TIMERS);
      } else {
        setTimers(next);
      }
    } catch {
      setTimers(DEFAULT_TIMERS);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") {
      return;
    }

    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
      } catch {
        // Ignore write errors (e.g. storage quota)
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [timers, hasHydrated]);

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
            ? { ...timer, elapsedMs: timer.elapsedMs + delta, lastUpdateTime: Date.now() }
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFocusedTimerId(null);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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

  const toggleFocus = async (id: number) => {
    const isEntering = focusedTimerId !== id;

    if (isEntering) {
      setFocusedTimerId(id);
      try {
        await document.documentElement.requestFullscreen();
      } catch (e) {
        // Ignore fullscreen errors
      }
    } else {
      setFocusedTimerId(null);
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
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
      className="min-h-screen bg-chrono-bg-page text-foreground font-sans selection:bg-muted overflow-y-auto"
    >
      <div
        className={[
          "fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-40 transition-opacity duration-500",
          focusedTimerId !== null ? "opacity-0 pointer-events-none" : "opacity-100",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="relative group">
          <button
            onClick={() => setIsLogoDescriptionOpen(!isLogoDescriptionOpen)}
            className="text-xl font-bold text-foreground tracking-tighter uppercase border-2 border-foreground px-2 py-1 hover:bg-foreground hover:text-background transition-all duration-300"
          >
            M. Timer
          </button>
          <div
            className={`absolute top-full left-0 mt-2 text-[10px] font-medium text-chrono-fg-muted tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-300 ${
              isLogoDescriptionOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none"
            }`}
          >
            Minimal Timer
          </div>
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
            onToggleFocus={() => toggleFocus(timer.id)}
            onToggle={() => toggleTimer(timer.id)}
            onReset={() => resetTimer(timer.id)}
            onDelete={() => removeTimer(timer.id)}
            onUpdateLabel={(label) => updateLabel(timer.id, label)}
            onDragStart={(event) => handleDragStart(event, timer.id)}
            onDragOver={(event) => handleDragOver(event, timer.id)}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {focusedTimerId === null && (
        <button
          onClick={addTimer}
          className="fixed bottom-8 right-8 p-4 rounded-full bg-foreground text-background hover:scale-110 transition-all shadow-2xl z-40"
          title="Add new timer"
        >
          <Plus size={32} />
        </button>
      )}

      <div
        className={[
          "fixed bottom-4 left-0 right-0 text-center text-chrono-fg-muted text-sm pointer-events-none transition-opacity duration-500",
          focusedTimerId !== null ? "opacity-0" : "opacity-100",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        Click time to start or stop. Drag handle to reorder.
      </div>
    </div>
  );
}
