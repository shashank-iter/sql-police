"use client";

import type { QueryResult } from "@/hooks/useSqlDatabase";

/* ───────────────────────────────────────────
   ResultsTable
   Renders the sql.js output in a readable table.
   Handles empty / null states gracefully.
   ─────────────────────────────────────────── */
export function ResultsTable({ result }: { result: QueryResult | null }) {
  // ── Empty state ──────────────────────────
  if (!result) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground text-xs text-center leading-relaxed">
          Run a query to see results here.
        </p>
      </div>
    );
  }

  // ── No columns (e.g. INSERT/UPDATE ran) ──
  if (result.columns.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground text-xs">
          Query executed successfully — no rows returned.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Row count */}
      <div className="px-3 py-1.5 border-b border-border bg-card shrink-0">
        <span className="text-xs text-muted-foreground">
          <span style={{ color: "var(--primary)" }}>{result.rows.length}</span>{" "}
          row
          {result.rows.length !== 1 ? "s" : ""} returned
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-card border-b border-border">
            <tr>
              {result.columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-xs font-mono tracking-wide whitespace-nowrap"
                  style={{ color: "var(--primary)" }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-border/50 hover:bg-secondary transition-colors"
              >
                {row.map((cell, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-3 py-1.5 text-xs font-mono whitespace-nowrap"
                  >
                    <CellValue value={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Format a single cell value ─────────────── */
function CellValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">NULL</span>;
  }

  if (typeof value === "number") {
    // Format currency-like large numbers
    if (value > 1000) {
      return (
        <span style={{ color: "var(--chart-3)" }}>
          {value.toLocaleString()}
        </span>
      );
    }
    return <span style={{ color: "var(--chart-3)" }}>{value}</span>;
  }

  if (typeof value === "string") {
    // Time-like strings (HH:MM)
    if (/^\d{2}:\d{2}$/.test(value)) {
      return <span style={{ color: "var(--accent)" }}>{value}</span>;
    }
    return <span className="text-foreground">{value}</span>;
  }

  // Boolean-ish (0/1 for stolen flag)
  if (value === 0 || value === 1) {
    return (
      <span
        style={{ color: value === 1 ? "var(--destructive)" : "var(--chart-2)" }}
      >
        {value === 1 ? "Yes" : "No"}
      </span>
    );
  }

  return <span className="text-foreground">{String(value)}</span>;
}
