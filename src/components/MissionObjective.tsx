"use client";

import type { CaseMission } from "@/data/cases";

interface MissionObjectiveProps {
  mission: CaseMission;
  currentIndex: number;
  totalMissions: number;
}

export function MissionObjective({
  mission,
  currentIndex,
  totalMissions,
}: MissionObjectiveProps) {
  return (
    <div className="px-3 md:px-5 py-3 border-b border-border bg-card shrink-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">
          Objective {currentIndex + 1}/{totalMissions}
        </span>
        <span
          className="text-xs whitespace-nowrap"
          style={{ color: "var(--primary)" }}
        >
          +{mission.points} pts
        </span>
      </div>
      <h2
        className="text-sm font-sans tracking-wide mt-1"
        style={{ color: "var(--foreground)" }}
      >
        {mission.title}
      </h2>
      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
        {mission.briefing}
      </p>
    </div>
  );
}
