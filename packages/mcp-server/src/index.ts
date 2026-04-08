#!/usr/bin/env node

/**
 * Leaderboard MCP Server
 * Main entry point with CLI argument parsing
 */

import { runServer } from "./server.js";
import type { ServerConfig } from "./types.js";
import { getDataDir } from "./utils.js";

function parseArgs(): ServerConfig {
  const args = process.argv.slice(2);

  const config: ServerConfig = {
    name: "leaderboard-mcp",
    version: "0.1.0",
    transport: "stdio",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--transport":
        const transport = args[++i];
        if (transport !== "stdio" && transport !== "http") {
          console.error('Invalid transport. Use "stdio" or "http"');
          process.exit(1);
        }
        config.transport = transport;
        break;

      case "--port":
        config.httpPort = parseInt(args[++i], 10);
        if (isNaN(config.httpPort)) {
          console.error("Invalid port number");
          process.exit(1);
        }
        break;

      case "--data-dir":
        config.dataDir = args[++i];
        break;

      case "--db-url":
        config.dbUrl = args[++i];
        break;

      case "--help":
      case "-h":
        console.log(`
Leaderboard MCP Server

Usage:
  leaderboard-mcp [options]

Options:
  --transport <type>    Transport type: stdio (default) or http
  --port <number>       HTTP port (default: 3001, only for HTTP transport)
  --data-dir <path>     Path to leaderboard data directory
  --db-url <url>        Database URL (overrides data-dir)
  --help, -h            Show this help message

Environment Variables:
  LEADERBOARD_DATA_DIR  Default data directory
  LIBSQL_DB_URL         Database URL

Examples:
  # Run with stdio transport (for Claude Desktop)
  leaderboard-mcp

  # Run with HTTP transport
  leaderboard-mcp --transport http --port 3001

  # Specify data directory
  leaderboard-mcp --data-dir /path/to/data

  # Use specific database URL
  leaderboard-mcp --db-url file:/path/to/database.db
`);
        process.exit(0);
        break;

      default:
        console.error(`Unknown option: ${arg}`);
        console.error('Use --help for usage information');
        process.exit(1);
    }
  }

  // Set data directory if not specified
  if (!config.dataDir) {
    config.dataDir = getDataDir();
  }

  return config;
}

async function main() {
  try {
    const config = parseArgs();

    console.error(`Starting Leaderboard MCP Server...`);
    console.error(`Transport: ${config.transport}`);
    console.error(`Data Directory: ${config.dataDir}`);

    if (config.transport === "http") {
      console.error(`HTTP Port: ${config.httpPort || 3001}`);
    }

    await runServer(config);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();
