"use client";

import { useState } from "react";
import Link from "next/link";
import { cases } from "@/data/cases";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/components/UserProfile";
import { LoginModal } from "@/components/LoginModal";
import { Lock, Star, Clock, ChevronRight } from "lucide-react";

/* ───────────────────────────────────────────
   LANDING PAGE  →  Case Board
   ─────────────────────────────────────────── */
export default function HomePage() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string>("");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top bar ────────────────────────── */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1
          className="text-2xl tracking-widest uppercase font-sans"
          style={{ color: "var(--primary)" }}
        >
          ◆ SQL Police
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground tracking-wide uppercase">
            Case Board
          </span>
          <UserProfile />
        </div>
      </header>

      {/* ── Hero blurb ─────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pt-14 pb-10 text-center">
        <p className="text-muted-foreground text-sm tracking-widest uppercase mb-3">
          Welcome, Officer
        </p>
        <h2
          className="text-5xl font-sans tracking-widest uppercase leading-tight mb-4"
          style={{ color: "var(--primary)" }}
        >
          Crack the Cases
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Each case is a real crime scenario. Query the evidence database to
          find the culprit. Your SQL skills are your only weapon.
        </p>
      </section>

      {/* ── Case grid ──────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 pb-24">
        <div className="flex flex-col gap-4">
          {cases.map((c, i) => {
            const requiresAuth = i > 0; // Case 1 (index 0) is free
            const isLocked = requiresAuth && !user;

            return (
              <CaseCard
                key={c.id}
                caseData={c}
                locked={isLocked}
                index={i}
                requiresAuth={requiresAuth}
                onAuthRequired={() => {
                  setSelectedCase(c.title);
                  setShowLoginModal(true);
                }}
              />
            );
          })}
        </div>
      </main>

      {/* ── Login Modal ──────────────────────── */}
      {showLoginModal && (
        <LoginModal
          caseName={selectedCase}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}

/* ── Individual case card ───────────────── */
function CaseCard({
  caseData,
  locked,
  index,
  requiresAuth,
  onAuthRequired,
}: {
  caseData: (typeof cases)[0];
  locked: boolean;
  index: number;
  requiresAuth: boolean;
  onAuthRequired?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (locked && onAuthRequired) {
      e.preventDefault();
      onAuthRequired();
    }
  };

  const content = (
    <div
      className={`
        relative group border border-border rounded-lg overflow-hidden
        transition-all duration-300
        ${locked ? "opacity-40 cursor-pointer" : "cursor-pointer hover:border-primary"}
        bg-card
      `}
      onClick={handleClick}
    >
      {/* Accent stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300"
        style={{
          background: locked ? "var(--border)" : "var(--primary)",
          opacity: locked ? 0.3 : 1,
        }}
      />

      <div className="p-5 pl-6 flex items-start justify-between gap-4">
        {/* Left: info */}
        <div className="flex-1 min-w-0">
          {/* Case number + difficulty */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
              Case #{String(index + 1).padStart(3, "0")}
            </span>
            <DifficultyBadge level={caseData.difficulty} />
            {requiresAuth && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock size={12} />
                Login Required
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className="text-lg font-sans tracking-widest uppercase mb-1"
            style={{
              color: locked ? "var(--muted-foreground)" : "var(--foreground)",
            }}
          >
            {caseData.title}
          </h3>

          {/* Short summary */}
          <p className="text-sm text-muted-foreground leading-relaxed truncate">
            {caseData.summary}
          </p>
        </div>

        {/* Right: meta */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {locked ? (
            <Lock size={18} className="text-muted-foreground" />
          ) : (
            <ChevronRight
              size={18}
              className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            />
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            <span>{caseData.estimatedMinutes} min</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star size={12} style={{ color: "var(--primary)" }} />
            <span>{caseData.totalPoints} pts</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (locked) return content;
  return <Link href={`/case/${caseData.id}`}>{content}</Link>;
}

/* ── Difficulty badge ────────────────────── */
function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Rookie: "#4fd97c",
    Detective: "#c9a227",
    Inspector: "#d94f4f",
  };
  return (
    <span
      className="text-xs font-mono px-2 py-0.5 rounded-full border"
      style={{
        color: colors[level] || "#aaa",
        borderColor: colors[level] || "#aaa",
        background: `${colors[level] || "#aaa"}15`,
      }}
    >
      {level}
    </span>
  );
}
