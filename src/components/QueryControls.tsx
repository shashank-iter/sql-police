"use client";

import {
  Play,
  Loader2,
  ChevronLeft,
  Database,
  ChevronRight,
} from "lucide-react";

interface QueryControlsProps {
  isRunning: boolean;
  canRun: boolean;
  onRun: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleSchema: () => void;
  onToggleHint: () => void;
  showSchema: boolean;
  showHint: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function QueryControls({
  isRunning,
  canRun,
  onRun,
  onPrevious,
  onNext,
  onToggleSchema,
  onToggleHint,
  showSchema,
  showHint,
  canGoPrevious,
  canGoNext,
}: QueryControlsProps) {
  return (
    <div className="border-t border-border px-2 md:px-4 py-2 flex flex-wrap items-center justify-between bg-card shrink-0 gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onRun}
          disabled={isRunning || !canRun}
          className="
            flex items-center gap-2 px-3 md:px-4 py-1.5 rounded text-xs md:text-sm font-mono
            transition-all duration-200 cursor-pointer
            disabled:opacity-30 disabled:cursor-not-allowed
          "
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          {isRunning ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Play size={14} />
          )}
          <span className="hidden sm:inline">
            {isRunning ? "Running…" : "Run Query"}
          </span>
          <span className="sm:hidden">Run</span>
        </button>

        {/* Previous Mission Button */}
        <button
          onClick={onPrevious}
          className="
            flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 rounded text-xs md:text-sm font-mono
            transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed
            cursor-pointer
          "
          style={{
            background: "var(--secondary)",
            color: "var(--secondary-foreground)",
          }}
          disabled={!canGoPrevious}
        >
          <ChevronLeft size={14} />
          <span className="hidden md:inline">Previous</span>
        </button>

        {/* Show Schema Button (mobile only - desktop has schema in right sidebar) */}
        <button
          onClick={onToggleSchema}
          className="
            lg:hidden
            flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 rounded text-xs md:text-sm font-mono
            transition-all duration-200
            cursor-pointer
          "
          style={{
            background: showSchema ? "var(--primary)" : "var(--secondary)",
            color: showSchema
              ? "var(--primary-foreground)"
              : "var(--secondary-foreground)",
          }}
        >
          <Database size={14} />
          <span className="hidden md:inline">
            {showSchema ? "Hide Schema" : "Show Schema"}
          </span>
          <span className="md:hidden">Schema</span>
        </button>

        {/* Next Mission Button */}
        <button
          onClick={onNext}
          className="
            flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 rounded text-xs md:text-sm font-mono
            transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed
            cursor-pointer
          "
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
          disabled={!canGoNext}
        >
          <span className="hidden md:inline">Next</span>
          <ChevronRight size={14} />
        </button>

        <button
          className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap cursor-pointer"
          onClick={onToggleHint}
        >
          {showHint ? "Hide Hint" : "Show Hint"}
        </button>
      </div>
      <span className="text-xs text-muted-foreground hidden sm:inline">
        ⌘ + Enter
      </span>
    </div>
  );
}
