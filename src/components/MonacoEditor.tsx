"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ───────────────────────────────────────────
   MonacoEditor
   Lazy-loads @monaco-editor/react to avoid SSR.
   Applies a custom dark noir theme.
   ─────────────────────────────────────────── */
export function MonacoEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [Editor, setEditor] = useState<React.ComponentType<EditorProps> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Dynamic import on mount
  useEffect(() => {
    let cancelled = false;
    import("@monaco-editor/react").then((mod) => {
      if (cancelled) return;
      setEditor(() => mod.default);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = useCallback((val: string | undefined) => {
    onChangeRef.current(val ?? "");
  }, []);

  if (loading || !Editor) {
    return (
      <div className="flex-1 flex items-center justify-center bg-card">
        <span className="text-muted-foreground text-xs">Loading editor…</span>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language="sql"
      value={value}
      onChange={handleChange}
      theme="sql-noir"
      options={{
        fontSize: 14,
        fontFamily: "'Source Code Pro', 'Consolas', monospace",
        fontWeight: "500",
        minimap: { enabled: false },
        lineNumbers: "on",
        lineNumbersMinChars: 3,
        renderIndentGuides: true,
        smoothCaret: true,
        cursorBlinking: "smooth",
        wordWrap: "on",
        padding: { top: 16, bottom: 16 },
        scrollBeyondLastLine: false,
        tabSize: 2,
        formatOnType: false,
        autoClosingBrackets: "always",
        autoIndent: "full",
        bracketPairColorization: { enabled: true },
        suggest: { showKeywords: true, showSnippets: true },
        quickSuggestionsDelay: 200,
      }}
      beforeMount={(monaco) => {
        monaco.editor.defineTheme("sql-noir", {
          base: "vs-dark",
          inherit: true,
          // Token colours — applied to syntax-highlighted spans
          rules: [
            { token: "keyword", foreground: "c9a227", bold: true },
            { token: "keyword.dml", foreground: "c9a227", bold: true },
            { token: "keyword.ddl", foreground: "c9a227", bold: true },
            { token: "identifier", foreground: "e8e4df" },
            { token: "string", foreground: "7ec8a0" },
            { token: "number", foreground: "7aacdb" },
            { token: "comment", foreground: "5a5a5a", italic: true },
            { token: "operator", foreground: "d94f4f" },
            { token: "delimiter", foreground: "6b6760" },
          ],
          // Editor-wide colours — this is `colors`, not `styles`
          colors: {
            "editor.background": "#0e0e14",
            "editor.foreground": "#e8e4df",
            "editorLineNumber.foreground": "#3a3a4a",
            "editorLineNumber.activeForeground": "#c9a227",
            "editorCursor.foreground": "#c9a227",
            "editor.selectionBackground": "#c9a22720",
            "editorIndentGuide.background": "#1e1e2e",
            "editorIndentGuide.activeBackground": "#2a2a3a",
            "editor.lineHighlightBackground": "#14141c",
            "editorBracketPairGuide.background1": "#c9a22730",
            "editorBracketPairGuide.background2": "#d94f4f30",
          },
        });
      }}
    />
  );
}

// Minimal type for the dynamically-imported component
interface EditorProps {
  height?: string;
  language?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  theme?: string;
  options?: Record<string, unknown>;
  beforeMount?: (monaco: unknown) => void;
}
