import { useState, MouseEvent, DragEvent } from "react";
import type { Timer } from "@/features/stopwatch/types";
import {
  Play,
  Pause,
  Square,
  Maximize2,
  Minimize2,
  Trash2,
  GripVertical,
} from "lucide-react";

type TimerCardProps = {
  timer: Timer;
  totalTimers: number;
  isZenMode: boolean;
  isBeingDragged: boolean;
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
    isZenMode,
    isBeingDragged,
    onToggle,
    onReset,
    onDelete,
    onUpdateLabel,
    onDragStart,
    onDragOver,
    onDrop,
  } = props;

  const [isFocused, setIsFocused] = useState(false);

  const handleToggleFocus = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsFocused((value) => !value);
  };

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete();
  };

  const minutes = Math.floor(timer.elapsedMs / 60000);
  const seconds = Math.floor((timer.elapsedMs % 60000) / 1000);
  const milliseconds = Math.floor((timer.elapsedMs % 1000) / 10);

  const sizeClasses = isFocused
    ? "text-[18vw] sm:text-[12rem] font-normal"
    : "text-[12vw] sm:text-[8rem] font-normal";

  const subSizeClasses = isFocused
    ? "text-[9vw] sm:text-[6rem] text-chrono-fg-muted mx-1"
    : "text-[6vw] sm:text-[4rem] text-chrono-fg-muted mx-1";

  const msSizeClasses = isFocused
    ? "text-[6vw] sm:text-[4rem] font-light ml-2 w-[7vw] sm:w-[9rem] text-left"
    : "text-[4vw] sm:text-[3rem] font-light ml-2 w-[5vw] sm:w-[6rem] text-left";

  const containerClasses = isFocused
    ? "fixed inset-0 z-50 bg-chrono-bg-page flex flex-col items-center justify-center gap-10"
    : [
        "relative group flex flex-col items-center justify-center pt-20 pb-12 px-8 rounded-2xl border w-full max-w-4xl mx-auto transition-all duration-300",
        timer.isRunning
          ? "bg-chrono-bg-card border-chrono-border-subtle shadow-chrono-glow"
          : "bg-chrono-bg-card border-chrono-border-subtle",
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
          "flex justify-between items-center w-full absolute top-0 pt-6 px-6 transition-opacity duration-300",
          isFocused ? "top-6" : "",
          isZenMode && !isFocused
            ? "opacity-0 group-hover:opacity-100"
            : "opacity-100",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isFocused ? (
          <div className="text-sm text-chrono-fg-muted">
            {timer.label}
          </div>
        ) : (
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
            title={isFocused ? "Exit focus" : "Focus mode"}
          >
            {isFocused ? <Minimize2 size={24} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      <div
        onClick={onToggle}
        className="cursor-pointer transition-transform duration-200 active:scale-95"
      >
        <div className="flex items-baseline font-chronoNumber chrono-number tracking-tight leading-none select-none transition-all duration-500">
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
          "flex gap-4 transition-all duration-300 justify-center",
          isFocused ? "mt-12 scale-150" : "mt-6",
          isZenMode && !isFocused
            ? "opacity-0 group-hover:opacity-100"
            : "opacity-100",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          onClick={onReset}
          className="p-2 rounded-full bg-transparent text-foreground hover:bg-muted hover:text-chrono-accent transition-all duration-200"
          title="Stop and reset"
        >
          <Square size={18} />
        </button>

        <button
          onClick={onToggle}
          className={[
            "p-2 rounded-full bg-transparent transition-all duration-200 hover:bg-muted hover:text-chrono-accent",
            timer.isRunning ? "text-chrono-accent" : "text-foreground",
          ].join(" ")}
          title={timer.isRunning ? "Pause" : "Start"}
        >
          {timer.isRunning ? (
            <Pause size={18} />
          ) : (
            <Play size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
