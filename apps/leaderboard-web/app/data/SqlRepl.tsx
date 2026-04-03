"use client";

import { Button } from "@/components/ui/button";
import { useDatabase, type QueryResult } from "@/lib/sql-repl/use-database";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Columns3,
  HardDrive,
  Play,
  Table2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadingAnimation from "./LoadingAnimation";
import ResultsTable from "./ResultsTable";

export interface TableSchema {
  name: string;
  columns: { name: string; type: string }[];
}

const EXAMPLE_QUERIES = [
  {
    label: "All contributors",
    sql: "SELECT username, name, role, title FROM contributor ORDER BY username;",
  },
  {
    label: "Top 10 by points",
    sql: `SELECT c.username, c.name, SUM(a.points) AS total_points
FROM activity a
JOIN contributor c ON a.contributor = c.username
GROUP BY a.contributor
ORDER BY total_points DESC
LIMIT 10;`,
  },
  {
    label: "Activity types",
    sql: "SELECT slug, name, points FROM activity_definition ORDER BY points DESC;",
  },
  {
    label: "Recent activity",
    sql: `SELECT a.title, a.contributor, ad.name AS type, a.points, a.occured_at
FROM activity a
JOIN activity_definition ad ON a.activity_definition = ad.slug
ORDER BY a.occured_at DESC
LIMIT 20;`,
  },
  {
    label: "Activity per contributor",
    sql: `SELECT a.contributor, COUNT(*) AS activities, SUM(a.points) AS points
FROM activity a
GROUP BY a.contributor
ORDER BY points DESC
LIMIT 15;`,
  },
  {
    label: "Badge holders",
    sql: `SELECT cb.contributor, bd.name AS badge, cb.variant, cb.achieved_on
FROM contributor_badge cb
JOIN badge_definition bd ON cb.badge = bd.slug
ORDER BY cb.achieved_on DESC
LIMIT 20;`,
  },
];

interface SqlReplProps {
  schema: TableSchema[];
  source?: string;
}

export default function SqlRepl({ schema, source }: SqlReplProps) {
  const { status, error: dbError, exec, getStats } = useDatabase(source);
  const [query, setQuery] = useState(EXAMPLE_QUERIES[0]?.sql ?? "");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [networkStats, setNetworkStats] = useState<{
    totalFetchedBytes: number;
    totalRequests: number;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(120, el.scrollHeight) + "px";
  }, [query]);

  const runQuery = useCallback(async () => {
    if (status !== "ready" || running) return;

    setRunning(true);
    setQueryError(null);
    setResult(null);

    try {
      const res = await exec(query);
      setResult(res);
      const stats = await getStats();
      if (stats) {
        setNetworkStats({
          totalFetchedBytes: stats.totalFetchedBytes,
          totalRequests: stats.totalRequests,
        });
      }
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  }, [query, status, running, exec, getStats]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runQuery();
      }
    },
    [runQuery],
  );

  const toggleTable = (name: string) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  if (status === "loading" || status === "idle") {
    return <LoadingAnimation />;
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-sm text-destructive font-medium">
          Failed to load database
        </p>
        <p className="text-xs text-muted-foreground max-w-md text-center">
          {dbError}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 items-start">
      {/* Main editor + results */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Editor */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
            <span className="text-xs font-medium text-muted-foreground">
              SQL Query
            </span>
            <div className="flex items-center gap-2">
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border">
                {typeof navigator !== "undefined" &&
                navigator.platform?.includes("Mac")
                  ? "⌘"
                  : "Ctrl"}
                +Enter
              </kbd>
              <Button
                size="sm"
                onClick={runQuery}
                disabled={running || !query.trim()}
                className="h-7 px-3 gap-1.5"
              >
                <Play className="h-3 w-3" />
                {running ? "Running..." : "Run"}
              </Button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="w-full px-4 py-3 font-mono text-sm bg-transparent resize-none focus:outline-none min-h-[120px] text-foreground placeholder:text-muted-foreground/50"
            placeholder="SELECT * FROM contributor LIMIT 10;"
          />
        </div>

        {/* Example queries */}
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_QUERIES.map((example) => (
            <button
              key={example.label}
              onClick={() => setQuery(example.sql)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                query === example.sql
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-muted/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {example.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {queryError && (
          <div className="border border-destructive/30 bg-destructive/5 rounded-lg px-4 py-3 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <pre className="text-xs text-destructive font-mono whitespace-pre-wrap wrap-break-word">
              {queryError}
            </pre>
          </div>
        )}

        {/* Results */}
        {result &&
          (result.results.length === 0 ? (
            <div className="border rounded-lg px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Query executed successfully. No rows returned.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {result.duration.toFixed(1)}ms
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats bar */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {result.duration.toFixed(1)}ms
                </span>
                {networkStats && (
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {formatBytes(networkStats.totalFetchedBytes)} fetched
                    {" · "}
                    {networkStats.totalRequests} request
                    {networkStats.totalRequests !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {result.results.map((r, i) => (
                <ResultsTable key={i} result={r} />
              ))}
            </div>
          ))}
      </div>

      {/* Schema sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="border rounded-lg overflow-hidden sticky top-28">
          <div className="px-3 py-2 border-b bg-muted/40">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Schema
            </span>
          </div>
          <div className="divide-y max-h-[calc(100vh-14rem)] overflow-y-auto">
            {schema.map((table) => {
              const isExpanded = expandedTables.has(table.name);
              return (
                <div key={table.name}>
                  <button
                    onClick={() => toggleTable(table.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                    <Table2 className="h-3 w-3 text-primary shrink-0" />
                    <span className="font-mono font-medium truncate">
                      {table.name}
                    </span>
                    <span className="ml-auto text-muted-foreground/60">
                      {table.columns.length}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="pb-1.5">
                      {table.columns.map((col) => (
                        <div
                          key={col.name}
                          className="flex items-center gap-2 px-3 pl-10 py-0.5 text-xs"
                        >
                          <Columns3 className="h-2.5 w-2.5 text-muted-foreground/40 shrink-0" />
                          <span className="font-mono text-muted-foreground truncate">
                            {col.name}
                          </span>
                          <span className="ml-auto text-[10px] text-muted-foreground/50 uppercase">
                            {col.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
