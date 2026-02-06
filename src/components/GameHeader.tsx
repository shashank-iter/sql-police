"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { UserProfile } from "@/components/UserProfile";

interface GameHeaderProps {
  caseTitle: string;
  totalPoints: number;
  maxPoints: number;
  onReset: () => void;
}

export function GameHeader({
  caseTitle,
  totalPoints,
  maxPoints,
  onReset,
}: GameHeaderProps) {
  return (
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
          {caseTitle}
        </h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          <span style={{ color: "var(--primary)" }}>{totalPoints}</span>
          <span className="hidden sm:inline"> / {maxPoints} pts</span>
        </span>
        <button
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Reset database"
        >
          <RotateCcw size={14} />
        </button>
        <UserProfile />
      </div>
    </header>
  );
}
