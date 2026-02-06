"use client";

import { MissionPanel } from "@/components/MissionPanel";
import { StoryIntro } from "@/components/StoryIntro";
import type { CaseMission } from "@/data/cases";

interface MissionSidebarProps {
  story: string;
  missions: CaseMission[];
  currentMissionIdx: number;
  completedMissions: Set<string>;
  showMissions: boolean;
  onMissionClick: (index: number) => void;
  onClose: () => void;
}

export function MissionSidebar({
  story,
  missions,
  currentMissionIdx,
  completedMissions,
  showMissions,
  onMissionClick,
  onClose,
}: MissionSidebarProps) {
  return (
    <aside
      className={`
        w-80 shrink-0 border-r border-border overflow-y-auto flex-col
        lg:flex
        ${showMissions ? "flex absolute inset-y-0 left-0 z-30 bg-background" : "hidden"}
      `}
    >
      <StoryIntro story={story} />
      <div className="flex-1 p-4 flex flex-col gap-2">
        {missions.map((m, i) => (
          <MissionPanel
            key={m.id}
            mission={m}
            index={i}
            isActive={i === currentMissionIdx}
            isComplete={completedMissions.has(m.id)}
            isDisabled={i > currentMissionIdx}
            onClick={() => {
              if (!completedMissions.has(m.id) && i <= currentMissionIdx) {
                onMissionClick(i);
              }
            }}
          />
        ))}
      </div>
      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className="lg:hidden sticky bottom-0 w-full px-4 py-3 border-t border-border bg-card text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Close
      </button>
    </aside>
  );
}
