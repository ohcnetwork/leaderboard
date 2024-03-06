/**
 * Migration to remove duplicate activities from the users data.
 */

const { readFile, readdir, writeFile } = require("fs/promises");
const path = require("path");

const githubDataPath = path.join(__dirname, "../../data-repo/data/github");

async function main() {
  const files = await readdir(githubDataPath);
  console.log(`Processing ${files.length} files...`);

  await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(githubDataPath, file);
      const data = JSON.parse(await readFile(filePath));

      data.activity = Object.values(
        Object.fromEntries(
          data.activity.map((event) => [JSON.stringify(event), event]),
        ),
      );
      await writeFile(filePath, JSON.stringify(data, undefined, "  "), {
        encoding: "utf-8",
      });
    }),
  );

  console.log("Processed");
}

main();
