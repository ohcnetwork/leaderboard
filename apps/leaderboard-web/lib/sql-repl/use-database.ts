"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { QueryExecResult } from "sql.js";
import type { WorkerHttpvfs } from "sql.js-httpvfs";

export type DatabaseStatus = "idle" | "loading" | "ready" | "error";

export interface QueryResult {
  results: QueryExecResult[];
  duration: number;
}

export function useDatabase(source: string = "/data.db") {
  const [status, setStatus] = useState<DatabaseStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<WorkerHttpvfs | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setStatus("loading");
      setError(null);

      try {
        const { createDbWorker } = await import("sql.js-httpvfs");

        const worker = await createDbWorker(
          [
            {
              from: "inline",
              config: {
                serverMode: "full",
                requestChunkSize: 4096,
                url: source,
              },
            },
          ],
          "/sqlite.worker.js",
          "/sql-wasm.wasm",
        );

        if (cancelled) return;

        workerRef.current = worker;
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [source]);

  const exec = useCallback(async (sql: string): Promise<QueryResult> => {
    const worker = workerRef.current;
    if (!worker) throw new Error("Database not initialized");

    const start = performance.now();
    const results = await worker.db.exec(sql);
    const duration = performance.now() - start;

    return { results, duration };
  }, []);

  const getStats = useCallback(async () => {
    const worker = workerRef.current;
    if (!worker) return null;
    return await worker.worker.getStats();
  }, []);

  return { status, error, exec, getStats };
}
