"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useSqlDatabase } from "@/hooks/useSqlDatabase";
import { useUserProgress, loadMissionAnswer } from "@/hooks/useUserProgress";
import { useQueryExecution } from "@/hooks/useQueryExecution";
import { useMissionNavigation } from "@/hooks/useMissionNavigation";
import { MonacoEditor } from "@/components/MonacoEditor";
import { VictoryModal } from "@/components/VictoryModal";
import { GameHeader } from "@/components/GameHeader";
import { MobileControls } from "@/components/MobileControls";
import { MissionSidebar } from "@/components/MissionSidebar";
import { MissionObjective } from "@/components/MissionObjective";
import { QueryControls } from "@/components/QueryControls";
import { FeedbackBanner } from "@/components/FeedbackBanner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { HintToggle } from "@/components/HintToggle";
import { ResultsSidebar } from "@/components/ResultsSidebar";
import { SchemaSidebar } from "@/components/SchemaSidebar";
import type { CaseData } from "@/data/cases";

/* ───────────────────────────────────────────
   GameShell  —  top-level game orchestrator
   ─────────────────────────────────────────── */
export function GameShell({ caseData }: { caseData: CaseData }) {
  // ── SQL engine ───────────────────────────
  const {
    loading: dbLoading,
    initError,
    run,
    reset,
  } = useSqlDatabase(caseData.schema, caseData.seedData);

  // ── Progress tracking ────────────────────
  const {
    progress,
    loading: progressLoading,
    saveProgress,
  } = useUserProgress(caseData.id);

  // ── State ────────────────────────────────
  const [code, setCode] = useState("");
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(
    new Set(),
  );
  const [totalPoints, setTotalPoints] = useState(0);
  const [showSchema, setShowSchema] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // ── Mission navigation ───────────────────
  const {
    currentMissionIdx,
    handleNextMission,
    handlePreviousMission,
    handleSelectMission,
    canGoNext,
    canGoPrevious,
  } = useMissionNavigation({
    totalMissions: caseData.missions.length,
    completedMissions,
    getCurrentMissionId: (index) => caseData.missions[index].id,
    onMissionChange: () => {
      clearFeedback();
      clearResult();
      setCode("");
      setShowMissions(false);
    },
  });

  const currentMission = caseData.missions[currentMissionIdx];

  // ── Query execution ──────────────────────
  const {
    result,
    error,
    isRunning,
    feedback,
    showVictory,
    handleRun,
    clearFeedback,
    clearResult,
    setShowVictory,
  } = useQueryExecution({
    run,
    currentMission,
    completedMissions,
    totalPoints,
    totalMissions: caseData.missions.length,
    caseId: caseData.id,
    saveProgress: (missions, points) => {
      setCompletedMissions(new Set(missions));
      setTotalPoints(points);
      saveProgress(missions, points);
    },
  });

  const isComplete = completedMissions.size === caseData.missions.length;

  // ── Load progress from Supabase on mount ────
  useEffect(() => {
    if (progress) {
      setCompletedMissions(new Set(progress.completed_missions));
      setTotalPoints(progress.total_points);
    }
  }, [progress]);

  // ── Load saved query from localStorage when mission changes ────
  useEffect(() => {
    if (currentMission) {
      const savedQuery = loadMissionAnswer(caseData.id, currentMission.id);
      if (savedQuery) {
        setCode(savedQuery);
      }
    }
  }, [currentMission, caseData.id]);

  // ── Reset DB ─────────────────────────────
  const handleReset = () => {
    reset();
    clearResult();
    clearFeedback();
  };

  // ── Loading / error states ───────────────
  if (dbLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-foreground px-4">
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "var(--primary)" }}
        />
        <p className="text-muted-foreground text-sm text-center">
          Initialising evidence database…
        </p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground px-6">
        <p className="text-destructive text-sm max-w-md text-center">
          {initError}
        </p>
        <p className="text-muted-foreground text-xs max-w-md text-center">
          Make sure sql.js WASM is accessible. Copy{" "}
          <code className="text-primary">
            node_modules/sql.js/dist/sql.wasm
          </code>{" "}
          into <code className="text-primary">public/sql.js/</code>.
        </p>
        <Link href="/" className="text-primary text-sm hover:underline">
          ← Back to Case Board
        </Link>
      </div>
    );
  }

  // ── Main layout ──────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ─── Top nav ──────────────────────── */}
      <GameHeader
        caseTitle={caseData.title}
        totalPoints={totalPoints}
        maxPoints={caseData.totalPoints}
        onReset={handleReset}
      />

      {/* ─── Mobile toggle buttons ──────── */}
      <MobileControls
        showMissions={showMissions}
        showResults={showResults}
        onToggleMissions={() => {
          setShowMissions(!showMissions);
          setShowResults(false);
        }}
        onToggleResults={() => {
          setShowResults(!showResults);
          setShowMissions(false);
        }}
      />

      {/* ─── Body ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Left: Mission panel ─────────── */}
        <MissionSidebar
          story={caseData.storyIntro}
          missions={caseData.missions}
          currentMissionIdx={currentMissionIdx}
          completedMissions={completedMissions}
          showMissions={showMissions}
          onMissionClick={handleSelectMission}
          onClose={() => setShowMissions(false)}
        />

        {/* ── Center: Editor + controls ────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {currentMission && (
            <MissionObjective
              mission={currentMission}
              currentIndex={currentMissionIdx}
              totalMissions={caseData.missions.length}
            />
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <QueryControls
              isRunning={isRunning}
              canRun={!!code.trim()}
              onRun={() => handleRun(code)}
              onPrevious={handlePreviousMission}
              onNext={handleNextMission}
              onToggleSchema={() => setShowSchema(!showSchema)}
              onToggleHint={() => setShowHint(!showHint)}
              showSchema={showSchema}
              showHint={showHint}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
            />

            {/* Feedback banner */}
            {feedback && (
              <FeedbackBanner pass={feedback.pass} text={feedback.text} />
            )}

            {/* Error banner */}
            {error && <ErrorBanner error={error} />}

            {/* Hint */}
            <HintToggle
              hint={currentMission.hint}
              show={showHint}
              setShow={setShowHint}
            />

            <div className="flex-1 min-h-0">
              <MonacoEditor value={code} onChange={setCode} />
            </div>
          </div>
        </div>

        {/* ── Right: Results table ───────── */}
        <ResultsSidebar
          result={result}
          schema={caseData.schema}
          showResults={showResults}
          onClose={() => setShowResults(false)}
        />

        {/* ── Schema Sidebar ───────────────── */}
        {showSchema && (
          <SchemaSidebar
            schema={caseData.schema}
            onClose={() => setShowSchema(false)}
          />
        )}

        {/* ── Mobile overlay backdrop ───── */}
        {(showMissions || showResults) && (
          <div
            className="lg:hidden fixed inset-0 bg-black opacity-40 z-20"
            onClick={() => {
              setShowMissions(false);
              setShowResults(false);
            }}
          />
        )}
      </div>

      {/* ── Victory modal ──────────────────── */}
      {showVictory && (
        <VictoryModal
          message={caseData.victoryMessage}
          totalPoints={totalPoints}
          onClose={() => setShowVictory(false)}
        />
      )}
    </div>
  );
}
