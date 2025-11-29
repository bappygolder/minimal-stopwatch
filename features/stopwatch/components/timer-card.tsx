import { useState, useEffect, useRef, MouseEvent, DragEvent } from "react";
import type { Timer } from "@/features/stopwatch/types";
import {
  Play,
  Pause,
  Square,
  Maximize2,
  Minimize2,
  Trash2,
  GripVertical,
  Scan,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";

type TimerCardProps = {
  timer: Timer;
  totalTimers: number;
  isBeingDragged: boolean;
  isFocused: boolean;
  isZen: boolean;
  focusScale: number;
  onScaleChange: (scale: number) => void;
  onToggleFocus: (isZen: boolean) => void;
  onToggle: () => void;
  onReset: () => void;
  onDelete: () => void;
  onUpdateLabel: (label: string) => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onInteract?: () => void;
  isHighlighted?: boolean;
  shouldAutoFocus?: boolean;
  onCommit?: () => void;
};

export default function TimerCard(props: TimerCardProps) {
  const {
    timer,
    totalTimers,
    isBeingDragged,
    isFocused,
    isZen,
    isHighlighted,
    shouldAutoFocus,
    focusScale,
    onScaleChange,
    onToggleFocus,
    onToggle,
    onReset,
    onDelete,
    onUpdateLabel,
    onDragStart,
    onDragOver,
    onDrop,
    onInteract,
    onCommit,
  } = props;

  const [showControls, setShowControls] = useState(true);
  const [showEscHint, setShowEscHint] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const controlsVisible = showControls || (totalTimers === 1 && !isFocused && timer.elapsedMs === 0);

  useEffect(() => {
    if (shouldAutoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select default text for easy overwriting
    }
  }, [shouldAutoFocus]);

  useEffect(() => {
    if (isFocused && !isZen) {
      setShowEscHint(true);
      const timer = setTimeout(() => setShowEscHint(false), 4000);
      return () => clearTimeout(timer);
    } else {
      setShowEscHint(false);
    }
  }, [isFocused, isZen]);

  const handleInteract = () => {
    if (onInteract) onInteract();
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const handleBlur = () => {
    if (!timer.label.trim()) {
      onUpdateLabel(`Timer ${timer.id}`);
    }
    onCommit?.();
  };

  const handleKeyDownInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(false);
  };

  useEffect(() => {
    // Initial timeout to hide controls
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handleToggleFocus = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleFocus(event.shiftKey);
  };

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete();
  };

  const handleZoomIn = (e: MouseEvent) => {
    e.stopPropagation();
    onScaleChange(Math.min(3, focusScale + 0.1));
  };

  const handleZoomOut = (e: MouseEvent) => {
    e.stopPropagation();
    onScaleChange(Math.max(0.5, focusScale - 0.1));
  };

  const handleZoomReset = (e: MouseEvent) => {
    e.stopPropagation();
    onScaleChange(1);
  };

  const hours = Math.floor(timer.elapsedMs / 3600000);
  const minutes = Math.floor((timer.elapsedMs % 3600000) / 60000);
  const seconds = Math.floor((timer.elapsedMs % 60000) / 1000);
  const milliseconds = Math.floor((timer.elapsedMs % 1000) / 10);

  const showHours = hours > 0;

  const sizeClasses = isFocused
    ? showHours
      ? "text-[min(calc(13vw*var(--timer-scale)),35vh)] sm:text-[min(calc(9rem*var(--timer-scale)),35vh)] font-medium"
      : "text-[min(calc(18vw*var(--timer-scale)),45vh)] sm:text-[min(calc(12rem*var(--timer-scale)),45vh)] font-medium"
    : showHours
    ? "text-[9vw] sm:text-[6rem] font-medium"
    : "text-[12vw] sm:text-[8rem] font-medium";

  const subSizeClasses = isFocused
    ? showHours
      ? "text-[min(calc(7vw*var(--timer-scale)),20vh)] sm:text-[min(calc(5rem*var(--timer-scale)),20vh)] text-chrono-fg-muted mx-[calc(0.25rem*var(--timer-scale))]"
      : "text-[min(calc(9vw*var(--timer-scale)),25vh)] sm:text-[min(calc(6rem*var(--timer-scale)),25vh)] text-chrono-fg-muted mx-[calc(0.25rem*var(--timer-scale))]"
    : showHours
    ? "text-[5vw] sm:text-[3rem] text-chrono-fg-muted mx-1"
    : "text-[6vw] sm:text-[4rem] text-chrono-fg-muted mx-1";

  const msSizeClasses = isFocused
    ? showHours
      ? "text-[min(calc(5vw*var(--timer-scale)),12vh)] sm:text-[min(calc(3rem*var(--timer-scale)),12vh)] font-light ml-[calc(0.5rem*var(--timer-scale))] w-[min(calc(5vw*var(--timer-scale)),15vh)] sm:w-[min(calc(7rem*var(--timer-scale)),20vh)] text-left"
      : "text-[min(calc(6vw*var(--timer-scale)),15vh)] sm:text-[min(calc(4rem*var(--timer-scale)),15vh)] font-light ml-[calc(0.5rem*var(--timer-scale))] w-[min(calc(7vw*var(--timer-scale)),18vh)] sm:w-[min(calc(9rem*var(--timer-scale)),25vh)] text-left"
    : showHours
    ? "text-[3vw] sm:text-[2.5rem] font-light ml-2 w-[4vw] sm:w-[5rem] text-left"
    : "text-[4vw] sm:text-[3rem] font-light ml-2 w-[5vw] sm:w-[6rem] text-left";

  const containerClasses = isFocused
    ? "fixed inset-0 z-50 bg-chrono-bg-page flex flex-col items-center justify-center space-y-12 cursor-pointer"
    : [
        "relative group flex flex-col items-center justify-center pt-20 pb-12 px-8 rounded-2xl border w-full max-w-4xl mx-auto transition-all duration-300 cursor-pointer",
        timer.isRunning
          ? "bg-chrono-bg-card/80 border-chrono-border-subtle shadow-chrono-glow"
          : "bg-chrono-bg-card/40 border-chrono-border-subtle",
        isBeingDragged ? "opacity-50 border-chrono-accent border-dashed" : "",
        isHighlighted ? "ring-2 ring-chrono-accent shadow-chrono-glow scale-[1.01]" : "",
      ]
        .filter(Boolean)
        .join(" ");

  return (
    <div
      className={containerClasses}
      draggable={!isFocused}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseMove={handleInteract}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleInteract}
      onClick={() => {
        handleInteract();
        onToggle();
      }}
    >
      <div
        className={[
          "flex justify-between items-center w-full absolute top-0 pt-6 px-6 transition-opacity duration-500",
          isFocused ? "top-6" : "",
          "opacity-100",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {!isFocused && (
          <div
            className="transition-all duration-300 flex-1 min-w-0 mr-4"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="text"
              value={timer.label}
              onChange={(event) => onUpdateLabel(event.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDownInput}
              placeholder="Type timer name..."
              className="bg-transparent text-left outline-none border-b border-transparent focus:border-chrono-accent/50 transition-all text-chrono-fg-muted focus:text-chrono-accent text-lg placeholder:text-muted-foreground/50"
            />
          </div>
        )}

        <div
          className={[
            "flex gap-2 items-center ml-auto flex-shrink-0 transition-opacity duration-500",
            isFocused ? "absolute top-6 right-6" : "",
            !controlsVisible ? "opacity-0 pointer-events-none" : "opacity-100",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {!isFocused && (
            <>
              {totalTimers > 1 && (
                <div
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-grab"
                  title="Drag to reorder"
                >
                  <GripVertical size={20} />
                </div>
              )}

              {totalTimers > 1 && (
                <button
                  onClick={handleDelete}
                  className="p-1 rounded-full text-muted-foreground hover:text-chrono-danger transition-colors"
                  title="Delete timer"
                >
                  <Trash2 size={20} />
                </button>
              )}

              <div className="relative group/tooltip">
                <button
                  onClick={handleToggleFocus}
                  className="p-1 rounded-full transition-colors text-muted-foreground hover:text-chrono-accent"
                >
                  <Scan size={20} />
                </button>
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-2 bg-card/90 backdrop-blur border border-border/50 rounded-lg shadow-xl text-xs text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-max">
                   <span className="font-medium">Zen Mode: <span className="opacity-70 font-normal">Shift + Click</span></span>
                </div>
              </div>
            </>
          )}

          {isFocused && (
            <>
              {!isZen && showEscHint && (
                <div className="absolute top-full right-0 mt-4 text-xs text-muted-foreground/70 whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-500 pointer-events-none">
                  Press <span className="font-medium text-foreground/80">Esc</span> to exit
                </div>
              )}

              {!isZen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFocus(true);
                  }}
                  className="p-1 rounded-full text-muted-foreground hover:text-chrono-accent transition-colors"
                  title="Enter Zen Mode"
                >
                  <Scan size={20} />
                </button>
              )}

              <button
                onClick={handleToggleFocus}
                className="p-1 rounded-full text-chrono-accent text-2xl transition-colors hover:text-chrono-accent/80"
                title={isZen ? "Exit Zen Mode" : "Return to Normal"}
              >
                <Minimize2 size={24} />
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className="flex flex-col items-center transition-all duration-200 origin-center"
        style={isFocused ? ({ "--timer-scale": focusScale } as React.CSSProperties) : undefined}
        onClick={(e) => isFocused && e.stopPropagation()}
      >
        {isFocused && (
          <input
            ref={inputRef}
            type="text"
            value={timer.label}
            onChange={(event) => onUpdateLabel(event.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={handleBlur}
            onKeyDown={handleKeyDownInput}
            placeholder="Type timer name..."
            className="bg-transparent text-center outline-none border-b border-transparent focus:border-chrono-accent/50 transition-all text-muted-foreground font-normal max-w-full text-[calc(1.5rem*var(--timer-scale))] mb-[calc(0.5rem*var(--timer-scale))]"
          />
        )}

        <div
          className="transition-transform duration-200 active:scale-95"
        >
          <div className="flex items-baseline font-mono tracking-tighter leading-none select-none transition-all duration-500">
          {showHours && (
            <>
              <span className={sizeClasses + " text-foreground"}>
                {hours.toString().padStart(2, "0")}
              </span>
              <span className={subSizeClasses}>:</span>
            </>
          )}
          <span className={sizeClasses + " text-foreground"}>
            {minutes.toString().padStart(2, "0")}
          </span>
          <span className={subSizeClasses}>:</span>
          <span className={sizeClasses + " text-foreground"}>
            {seconds.toString().padStart(2, "0")}
          </span>
          <span className={msSizeClasses}>
            .{milliseconds.toString().padStart(2, "0")}
          </span>
          </div>
        </div>
      </div>

      {isFocused && (
        <div
          className={[
            "fixed bottom-8 right-8 flex flex-col gap-2 z-50 transition-opacity duration-500",
            !controlsVisible ? "opacity-0 pointer-events-none" : "opacity-100",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative group/tooltip">
            <button
              onClick={handleZoomIn}
              className="p-3 rounded-full bg-card/10 hover:bg-card/30 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors border border-white/5"
            >
              <Plus size={20} />
            </button>
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-2 bg-card/90 backdrop-blur border border-border/50 rounded-lg shadow-xl text-xs text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-max">
              <span className="font-medium">Zoom In</span>
            </div>
          </div>

          <div className="relative group/tooltip">
            <button
              onClick={handleZoomOut}
              className="p-3 rounded-full bg-card/10 hover:bg-card/30 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors border border-white/5"
            >
              <Minus size={20} />
            </button>
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-2 bg-card/90 backdrop-blur border border-border/50 rounded-lg shadow-xl text-xs text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-max">
              <span className="font-medium">Zoom Out</span>
            </div>
          </div>

          <div className="relative group/tooltip">
            <button
              onClick={handleZoomReset}
              className="p-3 rounded-full bg-card/10 hover:bg-card/30 backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors border border-white/5"
            >
              <RotateCcw size={16} />
            </button>
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-2 bg-card/90 backdrop-blur border border-border/50 rounded-lg shadow-xl text-xs text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-max">
              <span className="font-medium">Reset Zoom</span>
            </div>
          </div>
        </div>
      )}

      <div
        className={[
          "text-[10px] text-muted-foreground/30 font-medium uppercase tracking-widest mt-4 mb-2 select-none transition-all duration-500",
          !controlsVisible ? "opacity-0 h-0 overflow-hidden mt-0 mb-0" : "opacity-100 h-auto",
        ].join(" ")}
      >
        Press Space to stop or start
      </div>

      <div
        className={[
          "flex gap-4 transition-all duration-500 justify-center",
          isFocused ? "mt-[calc(3rem*var(--timer-scale))] scale-150" : "mt-6",
          !controlsVisible ? "opacity-0 pointer-events-none" : "opacity-100",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onReset}
          className="p-4 rounded-full bg-card text-chrono-danger hover:bg-chrono-danger/20 hover:text-chrono-danger transition-all duration-200"
          title="Stop and reset"
        >
          <Square size={24} fill="currentColor" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (shouldAutoFocus) return;
            onToggle();
          }}
          className={[
            "p-4 rounded-full transition-all duration-200",
            timer.isRunning
              ? "bg-chrono-warning/10 text-chrono-warning hover:bg-chrono-warning/20"
              : "bg-chrono-success/10 text-chrono-success hover:bg-chrono-success/20",
          ].join(" ")}
          title={timer.isRunning ? "Pause" : "Start"}
        >
          {timer.isRunning ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" />
          )}
        </button>
      </div>
    </div>
  );
}
