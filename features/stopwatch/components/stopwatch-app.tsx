'use client';

import { useEffect, useMemo, useRef, useState, DragEvent } from "react";
import { Plus, Menu } from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTimerId, setActiveTimerId] = useState<number | null>(null);
  const [highlightedTimerId, setHighlightedTimerId] = useState<number | null>(null);
  const [createdTimerId, setCreatedTimerId] = useState<number | null>(null);
  const [titleFocusId, setTitleFocusId] = useState<number | null>(null);
  const [spaceHintSeen, setSpaceHintSeen] = useState<number[]>([]);
  const previousModeRef = useRef<'focus' | 'multi'>('multi');
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timersRef = useRef(timers);

  // Keep ref synced with state for event listeners
  timersRef.current = timers;

  const markSpaceHintSeen = (id: number) => {
    setSpaceHintSeen((previous) => (previous.includes(id) ? previous : [...previous, id]));
  };

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
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      if (
        key !== 'f' &&
        key !== 'z' &&
        key !== 'n' &&
        key !== 'd' &&
        key !== 'r' &&
        key !== 't' &&
        key !== 'm' &&
        key !== 'arrowup' &&
        key !== 'arrowdown' &&
        event.key !== ' '
      ) {
        return;
      }

      const targetId = activeTimerId ?? timersRef.current[0]?.id;
      // For 'n' and 'm', we don't need a targetId necessarily, but we check input focus above.
      
      if (event.key === 'n') {
        event.preventDefault();
        addTimer();
        return;
      }

      if (key === 'm') {
        event.preventDefault();
        setIsMenuOpen((previous) => !previous);
        return;
      }

      // ...
      if (key === 'arrowup' || key === 'arrowdown') {
        event.preventDefault();

        if (timersRef.current.length === 0) return;

        // If no active timer yet, just select the first one
        if (activeTimerId === null) {
          const firstId = timersRef.current[0].id;
          setActiveTimerId(firstId);
          setHighlightedTimerId(firstId);
          if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
          highlightTimeoutRef.current = setTimeout(() => setHighlightedTimerId(null), 2500);
          return;
        }

        const currentIndex = timersRef.current.findIndex((t) => t.id === activeTimerId);
        if (currentIndex === -1) return;

        // Shift + Arrow: reorder the active timer up/down
        if (event.shiftKey) {
          const isMovingUp = key === 'arrowup';
          const targetIndex = isMovingUp
            ? Math.max(0, currentIndex - 1)
            : Math.min(timersRef.current.length - 1, currentIndex + 1);

          // No-op if already at boundary
          if (targetIndex === currentIndex) return;

          setTimers((previous) => {
            const index = previous.findIndex((t) => t.id === activeTimerId);
            if (index === -1) return previous;

            const next = [...previous];
            const [moved] = next.splice(index, 1);
            next.splice(targetIndex, 0, moved);
            return next;
          });

          // Keep the same timer active, and briefly highlight it
          setActiveTimerId(activeTimerId);
          setHighlightedTimerId(activeTimerId);

          if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
          highlightTimeoutRef.current = setTimeout(() => setHighlightedTimerId(null), 2500);

          // After reordering, scroll the active timer into view
          requestAnimationFrame(() => {
            const element = document.querySelector<HTMLElement>(
              `[data-timer-id="${activeTimerId}"]`
            );
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });

          return;
        }

        // Plain Arrow: move focus between timers without reordering
        let newIndex = currentIndex;
        if (key === 'arrowup') {
          newIndex = Math.max(0, currentIndex - 1);
        } else {
          newIndex = Math.min(timersRef.current.length - 1, currentIndex + 1);
        }

        const newId = timersRef.current[newIndex].id;
        setActiveTimerId(newId);
        setHighlightedTimerId(newId);

        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = setTimeout(() => setHighlightedTimerId(null), 2500);
        return;
      }

      if (key === 'd') {
        if (!targetId) return;
        event.preventDefault();
        removeTimer(targetId);
        return;
      }

      if (key === 'r') {
        if (!targetId) return;
        event.preventDefault();
        resetTimer(targetId);
        return;
      }

      if (key === 't') {
        if (!targetId) return;
        event.preventDefault();
        setTitleFocusId(targetId);
        return;
      }

      if (!targetId) return;

      if (event.key === ' ') {
        event.preventDefault(); // Prevent scrolling
        toggleTimer(targetId);
        setActiveTimerId(targetId);
        setHighlightedTimerId(targetId);
        markSpaceHintSeen(targetId);

        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = setTimeout(() => setHighlightedTimerId(null), 2500);
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

  const handleCommit = (id: number) => {
    if (id === createdTimerId) {
      setCreatedTimerId(null);
      setTimers((previous) =>
        previous.map((timer) =>
          timer.id === id ? { ...timer, isRunning: true, lastUpdateTime: Date.now() } : timer
        )
      );
    }
  };

  const addTimer = () => {
    const currentTimers = timersRef.current;
    const nextId =
      currentTimers.length > 0
        ? Math.max(...currentTimers.map((timer) => timer.id)) + 1
        : 1;

    const newTimer: Timer = {
      id: nextId,
      label: "", // Start empty to show placeholder
      isRunning: false,
      elapsedMs: 0,
      lastUpdateTime: Date.now(),
    };

    setTimers((previous) => [newTimer, ...previous]);
    setActiveTimerId(nextId);
    setHighlightedTimerId(nextId);
    setCreatedTimerId(nextId);

    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    // Keep new timer highlight visible briefly, then let it fade via CSS transitions
    highlightTimeoutRef.current = setTimeout(() => setHighlightedTimerId(null), 2500);
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
      className={`min-h-screen bg-chrono-bg-page text-foreground font-sans selection:bg-muted overflow-y-auto flex flex-col transition-opacity duration-500 ${
        hasHydrated ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={[
          "sticky top-0 left-0 right-0 p-6 flex justify-between items-center z-40 transition-opacity duration-500 bg-chrono-bg-page/95 border-b border-chrono-border-subtle backdrop-blur-sm",
          focusedTimerId !== null && !isMenuOpen
            ? "opacity-0 pointer-events-none"
            : "opacity-100",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="relative flex items-center gap-3">
          <span className="text-lg font-extralight tracking-widest text-foreground uppercase cursor-default select-none">
            Minimal StopWatch
          </span>
        </div>

        <div ref={menuRef} className="relative -mr-2">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-foreground/5 ${isMenuOpen ? 'text-foreground bg-foreground/5' : ''}`}
            aria-label="Menu"
          >
            <Menu size={20} strokeWidth={2} />
          </button>

          <div
            className={`
              absolute right-0 top-full mt-2 w-64 p-5 rounded-2xl
              bg-card border border-border/60 shadow-2xl
              text-xs leading-relaxed text-muted-foreground
              transition-all duration-300 ease-out origin-top-right z-50
              ${isMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
            `}
          >
            <div className="flex flex-col gap-5">
              {/* Header */}
              <div className="space-y-1">
                <span className="font-medium text-foreground block text-sm">Minimal Stopwatch</span>
                <span className="block text-[10px] opacity-70 leading-relaxed">
                  by <a href="https://olab.com.au" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline decoration-border underline-offset-2">oLab</a>
                  {" "}&bull;{" "}
                  Maintained by <a href="https://www.linkedin.com/in/bappygolder/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline decoration-border underline-offset-2">Bappy Golder</a>
                </span>
              </div>

              {/* Shortcuts */}
              <div className="space-y-3">
                <div className="font-medium text-foreground text-[10px]">Shortcuts</div>
                <div className="grid grid-cols-[1fr_auto] gap-y-2 gap-x-4 items-center text-[10px]">
                  <span>New Timer</span>
                  <kbd className="font-mono bg-foreground text-background rounded px-1.5 py-0.5 text-[9px] min-w-[28px] text-center">N</kbd>

                  <span>Start/Stop</span>
                  <kbd className="font-mono bg-foreground text-background rounded px-1.5 py-0.5 text-[9px] min-w-[28px] text-center">Space</kbd>

                  <span>Focus</span>
                  <kbd className="font-mono bg-foreground text-background rounded px-1.5 py-0.5 text-[9px] min-w-[28px] text-center">F</kbd>
                  
                  <span>Zen</span>
                  <kbd className="font-mono bg-foreground text-background rounded px-1.5 py-0.5 text-[9px] min-w-[28px] text-center">Z</kbd>
                  
                  <span>Move Up</span>
                  <kbd className="font-mono bg-foreground text-background rounded px-1.5 py-0.5 text-[9px] min-w-[28px] text-center">↑</kbd>

                  <span>Move Down</span>
                  <kbd className="font-mono bg-foreground text-background rounded px-1.5 py-0.5 text-[9px] min-w-[28px] text-center">↓</kbd>
                  
                  <span>Delete Timer</span>
                  <kbd className="font-mono bg-foreground text-background rounded px-1.5 py-0.5 text-[9px] min-w-[28px] text-center">D</kbd>
                  
                  <span>Reset</span>
                  <kbd className="font-mono bg-foreground text-background rounded px-1.5 py-0.5 text-[9px] min-w-[28px] text-center">R</kbd>

                  <span>Edit Title</span>
                  <kbd className="font-mono bg-foreground text-background rounded px-1.5 py-0.5 text-[9px] min-w-[28px] text-center">T</kbd>
                  
                  <span>Commit Title</span>
                  <kbd className="font-mono bg-foreground text-background rounded px-1.5 py-0.5 text-[9px] min-w-[28px] text-center">Enter</kbd>
                  
                  <span>Move Selected</span>
                  <kbd className="font-mono bg-foreground text-background rounded px-1.5 py-0.5 text-[9px] min-w-[28px] text-center">Shift + ↑ / Shift + ↓</kbd>
                  
                  <span>Toggle Menu</span>
                  <kbd className="font-mono bg-foreground text-background rounded px-1.5 py-0.5 text-[9px] min-w-[28px] text-center">M</kbd>
                  
                  <span>Exit</span>
                  <kbd className="font-mono bg-foreground text-background rounded px-1.5 py-0.5 text-[9px] min-w-[28px] text-center">Esc</kbd>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/40 w-full" />

              {/* Footer Links */}
              <div className="flex items-center gap-4 text-[10px] tracking-wider uppercase opacity-60">
                <a href="https://github.com/bappygolder/minimal-stopwatch" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
                <span>v1.0</span>
              </div>

              {/* Description */}
              <p className="text-[10px] opacity-80 leading-normal">
                Click time to start or stop.
                <br />
                Drag handle to reorder.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={[
          "flex-1 flex flex-col items-center p-4 transition-all duration-500 gap-8",
          timers.length >= 1 ? "pt-24 pb-12" : "justify-center",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {timers.map((timer) => (
          (() => {
            const hasSeen = spaceHintSeen.includes(timer.id);
            const isOnlyTimer = timers.length === 1;
            const isFresh = timer.elapsedMs === 0 && !timer.isRunning;
            const isSingleRunning = isOnlyTimer && timer.isRunning;
            const isFocusedTimer = focusedTimerId === timer.id;

            const showSpaceHint =
              !hasSeen &&
              ((isOnlyTimer && (isFresh || isSingleRunning)) || isFocusedTimer);

            return (
          <TimerCard
            key={timer.id}
            timer={timer}
            totalTimers={timers.length}
            isBeingDragged={draggedId === timer.id}
            isFocused={focusedTimerId === timer.id}
            isZen={isFullscreen}
            isHighlighted={highlightedTimerId === timer.id}
            shouldAutoFocus={createdTimerId === timer.id}
            requestTitleFocus={titleFocusId === timer.id}
            onTitleFocusHandled={() => setTitleFocusId(null)}
            showSpaceHint={showSpaceHint}
            onCommit={() => handleCommit(timer.id)}
            focusScale={focusScale}
            onScaleChange={setFocusScale}
            onToggleFocus={(isZen) => toggleFocus(timer.id, isZen)}
            onToggle={() => toggleTimer(timer.id)}
            onReset={() => resetTimer(timer.id)}
            onDelete={() => removeTimer(timer.id)}
            onInteract={() => {
              setActiveTimerId(timer.id);
              setHighlightedTimerId(timer.id);
              markSpaceHintSeen(timer.id);

              if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
              highlightTimeoutRef.current = setTimeout(() => setHighlightedTimerId(null), 2500);
            }}
            onUpdateLabel={(label) => updateLabel(timer.id, label)}
            onDragStart={(event) => handleDragStart(event, timer.id)}
            onDragOver={(event) => handleDragOver(event, timer.id)}
            onDrop={handleDrop}
          />
            );
          })()
        ))}
        <footer className="mt-auto pt-8 pb-4 text-center text-xs text-muted-foreground/30 transition-colors hover:text-muted-foreground/80">
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
