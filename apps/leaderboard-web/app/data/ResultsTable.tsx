"use client";

import type { QueryExecResult } from "sql.js";

interface ResultsTableProps {
  result: QueryExecResult;
}

export default function ResultsTable({ result }: ResultsTableProps) {
  const { columns, values } = result;

  if (columns.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-4">
        Query returned no columns.
      </p>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto max-h-[60vh]">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted/80 backdrop-blur-sm border-b">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-12 tabular-nums">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-xs font-semibold text-foreground whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {values.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-3 py-1.5 text-xs text-muted-foreground tabular-nums">
                  {rowIdx + 1}
                </td>
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className="px-3 py-1.5 font-mono text-xs whitespace-nowrap max-w-80 truncate"
                    title={cell == null ? "NULL" : String(cell)}
                  >
                    {cell == null ? (
                      <span className="text-muted-foreground/50 italic">
                        NULL
                      </span>
                    ) : typeof cell === "number" ? (
                      <span className="text-primary tabular-nums">
                        {cell}
                      </span>
                    ) : (
                      String(cell)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t bg-muted/40 px-3 py-1.5">
        <p className="text-xs text-muted-foreground">
          {values.length} row{values.length !== 1 ? "s" : ""}
          {" · "}
          {columns.length} column{columns.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
