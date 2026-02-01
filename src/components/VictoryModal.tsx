"use client";

import Link from "next/link";

/* ───────────────────────────────────────────
   VictoryModal
   Full-screen overlay: case solved!
   ─────────────────────────────────────────── */
export function VictoryModal({
  message,
  totalPoints,
  onClose,
}: {
  message: string;
  totalPoints: number;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal card */}
      <div
        className="relative z-10 max-w-lg w-full mx-4 rounded-xl border border-border overflow-hidden"
        style={{ background: "var(--card)" }}
      >
        {/* Gold top stripe */}
        <div className="h-1" style={{ background: "var(--primary)" }} />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div
              className="text-4xl font-sans tracking-widest uppercase mb-2"
              style={{ color: "var(--primary)" }}
            >
              Case Closed
            </div>
            <div className="flex items-center justify-center gap-2">
              <span
                className="text-sm font-mono px-3 py-1 rounded-full"
                style={{
                  background: "var(--primary)20",
                  color: "var(--primary)",
                  border: "1px solid var(--primary)40",
                }}
              >
                ★ {totalPoints} Points Earned
              </span>
            </div>
          </div>

          {/* Verdict text */}
          <div
            className="border border-border rounded-lg p-4 mb-6"
            style={{ background: "var(--secondary)" }}
          >
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="
                w-full text-center py-2.5 rounded-lg text-sm font-mono
                transition-all duration-200 hover:opacity-80
              "
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Back to Case Board
            </Link>
            <button
              onClick={onClose}
              className="w-full text-center py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors border border-border"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
