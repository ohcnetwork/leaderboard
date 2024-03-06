/**
 * Migration to migrate github event timestamps from seconds since epoch to
 * ISO 8601 format.
 */

import { readFile, readdir, writeFile } from "fs/promises";
import path from "path";

const githubDataPath = path.join(__dirname, "data/github");

async function main() {
  const files = await readdir(githubDataPath);
  console.log(`Processing ${files.length} files...`);

  await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(githubDataPath, file);
      const data = JSON.parse(await readFile(filePath));

      data.last_updated = new Date(data.last_updated * 1000).toISOString();
      data.activity = data.activity.map((entry) => {
        return {
          ...entry,
          time: new Date(entry.time * 1000).toISOString(),
        };
      });

      await writeFile(filePath, JSON.stringify(data, undefined, "  "), {
        encoding: "utf-8",
      });
    }),
  );

  console.log("Processed");
}

main();
