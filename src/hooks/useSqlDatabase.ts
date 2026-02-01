// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { initSqlJs } from "@/lib/sql-client";
import type { SqlJsStatic } from "@/lib/sql-client";

/* ───────────────────────────────────────────
   useSqlDatabase
   Manages the sql.js lifecycle for a single case.
   ─────────────────────────────────────────── */
export interface QueryResult {
  columns: string[];
  rows: unknown[][];
  /** Rows as objects keyed by column name (for validation) */
  asObjects: Record<string, unknown>[];
}

export function useSqlDatabase(schema: string, seedData: string) {
  const [db, setDb] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const sqlJsRef = useRef<SqlJsStatic | null>(null);
  const dbRef = useRef<ReturnType<SqlJsStatic["Database"]> | null>(null);

  // ── Bootstrap sql.js + run schema ──────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setLoading(true);
        setInitError(null);

        // initSqlJs handles the WASM path internally via locateFile —
        // no config needed from us.
        const SQL = await initSqlJs();

        if (cancelled) return;
        sqlJsRef.current = SQL;

        const database = new SQL.Database();
        dbRef.current = database;

        // Run schema then seed data
        database.run(schema);
        database.run(seedData);

        setDb(database);
        setLoading(false);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setInitError(`Failed to initialise database: ${msg}`);
        setLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (dbRef.current) {
        try {
          dbRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, [schema, seedData]);

  // ── Execute a player query ─────────────────
  const run = useCallback(
    (
      sql: string,
    ): { success: boolean; result?: QueryResult; error?: string } => {
      const database = dbRef.current;
      if (!database)
        return { success: false, error: "Database not initialised." };

      try {
        const results = database.exec(sql);

        if (!results || results.length === 0) {
          return {
            success: true,
            result: { columns: [], rows: [], asObjects: [] },
          };
        }

        const first = results[0];
        const columns: string[] = first.columns;
        const rows: unknown[][] = first.values;

        const asObjects = rows.map((row: unknown[]) => {
          const obj: Record<string, unknown> = {};
          columns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });

        return { success: true, result: { columns, rows, asObjects } };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, error: msg };
      }
    },
    [],
  );

  // ── Reset the database back to initial state ─
  const reset = useCallback(() => {
    const SQL = sqlJsRef.current;
    if (!SQL) return;

    if (dbRef.current) {
      try {
        dbRef.current.close();
      } catch {
        // ignore
      }
    }

    const database = new SQL.Database();
    database.run(schema);
    database.run(seedData);
    dbRef.current = database;
    setDb(database);
  }, [schema, seedData]);

  return { db, loading, initError, run, reset };
}
