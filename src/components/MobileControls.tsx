"use client";

import { Menu, BarChart3 } from "lucide-react";

interface MobileControlsProps {
  showMissions: boolean;
  showResults: boolean;
  onToggleMissions: () => void;
  onToggleResults: () => void;
}

export function MobileControls({
  showMissions,
  showResults,
  onToggleMissions,
  onToggleResults,
}: MobileControlsProps) {
  return (
    <div className="lg:hidden border-b border-border px-3 py-2 flex gap-2">
      <button
        onClick={onToggleMissions}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-mono transition-colors"
        style={{
          background: showMissions ? "var(--primary)" : "var(--secondary)",
          color: showMissions
            ? "var(--primary-foreground)"
            : "var(--secondary-foreground)",
        }}
      >
        <Menu size={14} />
        Missions
      </button>
      <button
        onClick={onToggleResults}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-mono transition-colors"
        style={{
          background: showResults ? "var(--primary)" : "var(--secondary)",
          color: showResults
            ? "var(--primary-foreground)"
            : "var(--secondary-foreground)",
        }}
      >
        <BarChart3 size={14} />
        Results
      </button>
    </div>
  );
}
