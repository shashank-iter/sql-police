"use client";

import type { CaseMission } from "@/data/cases";
import { CheckCircle, Circle, Lock } from "lucide-react";

/* ───────────────────────────────────────────
   MissionPanel
   A single mission card in the sidebar.
   States: complete (✓), active (●), locked (🔒)
   ─────────────────────────────────────────── */
export function MissionPanel({
  mission,
  index,
  isActive,
  isComplete,
  isDisabled,
  onClick,
}: {
  mission: CaseMission;
  index: number;
  isActive: boolean;
  isComplete: boolean;
  isDisabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full text-left rounded-lg border p-3 transition-all duration-200
        flex items-start gap-3
        ${
          isDisabled
            ? "opacity-30 cursor-not-allowed border-border bg-card"
            : isComplete
              ? "border-green-800 bg-green-950/30 cursor-default"
              : isActive
                ? "border-primary bg-card cursor-pointer"
                : "border-border bg-card cursor-pointer hover:border-border/80"
        }
      `}
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        {isDisabled ? (
          <Lock size={16} className="text-muted-foreground" />
        ) : isComplete ? (
          <CheckCircle size={16} style={{ color: "#4fd97c" }} />
        ) : isActive ? (
          <Circle size={16} style={{ color: "var(--primary)" }} />
        ) : (
          <Circle size={16} className="text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-xs font-mono"
            style={{
              color: isComplete
                ? "#4fd97c"
                : isActive
                  ? "var(--foreground)"
                  : "var(--muted-foreground)",
            }}
          >
            {mission.title}
          </span>
          <span
            className="text-xs shrink-0"
            style={{
              color: isComplete ? "#4fd97c" : "var(--muted-foreground)",
            }}
          >
            {isComplete ? "✓" : `+${mission.points}`}
          </span>
        </div>
      </div>
    </button>
  );
}
