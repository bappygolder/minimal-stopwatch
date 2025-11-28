'use client';

import { useEffect, useMemo, useRef, useState, DragEvent } from "react";
import { Plus, Info, Menu } from "lucide-react";
import type { Timer } from "@/features/stopwatch/types";
import TimerCard from "@/features/stopwatch/components/timer-card";

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
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [activeTimerId, setActiveTimerId] = useState<number | null>(null);
  const [highlightedTimerId, setHighlightedTimerId] = useState<number | null>(null);
  const previousModeRef = useRef<'focus' | 'multi'>('multi');
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timersRef = useRef(timers);

  // Keep ref synced with state for event listeners
  timersRef.current = timers;

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
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setIsInfoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsInfoOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsInfoOpen(false);
    }, 2000);
  };

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
      const rawScale = window.localStorage.getItem(STORAGE_KEY_SCALE);

      if (rawScale) {
        const parsedScale = parseFloat(rawScale);
        if (!isNaN(parsedScale) && parsedScale >= 0.5 && parsedScale <= 3) {
          setFocusScale(parsedScale);
        }
      }

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
        window.localStorage.setItem(STORAGE_KEY_SCALE, String(focusScale));
      } catch {
        // Ignore write errors (e.g. storage quota)
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [timers, hasHydrated, focusScale]);

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
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        if (previousModeRef.current === 'multi') {
          setFocusedTimerId(null);
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.key === "Escape" && focusedTimerId !== null && !document.fullscreenElement) {
        setFocusedTimerId(null);
        return;
      }

      // Detect shortcuts
      const key = event.key.toLowerCase();
      if (key !== 'f' && key !== 'z' && key !== 'n' && event.key !== ' ') return;

      const targetId = activeTimerId ?? timersRef.current[0]?.id;
      // For 'n', we don't need a targetId necessarily, but we check input focus above.
      
      if (key === 'n') {
        addTimer();
        return;
      }

      if (!targetId) return;

      if (event.key === ' ') {
        event.preventDefault(); // Prevent scrolling
        toggleTimer(targetId);
        setActiveTimerId(targetId);
        setHighlightedTimerId(targetId);
        
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = setTimeout(() => setHighlightedTimerId(null), 200);
        return;
      }

      if (key === 'z') {
        // Zen Mode (Z key)
        toggleFocus(targetId, true);
        return;
      }

      if (key === 'f') {
        // Focus Mode (F key)
        toggleFocus(targetId, false);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedTimerId, activeTimerId, timers]); // timers dependency triggers update on list change

  useEffect(() => {
    if (focusedTimerId !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [focusedTimerId]);

  const addTimer = () => {
    const currentTimers = timersRef.current;
    const nextId =
      currentTimers.length > 0
        ? Math.max(...currentTimers.map((timer) => timer.id)) + 1
        : 1;

    const newTimer: Timer = {
      id: nextId,
      label: `Timer ${nextId}`,
      isRunning: false,
      elapsedMs: 0,
      lastUpdateTime: Date.now(),
    };

    setTimers((previous) => [newTimer, ...previous]);
    setActiveTimerId(nextId);
    setHighlightedTimerId(nextId);
    
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(() => setHighlightedTimerId(null), 200);
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
      if (isZen && !isFullscreen) {
        previousModeRef.current = 'focus';
        try {
          await document.documentElement.requestFullscreen();
        } catch (e) {
          // Ignore fullscreen errors
        }
        return;
      }

      if (isFullscreen) {
        try {
          await document.exitFullscreen();
        } catch (e) {
          // Ignore fullscreen errors
        }
      } else {
        setFocusedTimerId(null);
      }
    } else {
      setFocusedTimerId(id);
      if (isZen) {
        previousModeRef.current = 'multi';
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
          "fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-40 transition-opacity duration-500",
          focusedTimerId !== null ? "opacity-0 pointer-events-none" : "opacity-100",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="relative flex items-center gap-3">
          <span className="text-lg font-light tracking-widest text-foreground uppercase cursor-default select-none">
            Stopwatch
          </span>

          <div
            ref={infoRef}
            className="relative group/info"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className="p-1.5 rounded-full text-muted-foreground/70 hover:text-foreground transition-colors"
              aria-label="App Info"
            >
              <Info size={16} strokeWidth={2} />
            </button>

            <div
              className={`
                absolute top-full mt-4 sm:mt-2
                left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0
                w-max max-w-[90vw] sm:w-[420px] p-6 rounded-2xl
                bg-card/90 backdrop-blur-xl border border-border/40 shadow-2xl
                text-xs leading-relaxed text-muted-foreground
                text-left
                transition-all duration-500 ease-out
                origin-top sm:origin-top-left z-50
                ${
                  isInfoOpen
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
                }
              `}
            >
              <div className="flex justify-between gap-8">
                <div className="flex flex-col gap-4 items-start">
                  <div className="space-y-0.5">
                    <span className="font-medium text-foreground block text-sm">
                      Minimal Stopwatch
                    </span>
                    <span className="block text-[10px] opacity-70">
                      by{" "}
                      <a
                        href="https://olab.com.au"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors underline decoration-border underline-offset-2"
                      >
                        oLab
                      </a>
                      {" "}&bull;{" "}
                      Maintained by{" "}
                      <a
                        href="https://www.linkedin.com/in/bappygolder/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors underline decoration-border underline-offset-2"
                      >
                        Bappy Golder
                      </a>
                    </span>
                  </div>
                  
                  <p className="text-[10px] opacity-80 leading-normal">
                    Click time to start or stop.
                    <br />
                    Drag handle to reorder.
                  </p>

                  <div className="flex items-center gap-4 text-[10px] tracking-wider uppercase opacity-60 pt-1">
                    <a
                      href="https://github.com/bappygolder/minimal-stopwatch"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      GitHub
                    </a>
                    <span>v1.0</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 items-end text-right pl-6 border-l border-border/20 min-w-max">
                  <div className="font-medium text-foreground/80 text-[10px]">Shortcuts</div>
                  <div className="grid grid-cols-[auto_auto] gap-x-3 gap-y-2 items-center text-[10px]">
                    <span>New Timer</span>
                    <kbd className="font-mono bg-foreground/10 rounded px-1.5 py-0.5 text-[9px] min-w-[20px] text-center flex justify-center">n</kbd>

                    <span>Start/Stop</span>
                    <kbd className="font-mono bg-foreground/10 rounded px-1.5 py-0.5 text-[9px] min-w-[20px] text-center flex justify-center">Space</kbd>

                    <span>Focus</span>
                    <kbd className="font-mono bg-foreground/10 rounded px-1.5 py-0.5 text-[9px] min-w-[20px] text-center flex justify-center">f</kbd>
                    
                    <span>Zen</span>
                    <kbd className="font-mono bg-foreground/10 rounded px-1.5 py-0.5 text-[9px] min-w-[20px] text-center flex justify-center">z</kbd>
                    
                    <span>Exit</span>
                    <kbd className="font-mono bg-foreground/10 rounded px-1.5 py-0.5 text-[9px] min-w-[20px] text-center flex justify-center">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-foreground/5"
          aria-label="Menu"
        >
          <Menu size={20} strokeWidth={2} />
        </button>
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
            isHighlighted={highlightedTimerId === timer.id}
            focusScale={focusScale}
            onScaleChange={setFocusScale}
            onToggleFocus={(isZen) => toggleFocus(timer.id, isZen)}
            onToggle={() => toggleTimer(timer.id)}
            onReset={() => resetTimer(timer.id)}
            onDelete={() => removeTimer(timer.id)}
            onInteract={() => setActiveTimerId(timer.id)}
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
