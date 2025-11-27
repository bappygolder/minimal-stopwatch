'use client';

import { useEffect, useMemo, useRef, useState, DragEvent } from "react";
import { Eye, EyeOff, Maximize2, Minimize2, Plus } from "lucide-react";
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

  const [isZenMode, setIsZenMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

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
        return {
          id: typeof candidate.id === "number" ? candidate.id : Date.now(),
          label: typeof candidate.label === "string" ? candidate.label : "Timer",
          isRunning: Boolean(candidate.isRunning),
          elapsedMs: typeof candidate.elapsedMs === "number" ? candidate.elapsedMs : 0,
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

      return [
        ...previous,
        {
          id: nextId,
          label: `Timer ${nextId}`,
          isRunning: false,
          elapsedMs: 0,
        },
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

  const toggleZenMode = () => {
    setIsZenMode((value) => !value);
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

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-chrono-bg-page text-foreground font-sans selection:bg-muted overflow-y-auto"
    >
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

        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md p-1.5 rounded-full border border-border shadow-2xl ml-auto">
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
            isZenMode={isZenMode}
            isBeingDragged={draggedId === timer.id}
            onToggle={() => toggleTimer(timer.id)}
            onReset={() => resetTimer(timer.id)}
            onDelete={() => removeTimer(timer.id)}
            onUpdateLabel={(label) => updateLabel(timer.id, label)}
            onDragStart={(event) => handleDragStart(event, timer.id)}
            onDragOver={(event) => handleDragOver(event, timer.id)}
            onDrop={handleDrop}
          />
        ))}

        <button
          onClick={addTimer}
          className="group flex flex-col items-center gap-2 text-chrono-fg-muted hover:text-chrono-accent transition-colors py-4"
        >
          <div className="p-3 rounded-full border border-chrono-border-subtle group-hover:border-chrono-accent/60 bg-chrono-bg-card/60">
            <Plus size={24} />
          </div>
          <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Add new timer
          </span>
        </button>
      </div>

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
  );
}
