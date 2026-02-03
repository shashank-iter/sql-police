"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProgress {
  user_id: string;
  case_id: string;
  completed_missions: string[];
  total_points: number;
  last_updated: string;
}

export interface MissionAnswer {
  mission_id: string;
  query: string;
  timestamp: number;
}

const STORAGE_PREFIX = "sql_detective_";

export function useUserProgress(caseId: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Load progress from Supabase or initialize
  useEffect(() => {
    async function loadProgress() {
      if (!user) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("case_id", caseId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine
        console.error("Error loading progress:", error);
      }

      if (data) {
        setProgress(data as UserProgress);
      } else {
        // Initialize new progress
        const newProgress: UserProgress = {
          user_id: user.id,
          case_id: caseId,
          completed_missions: [],
          total_points: 0,
          last_updated: new Date().toISOString(),
        };
        setProgress(newProgress);
      }

      setLoading(false);
    }

    loadProgress();
  }, [user, caseId]);

  // Save progress to Supabase
  const saveProgress = useCallback(
    async (completedMissions: string[], totalPoints: number) => {
      if (!user) return;

      const updatedProgress: UserProgress = {
        user_id: user.id,
        case_id: caseId,
        completed_missions: completedMissions,
        total_points: totalPoints,
        last_updated: new Date().toISOString(),
      };

      const supabase = createClient();
      const { error } = await supabase
        .from("user_progress")
        .upsert(updatedProgress, {
          onConflict: "user_id,case_id",
        });

      if (error) {
        console.error("Error saving progress:", error);
      } else {
        setProgress(updatedProgress);
      }
    },
    [user, caseId],
  );

  return { progress, loading, saveProgress };
}

// Local storage utilities for mission answers
export function saveMissionAnswer(
  caseId: string,
  missionId: string,
  query: string,
) {
  const key = `${STORAGE_PREFIX}${caseId}_${missionId}`;
  const answer: MissionAnswer = {
    mission_id: missionId,
    query,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(key, JSON.stringify(answer));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

export function loadMissionAnswer(
  caseId: string,
  missionId: string,
): string | null {
  const key = `${STORAGE_PREFIX}${caseId}_${missionId}`;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const answer: MissionAnswer = JSON.parse(stored);
    return answer.query;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
}

export function clearCaseAnswers(caseId: string) {
  try {
    const keys = Object.keys(localStorage);
    const prefix = `${STORAGE_PREFIX}${caseId}_`;
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}
