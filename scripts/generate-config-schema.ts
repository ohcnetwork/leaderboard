#!/usr/bin/env tsx
/**
 * Generate JSON Schema from Zod schema
 * This script converts the ConfigSchema to a JSON Schema file
 */

import { writeFile } from "fs/promises";
import { join } from "path";
import { ConfigSchema } from "../packages/plugin-runner/src/config";

async function generateSchema() {
  try {
    // Generate JSON Schema using Zod v4's built-in method
    const jsonSchema = ConfigSchema.toJSONSchema();

    // Add metadata
    const schemaWithMeta = {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "Leaderboard Configuration Schema",
      description: "JSON Schema for leaderboard config.yaml file",
      ...jsonSchema,
    };

    // Write to file
    const outputPath = join(process.cwd(), "config.schema.json");
    await writeFile(
      outputPath,
      JSON.stringify(schemaWithMeta, null, 2) + "\n",
      "utf8"
    );

    console.log("✓ Generated config.schema.json");
  } catch (error) {
    console.error("✗ Failed to generate schema:", error);
    process.exit(1);
  }
}

generateSchema();
