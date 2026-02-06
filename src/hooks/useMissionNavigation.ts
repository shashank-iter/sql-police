"use client";

import { useState, useCallback } from "react";

interface UseMissionNavigationProps {
  totalMissions: number;
  completedMissions: Set<string>;
  getCurrentMissionId: (index: number) => string;
  onMissionChange?: () => void;
}

export function useMissionNavigation({
  totalMissions,
  completedMissions,
  getCurrentMissionId,
  onMissionChange,
}: UseMissionNavigationProps) {
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);

  const handleNextMission = useCallback(() => {
    if (currentMissionIdx < totalMissions - 1) {
      setCurrentMissionIdx((i) => i + 1);
      onMissionChange?.();
    }
  }, [currentMissionIdx, totalMissions, onMissionChange]);

  const handlePreviousMission = useCallback(() => {
    if (currentMissionIdx > 0) {
      setCurrentMissionIdx((i) => i - 1);
      onMissionChange?.();
    }
  }, [currentMissionIdx, onMissionChange]);

  const handleSelectMission = useCallback(
    (index: number) => {
      const missionId = getCurrentMissionId(index);
      if (!completedMissions.has(missionId) && index <= currentMissionIdx) {
        setCurrentMissionIdx(index);
        onMissionChange?.();
      }
    },
    [
      completedMissions,
      currentMissionIdx,
      getCurrentMissionId,
      onMissionChange,
    ],
  );

  const canGoNext =
    completedMissions.has(getCurrentMissionId(currentMissionIdx)) &&
    currentMissionIdx < totalMissions - 1;

  const canGoPrevious = currentMissionIdx > 0;

  return {
    currentMissionIdx,
    handleNextMission,
    handlePreviousMission,
    handleSelectMission,
    canGoNext,
    canGoPrevious,
  };
}
