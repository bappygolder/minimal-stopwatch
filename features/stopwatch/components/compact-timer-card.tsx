import * as React from "react";
import type { Timer } from "@/features/stopwatch/types";
import { Play, Pause, Square, Maximize2, Trash2 } from "lucide-react";

type CompactTimerCardProps = {
  timer: Timer;
  isPrimary: boolean;
  isZenMode: boolean;
  isBeingDragged: boolean;
  onToggle: () => void;
  onReset: () => void;
  onDelete: () => void;
  onUpdateLabel: (label: string) => void;
  onPromote: () => void;
  onDragStart: (event: any) => void;
  onDragOver: (event: any) => void;
  onDrop: (event: any) => void;
};

export default function CompactTimerCard(props: CompactTimerCardProps) {
  const {
    timer,
    isPrimary,
    isZenMode,
    isBeingDragged,
    onToggle,
    onReset,
    onDelete,
    onUpdateLabel,
    onPromote,
    onDragStart,
    onDragOver,
    onDrop,
  } = props;

  const minutes = Math.floor(timer.elapsedMs / 60000);
  const seconds = Math.floor((timer.elapsedMs % 60000) / 1000);
  const milliseconds = Math.floor((timer.elapsedMs % 1000) / 10);

  const containerClasses = [
    "group flex items-center w-full max-w-4xl mx-auto px-4 py-3 rounded-xl border bg-card transition-all duration-200 cursor-pointer",
    "border-border",
    isPrimary ? "ring-1 ring-chrono-accent/40" : "",
    isZenMode ? "hover:bg-muted" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={containerClasses}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onPromote}
    >

      <div className="flex flex-col flex-1 min-w-0 mr-3">
        <input
          type="text"
          value={timer.label}
          onChange={(event: any) =>
            onUpdateLabel(event.target.value)
          }
          onClick={(event: any) =>
            event.stopPropagation()
          }
          placeholder="Timer name"
          className="w-full bg-transparent text-sm text-chrono-fg-muted focus:text-foreground outline-none border-b border-transparent focus:border-chrono-accent/40 truncate"
        />

        <div
          className="mt-1 flex items-baseline font-chronoNumber chrono-number text-base tracking-tight text-foreground"
          onClick={(event: any) => {
            event.stopPropagation();
            onToggle();
          }}
        >
          <span className="tabular-nums">
            {minutes.toString().padStart(2, "0")}:{seconds
              .toString()
              .padStart(2, "0")}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">
            .{milliseconds.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      <div
        className="flex items-center gap-2 ml-auto"
        onClick={(event: any) => event.stopPropagation()}
      >
        <button
          onClick={onReset}
          className="p-1.5 rounded-full bg-transparent text-foreground hover:bg-muted transition-colors"
          title="Reset"
        >
          <Square size={18} />
        </button>

        <button
          onClick={onToggle}
          className={[
            "p-1.5 rounded-full bg-transparent transition-colors",
            timer.isRunning
              ? "text-chrono-accent hover:text-chrono-accent"
              : "text-foreground hover:text-chrono-accent",
          ].join(" ")}
          title={timer.isRunning ? "Pause" : "Start"}
        >
          {timer.isRunning ? (
            <Pause size={18} />
          ) : (
            <Play size={18} />
          )}
        </button>

        <button
          onClick={onDelete}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Delete timer"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
