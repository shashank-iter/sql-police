/**
 * sql-client.ts
 *
 * Loads sql.js entirely outside the bundler by injecting a <script> tag
 * that points at a static copy of sql-wasm.js served from /public.
 *
 * Why not import("sql.js")?
 *   sql.js ships one file that contains `require("fs")` / `require("path")`
 *   for its Node branch.  Turbopack statically traces any import() it can
 *   see and tries to resolve those requires for the client bundle — and
 *   there is no supported way to stub only those two specifiers scoped to
 *   sql.js without also breaking Next.js internals.
 *
 * Setup (one-time, after npm install):
 *   cp node_modules/sql.js/dist/sql-wasm.js  public/sql.js/sql-wasm.js
 *   cp node_modules/sql.js/dist/sql.wasm     public/sql.js/sql.wasm
 *
 * sql-wasm.js sets `window.initSqlJs` when loaded via a script tag.
 *
 * WASM path note:
 *   When loaded via <script>, sql.js does NOT honour wasmConfig.url.
 *   It uses `locateFile` to resolve the .wasm path.  We pass that
 *   callback with an absolute path so it works on any route.
 */

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initSqlJs?: (config?: Record<string, unknown>) => Promise<any>;
  }
}

export type SqlJsStatic = {
  Database: new () => {
    run(sql: string): unknown;
    exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>;
    close(): void;
  };
};

/**
 * Injects the sql.js script tag (once) and returns a promise that resolves
 * when `window.initSqlJs` is available.
 */
function ensureScriptLoaded(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.initSqlJs === "function") {
      resolve();
      return;
    }

    const existing = document.getElementById("sql-js-script");
    if (existing) {
      const poll = setInterval(() => {
        if (typeof window.initSqlJs === "function") {
          clearInterval(poll);
          resolve();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(poll);
        reject(new Error("sql.js script did not load within 10 s"));
      }, 10_000);
      return;
    }

    const script = document.createElement("script");
    script.id = "sql-js-script";
    script.src = "/sql.js/sql-wasm.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load /sql.js/sql-wasm.js"));
    document.head.appendChild(script);
  });
}

/**
 * Public API — call inside a useEffect, never at module top level.
 *
 * We ignore the caller's config entirely and supply our own.
 * `locateFile` is the only path-resolution hook sql.js honours
 * when loaded via a script tag — it receives the filename it wants
 * (e.g. "sql.wasm") and we return the absolute public/ path.
 */
export async function initSqlJs(): Promise<SqlJsStatic> {
  await ensureScriptLoaded();

  if (typeof window.initSqlJs !== "function") {
    throw new Error("window.initSqlJs is not available after script load.");
  }

  return window.initSqlJs({
    // locateFile is called with the filename sql.js wants to load.
    // Return an absolute path so it works regardless of current route.
    locateFile: (filename: string) => `/sql.js/${filename}`,
  });
}
