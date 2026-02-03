"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSqlDatabase } from "@/hooks/useSqlDatabase";
import { MonacoEditor } from "@/components/MonacoEditor";
import { ResultsTable } from "@/components/ResultsTable";
import { MissionPanel } from "@/components/MissionPanel";
import { VictoryModal } from "@/components/VictoryModal";
import { UserProfile } from "@/components/UserProfile";
import { getValidator } from "@/data/validators";
import {
  useUserProgress,
  saveMissionAnswer,
  loadMissionAnswer,
} from "@/hooks/useUserProgress";
import type { CaseData } from "@/data/cases";
import type { QueryResult } from "@/hooks/useSqlDatabase";
import {
  ArrowLeft,
  RotateCcw,
  Play,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Database,
  X,
  Menu,
  BarChart3,
} from "lucide-react";

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
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(
    new Set(),
  );
  const [totalPoints, setTotalPoints] = useState(0);
  const [feedback, setFeedback] = useState<{
    pass: boolean;
    text: string;
  } | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [showMissions, setShowMissions] = useState(false); // mobile missions panel
  const [showResults, setShowResults] = useState(false); // mobile results panel

  const currentMission = caseData.missions[currentMissionIdx];
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

  // ── Execute ──────────────────────────────
  const handleRun = useCallback(() => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setError(null);
    setFeedback(null);

    // Save query to localStorage immediately when user runs it
    if (currentMission) {
      saveMissionAnswer(caseData.id, currentMission.id, code);
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
            setCompletedMissions(next);
            const newPoints = totalPoints + currentMission.points;
            setTotalPoints(newPoints);

            // Save progress to Supabase
            saveProgress(Array.from(next), newPoints);

            if (next.size === caseData.missions.length) {
              setTimeout(() => setShowVictory(true), 800);
            }
          }
        }
      }
      setIsRunning(false);
    }, 400);
  }, [
    code,
    isRunning,
    run,
    currentMission,
    completedMissions,
    totalPoints,
    caseData.missions.length,
    caseData.id,
    saveProgress,
  ]);

  // ── Reset DB ─────────────────────────────
  const handleReset = () => {
    reset();
    setResult(null);
    setError(null);
    setFeedback(null);
  };

  // ── Mission navigation ───────────────────
  const handleNextMission = () => {
    if (currentMissionIdx < caseData.missions.length - 1) {
      setCurrentMissionIdx((i) => i + 1);
      setFeedback(null);
      setResult(null);
      setCode("");
    }
  };

  const handlePreviousMission = () => {
    if (currentMissionIdx > 0) {
      setCurrentMissionIdx((i) => i - 1);
      setFeedback(null);
      setResult(null);
      setCode("");
    }
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
      <header className="border-b border-border px-3 md:px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm shrink-0"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Cases</span>
          </Link>
          <span className="text-border hidden sm:inline">|</span>
          <h1
            className="text-xs sm:text-sm md:text-base font-sans tracking-widest uppercase truncate"
            style={{ color: "var(--primary)" }}
          >
            {caseData.title}
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            <span style={{ color: "var(--primary)" }}>{totalPoints}</span>
            <span className="hidden sm:inline">
              {" "}
              / {caseData.totalPoints} pts
            </span>
          </span>
          <button
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Reset database"
          >
            <RotateCcw size={14} />
          </button>
          <UserProfile />
        </div>
      </header>

      {/* ─── Mobile toggle buttons (visible only on mobile) ──────── */}
      <div className="lg:hidden border-b border-border px-3 py-2 flex gap-2">
        <button
          onClick={() => {
            setShowMissions(!showMissions);
            setShowResults(false);
          }}
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
          onClick={() => {
            setShowResults(!showResults);
            setShowMissions(false);
          }}
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

      {/* ─── Body ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Left: Mission panel (desktop always visible, mobile overlay) ─────────── */}
        <aside
          className={`
          w-80 shrink-0 border-r border-border overflow-y-auto flex-col
          lg:flex
          ${showMissions ? "flex absolute inset-y-0 left-0 z-30 bg-background" : "hidden"}
        `}
        >
          <StoryIntro story={caseData.storyIntro} />
          <div className="flex-1 p-4 flex flex-col gap-2">
            {caseData.missions.map((m, i) => (
              <MissionPanel
                key={m.id}
                mission={m}
                index={i}
                isActive={i === currentMissionIdx}
                isComplete={completedMissions.has(m.id)}
                isDisabled={i > currentMissionIdx}
                onClick={() => {
                  if (!completedMissions.has(m.id) && i <= currentMissionIdx) {
                    setCurrentMissionIdx(i);
                    setFeedback(null);
                    setResult(null);
                    setShowMissions(false); // close on mobile after selection
                  }
                }}
              />
            ))}
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setShowMissions(false)}
            className="lg:hidden sticky bottom-0 w-full px-4 py-3 border-t border-border bg-card text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </aside>

        {/* ── Center: Editor + controls ────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {currentMission && !isComplete && (
            <div className="px-3 md:px-5 py-3 border-b border-border bg-card shrink-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground tracking-widest uppercase">
                  Objective {currentMissionIdx + 1}/{caseData.missions.length}
                </span>
                <span
                  className="text-xs whitespace-nowrap"
                  style={{ color: "var(--primary)" }}
                >
                  +{currentMission.points} pts
                </span>
              </div>
              <h2
                className="text-sm font-sans tracking-wide mt-1"
                style={{ color: "var(--foreground)" }}
              >
                {currentMission.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {currentMission.briefing}
              </p>
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-t border-border px-2 md:px-4 py-2 flex flex-wrap items-center justify-between bg-card shrink-0 gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleRun}
                  disabled={isRunning || !code.trim()}
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
                  onClick={handlePreviousMission}
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
                  disabled={currentMissionIdx === 0}
                >
                  <ChevronLeft size={14} />
                  <span className="hidden md:inline">Previous</span>
                </button>

                {/* Show Schema Button */}
                <button
                  onClick={() => setShowSchema(!showSchema)}
                  className="
                    flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 rounded text-xs md:text-sm font-mono
                    transition-all duration-200
                    cursor-pointer
                  "
                  style={{
                    background: showSchema
                      ? "var(--primary)"
                      : "var(--secondary)",
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
                  onClick={handleNextMission}
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
                  disabled={
                    !completedMissions.has(currentMission?.id) ||
                    currentMissionIdx === caseData.missions.length - 1
                  }
                >
                  <span className="hidden md:inline">Next</span>
                  <ChevronRight size={14} />
                </button>

                {currentMission && <HintToggle hint={currentMission.hint} />}
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                ⌘ + Enter
              </span>
            </div>

            {/* Feedback banner */}
            {feedback && (
              <div
                className={`px-3 md:px-4 py-3 text-xs md:text-sm border-t shrink-0 ${
                  feedback.pass ? "border-green-800" : "border-yellow-800"
                }`}
                style={{
                  background: feedback.pass
                    ? "rgba(79,217,124,0.08)"
                    : "rgba(217,159,79,0.08)",
                  color: feedback.pass ? "#4fd97c" : "#d99f4f",
                }}
              >
                {feedback.pass ? "✓ " : "⚠ "}
                {feedback.text}
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="px-3 md:px-4 py-2 border-t border-red-900 bg-red-950 shrink-0">
                <p className="text-xs text-red-400 font-mono break-words">
                  {error}
                </p>
              </div>
            )}
            <div className="flex-1 min-h-0">
              <MonacoEditor value={code} onChange={setCode} />
            </div>
          </div>
        </div>

        {/* ── Right: Results table (desktop always visible, mobile overlay) ───────── */}
        <aside
          className={`
          w-full lg:w-96 shrink-0 border-l border-border flex flex-col overflow-hidden
          lg:flex
          ${showResults ? "flex absolute inset-y-0 right-0 z-30 bg-background" : "hidden"}
        `}
        >
          <div className="px-4 py-2 border-b border-border bg-card shrink-0 flex items-center justify-between">
            <span className="text-xs text-muted-foreground tracking-widest uppercase">
              Query Results
            </span>
            <button
              onClick={() => setShowResults(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <ResultsTable result={result} />
          </div>
        </aside>

        {/* ── Schema Sidebar ───────────────── */}
        {showSchema && (
          <SchemaSidebar
            schema={caseData.schema}
            onClose={() => setShowSchema(false)}
          />
        )}

        {/* ── Mobile overlay backdrop (when missions or results are open) ───── */}
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

/* ── Collapsible story intro ────────────────── */
function StoryIntro({ story }: { story: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-secondary transition-colors"
      >
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--primary)" }}
        >
          Case Brief
        </span>
        <span className="text-muted-foreground text-xs">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {story}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Hint toggle ────────────────────────────── */
function HintToggle({ hint }: { hint: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setShow((s) => !s)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
      >
        {show ? "Hide hint" : "Show hint"}
      </button>
      {show && (
        <div className="absolute bottom-full left-0 mb-2 w-64 sm:w-72 bg-card border border-border rounded-lg p-3 shadow-lg z-10">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hint}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Schema Sidebar ────────────────────────────── */
interface Table {
  name: string;
  columns: {
    name: string;
    type: string;
    constraints: string;
  }[];
}

function SchemaSidebar({
  schema,
  onClose,
}: {
  schema: string;
  onClose: () => void;
}) {
  const parsedTables = parseSchema(schema);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black opacity-40 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-background border-l border-border z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Database size={16} style={{ color: "var(--primary)" }} />
            <span
              className="text-sm font-sans tracking-widest uppercase"
              style={{ color: "var(--primary)" }}
            >
              Database Schema
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {parsedTables.map((table, idx) => (
              <div
                key={idx}
                className="border border-border rounded-lg overflow-hidden"
              >
                <div className="px-3 py-2 bg-card border-b border-border">
                  <h3
                    className="text-sm font-mono font-semibold"
                    style={{ color: "var(--primary)" }}
                  >
                    {table.name}
                  </h3>
                </div>
                <div className="p-3 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="pb-2 font-medium">Column</th>
                        <th className="pb-2 font-medium">Type</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {table.columns.map((col, colIdx) => (
                        <tr key={colIdx} className="border-t border-border">
                          <td className="py-1.5 text-foreground">{col.name}</td>
                          <td className="py-1.5 text-muted-foreground">
                            {col.type}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Parse SQL Schema ──────────────────────────── */
function parseSchema(schema: string): Table[] {
  const tables: Table[] = [];

  // Split by CREATE TABLE statements
  const tableRegex = /CREATE TABLE (\w+)\s*\(([\s\S]*?)\);/gi;
  let match;

  while ((match = tableRegex.exec(schema)) !== null) {
    const tableName = match[1];
    const columnsDef = match[2];

    const columns: { name: string; type: string; constraints: string }[] = [];

    // Split columns by comma (but not commas within FOREIGN KEY)
    const lines = columnsDef
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    for (const line of lines) {
      // Skip FOREIGN KEY lines
      if (line.startsWith("FOREIGN KEY")) continue;

      // Remove trailing comma
      const cleanLine = line.replace(/,$/, "").trim();

      // Parse column definition: name type [constraints]
      const parts = cleanLine.split(/\s+/);
      if (parts.length >= 2) {
        const name = parts[0];
        const type = parts[1];
        const constraints = parts.slice(2).join(" ");

        columns.push({ name, type, constraints });
      }
    }

    tables.push({ name: tableName, columns });
  }

  return tables;
}
