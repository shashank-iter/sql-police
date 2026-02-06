"use client";

import { useState } from "react";
import { X, BarChart3, Database } from "lucide-react";
import { ResultsTable } from "@/components/ResultsTable";
import type { QueryResult } from "@/hooks/useSqlDatabase";

interface ResultsSidebarProps {
  result: QueryResult | null;
  showResults: boolean;
  schema: string;
  onClose: () => void;
}

export function ResultsSidebar({
  result,
  showResults,
  schema,
  onClose,
}: ResultsSidebarProps) {
  const [activeTab, setActiveTab] = useState<"results" | "schema">("results");

  return (
    <aside
      className={`
        w-full lg:w-96 shrink-0 border-l border-border flex flex-col overflow-hidden
        lg:flex
        ${showResults ? "flex absolute inset-y-0 right-0 z-30 bg-background" : "hidden"}
      `}
    >
      {/* Header with tabs (desktop only) */}
      <div className="border-b border-border bg-card shrink-0">
        {/* Mobile header - just title and close button */}
        <div className="lg:hidden px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground tracking-widest uppercase">
            Query Results
          </span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* Desktop header - tabs */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={() => setActiveTab("results")}
            className={`
              flex-1 px-4 py-2 flex items-center justify-center gap-2 text-xs tracking-widest uppercase
              transition-colors border-b-2
              ${
                activeTab === "results"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <BarChart3 size={14} />
            Results
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`
              flex-1 px-4 py-2 flex items-center justify-center gap-2 text-xs tracking-widest uppercase
              transition-colors border-b-2
              ${
                activeTab === "schema"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Database size={14} />
            Schema
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile view - always show results */}
        <div className="lg:hidden">
          <ResultsTable result={result} />
        </div>

        {/* Desktop view - toggle between results and schema */}
        <div className="hidden lg:block h-full">
          {activeTab === "results" ? (
            <ResultsTable result={result} />
          ) : (
            <SchemaContent schema={schema} />
          )}
        </div>
      </div>
    </aside>
  );
}

/* Schema content component for desktop tab view */
function SchemaContent({ schema }: { schema: string }) {
  const parsedTables = parseSchema(schema);

  return (
    <div className="p-4">
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
  );
}

/* Parse SQL Schema */
interface Table {
  name: string;
  columns: {
    name: string;
    type: string;
    constraints: string;
  }[];
}

function parseSchema(schema: string): Table[] {
  const tables: Table[] = [];

  const tableRegex = /CREATE TABLE (\w+)\s*\(([\s\S]*?)\);/gi;
  let match;

  while ((match = tableRegex.exec(schema)) !== null) {
    const tableName = match[1];
    const columnsDef = match[2];

    const columns: { name: string; type: string; constraints: string }[] = [];

    const lines = columnsDef
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    for (const line of lines) {
      if (line.startsWith("FOREIGN KEY")) continue;

      const cleanLine = line.replace(/,$/, "").trim();
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
