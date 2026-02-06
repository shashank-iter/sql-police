"use client";

import { Database, X } from "lucide-react";
import { parseSchema, type Table } from "@/utils/schemaParser";

interface SchemaSidebarProps {
  schema: string;
  onClose: () => void;
}

export function SchemaSidebar({ schema, onClose }: SchemaSidebarProps) {
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
                      {table.columns.map((col: any, colIdx: number) => (
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
