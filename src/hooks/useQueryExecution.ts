"use client";

import { useState, useCallback } from "react";
import { getValidator } from "@/data/validators";
import { saveMissionAnswer } from "@/hooks/useUserProgress";
import type { QueryResult } from "@/hooks/useSqlDatabase";

interface UseQueryExecutionProps {
  run: (code: string) => {
    success: boolean;
    error?: string;
    result?: QueryResult;
  };
  currentMission: { id: string; points: number } | undefined;
  completedMissions: Set<string>;
  totalPoints: number;
  totalMissions: number;
  caseId: string;
  saveProgress: (missions: string[], points: number) => void;
}

export function useQueryExecution({
  run,
  currentMission,
  completedMissions,
  totalPoints,
  totalMissions,
  caseId,
  saveProgress,
}: UseQueryExecutionProps) {
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<{
    pass: boolean;
    text: string;
  } | null>(null);
  const [showVictory, setShowVictory] = useState(false);

  const handleRun = useCallback(
    (code: string) => {
      if (!code.trim() || isRunning) return;
      setIsRunning(true);
      setError(null);
      setFeedback(null);

      // Save query to localStorage immediately when user runs it
      if (currentMission) {
        saveMissionAnswer(caseId, currentMission.id, code);
      }

      setTimeout(() => {
        const outcome = run(code);
        if (!outcome.success) {
          setError(outcome.error ?? "Unknown error");
          setResult(null);
        } else {
          console.log(outcome.result);
          console.log(outcome.result?.asObjects);
          setResult(outcome.result ?? null);
          setError(null);

          // Validate against current mission using the client-side validator map
          if (outcome.result && currentMission) {
            const { asObjects } = outcome.result;
            const validate = getValidator(currentMission.id);
            console.log("asObjects: near validator", asObjects);
            const validation = validate(asObjects);
            console.log(validation.pass);
            setFeedback({ pass: validation.pass, text: validation.feedback });

            if (validation.pass && !completedMissions.has(currentMission.id)) {
              const next = new Set(completedMissions);
              next.add(currentMission.id);
              const newPoints = totalPoints + currentMission.points;

              // Save progress to Supabase
              saveProgress(Array.from(next), newPoints);

              if (next.size === totalMissions) {
                setTimeout(() => setShowVictory(true), 800);
              }
            }
          }
        }
        setIsRunning(false);
      }, 400);
    },
    [
      isRunning,
      run,
      currentMission,
      completedMissions,
      totalPoints,
      totalMissions,
      caseId,
      saveProgress,
    ],
  );

  const clearFeedback = () => setFeedback(null);
  const clearResult = () => setResult(null);

  return {
    result,
    error,
    isRunning,
    feedback,
    showVictory,
    handleRun,
    clearFeedback,
    clearResult,
    setShowVictory,
  };
}
