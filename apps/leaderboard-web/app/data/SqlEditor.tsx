"use client";

import { sql, SQLite } from "@codemirror/lang-sql";
import CodeMirror, { EditorView, keymap } from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import type { TableSchema } from "./SqlRepl";

const baseTheme = EditorView.theme({
  "&": {
    fontSize: "14px",
    backgroundColor: "transparent",
  },
  ".cm-content": {
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    padding: "12px 0",
    caretColor: "var(--foreground)",
  },
  ".cm-line": {
    padding: "0 16px",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    borderRight: "1px solid var(--border)",
    color: "var(--muted-foreground)",
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    fontSize: "12px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "color-mix(in oklch, var(--muted) 50%, transparent)",
  },
  ".cm-activeLine": {
    backgroundColor: "color-mix(in oklch, var(--muted) 30%, transparent)",
  },
  ".cm-selectionBackground": {
    backgroundColor:
      "color-mix(in oklch, var(--primary) 25%, transparent) !important",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--foreground)",
  },
  ".cm-matchingBracket": {
    backgroundColor: "color-mix(in oklch, var(--primary) 20%, transparent)",
    outline: "1px solid color-mix(in oklch, var(--primary) 40%, transparent)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul": {
    fontFamily: "var(--font-mono), ui-monospace, monospace",
    fontSize: "13px",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "var(--muted)",
    color: "var(--muted-foreground)",
  },
  ".cm-completionIcon": {
    opacity: "0.6",
  },
  ".cm-scroller": {
    minHeight: "120px",
  },
});

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  schema: TableSchema[];
}

export default function SqlEditor({
  value,
  onChange,
  onRun,
  schema,
}: SqlEditorProps) {
  const { resolvedTheme } = useTheme();

  const extensions = useMemo(() => {
    const schemaMap: Record<string, string[]> = {};
    for (const table of schema) {
      schemaMap[table.name] = table.columns.map((c) => c.name);
    }

    return [
      sql({ dialect: SQLite, schema: schemaMap, upperCaseKeywords: true }),
      keymap.of([
        {
          key: "Mod-Enter",
          run: () => {
            onRun();
            return true;
          },
        },
      ]),
      baseTheme,
      EditorView.lineWrapping,
    ];
  }, [schema, onRun]);

  return (
    <CodeMirror
      value={value}
      onChange={(val: string) => onChange(val)}
      extensions={extensions}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
        highlightSelectionMatches: true,
        bracketMatching: true,
        closeBrackets: true,
        autocompletion: true,
        searchKeymap: true,
      }}
      placeholder="SELECT * FROM contributor LIMIT 10;"
    />
  );
}
