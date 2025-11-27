import { useState, useEffect, MouseEvent, DragEvent } from "react";
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
} from "lucide-react";

type TimerCardProps = {
  timer: Timer;
  totalTimers: number;
  isBeingDragged: boolean;
  isFocused: boolean;
  onToggleFocus: () => void;
  onToggle: () => void;
  onReset: () => void;
  onDelete: () => void;
  onUpdateLabel: (label: string) => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
};

export default function TimerCard(props: TimerCardProps) {
  const {
    timer,
    totalTimers,
    isBeingDragged,
    isFocused,
    onToggleFocus,
    onToggle,
    onReset,
    onDelete,
    onUpdateLabel,
    onDragStart,
    onDragOver,
    onDrop,
  } = props;

  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (!isFocused) {
      setShowControls(true);
      return;
    }

    let timeout: NodeJS.Timeout;
    const onMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener("mousemove", onMove);
    timeout = setTimeout(() => setShowControls(false), 3000);

    return () => {
      window.removeEventListener("mousemove", onMove);
      clearTimeout(timeout);
    };
  }, [isFocused]);

  const handleToggleFocus = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleFocus();
  };

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete();
  };

  const minutes = Math.floor(timer.elapsedMs / 60000);
  const seconds = Math.floor((timer.elapsedMs % 60000) / 1000);
  const milliseconds = Math.floor((timer.elapsedMs % 1000) / 10);

  const sizeClasses = isFocused
    ? "text-[18vw] sm:text-[12rem] font-medium"
    : "text-[12vw] sm:text-[8rem] font-medium";

  const subSizeClasses = isFocused
    ? "text-[9vw] sm:text-[6rem] text-chrono-fg-muted mx-1"
    : "text-[6vw] sm:text-[4rem] text-chrono-fg-muted mx-1";

  const msSizeClasses = isFocused
    ? "text-[6vw] sm:text-[4rem] font-light ml-2 w-[7vw] sm:w-[9rem] text-left"
    : "text-[4vw] sm:text-[3rem] font-light ml-2 w-[5vw] sm:w-[6rem] text-left";

  const containerClasses = isFocused
    ? "fixed inset-0 z-50 bg-chrono-bg-page flex flex-col items-center justify-center space-y-12"
    : [
        "relative group flex flex-col items-center justify-center pt-20 pb-12 px-8 rounded-2xl border w-full max-w-4xl mx-auto transition-all duration-300",
        timer.isRunning
          ? "bg-chrono-bg-card/80 border-chrono-border-subtle shadow-chrono-glow"
          : "bg-chrono-bg-card/40 border-chrono-border-subtle",
        isBeingDragged ? "opacity-50 border-chrono-accent border-dashed" : "",
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
    >
      <div
        className={[
          "flex justify-between items-center w-full absolute top-0 pt-6 px-6 transition-opacity duration-500",
          isFocused ? "top-6" : "",
          isFocused && !showControls ? "opacity-0" : "opacity-100",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {!isFocused && (
          <div className="transition-all duration-300">
            <input
              type="text"
              value={timer.label}
              onChange={(event) => onUpdateLabel(event.target.value)}
              placeholder="Timer name"
              className="bg-transparent text-left outline-none border-b border-transparent focus:border-chrono-accent/50 transition-all text-chrono-fg-muted focus:text-chrono-accent text-lg placeholder:text-muted-foreground"
            />
          </div>
        )}

        <div
          className={[
            "flex gap-2 items-center ml-auto",
            isFocused ? "absolute top-6 right-6" : "",
          ].join(" ")}
        >
          {!isFocused && totalTimers > 1 && (
            <div
              className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-grab"
              title="Drag to reorder"
            >
              <GripVertical size={20} />
            </div>
          )}

          {!isFocused && totalTimers > 1 && (
            <button
              onClick={handleDelete}
              className="p-1 rounded-full text-muted-foreground hover:text-chrono-danger transition-colors"
              title="Delete timer"
            >
              <Trash2 size={20} />
            </button>
          )}

          <button
            onClick={handleToggleFocus}
            className={[
              "p-1 rounded-full transition-colors",
              isFocused
                ? "text-chrono-accent text-2xl"
                : "text-muted-foreground hover:text-chrono-accent",
            ]
              .filter(Boolean)
              .join(" ")}
            title={isFocused ? "Exit Focus Mode" : "Enter Focus Mode"}
          >
            {isFocused ? <Minimize2 size={24} /> : <Scan size={20} />}
          </button>
        </div>
      </div>

      {isFocused && (
        <input
          type="text"
          value={timer.label}
          onChange={(event) => onUpdateLabel(event.target.value)}
          placeholder="Timer name"
          className="bg-transparent text-center outline-none border-b border-transparent focus:border-chrono-accent/50 transition-all text-muted-foreground text-2xl font-normal mb-[-2rem] sm:mb-[-4rem] max-w-full"
        />
      )}

      <div
        onClick={onToggle}
        className="cursor-pointer transition-transform duration-200 active:scale-95"
      >
        <div className="flex items-baseline font-mono tracking-tighter leading-none select-none transition-all duration-500">
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

      <div
        className={[
          "flex gap-4 transition-all duration-500 justify-center",
          isFocused ? "mt-12 scale-150" : "mt-6",
          isFocused && !showControls ? "opacity-0" : "opacity-100",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          onClick={onReset}
          className="p-4 rounded-full bg-card text-chrono-danger hover:bg-chrono-danger/20 hover:text-chrono-danger transition-all duration-200"
          title="Stop and reset"
        >
          <Square size={24} fill="currentColor" />
        </button>

        <button
          onClick={onToggle}
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
