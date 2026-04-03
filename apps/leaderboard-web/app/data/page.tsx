import { getConfig } from "@/lib/config/get-config";
import { getDatabase } from "@/lib/db/client";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import type { TableSchema } from "./SqlRepl";
import SqlRepl from "./SqlRepl";

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();

  if (config.leaderboard.data_explorer?.enabled === false) {
    return {};
  }

  return {
    title: `Data Explorer - ${config.org.name}`,
    description: `Query the ${config.org.name} leaderboard database directly with SQL. Explore contributors, activities, badges, and aggregates.`,
    keywords: [
      "data",
      "sql",
      "query",
      "explorer",
      config.org.name,
      "leaderboard",
      "database",
    ],
  };
}

async function getSchema(): Promise<TableSchema[]> {
  const db = getDatabase();

  const tablesResult = await db.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
  );

  const schema: TableSchema[] = [];

  for (const row of tablesResult.rows) {
    const tableName = row.name as string;
    const columnsResult = await db.execute(
      `PRAGMA table_info('${tableName}');`,
    );

    schema.push({
      name: tableName,
      columns: columnsResult.rows.map((col) => ({
        name: col.name as string,
        type: (col.type as string) || "ANY",
      })),
    });
  }

  return schema;
}

export default async function DataPage() {
  const config = getConfig();

  if (config.leaderboard.data_explorer?.enabled === false) {
    notFound();
  }

  const source = config.leaderboard.data_explorer?.source ?? "/data.db";
  const schema = await getSchema();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Data Explorer</h1>
        <p className="text-sm text-muted-foreground">
          Query the leaderboard database with SQL. The database is loaded in
          your browser via WebAssembly &mdash; all queries run locally.
        </p>
      </div>

      <SqlRepl schema={schema} source={source} />
    </div>
  );
}
