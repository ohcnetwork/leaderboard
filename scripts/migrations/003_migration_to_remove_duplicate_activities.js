/**
 * Migration to remove duplicate activities from the users data.
 */

const { readFile, readdir, writeFile } = require("fs/promises");
const path = require("path");

const githubDataPath = path.join(__dirname, "../../data-repo/data/github");

const hash = (activity) => {
  if (activity.type === "pr_reviewed") {
    return `${activity.type}--${activity.title}`;
  }
  return `${activity.type}--${activity.link}`;
};

async function main() {
  let files = await readdir(githubDataPath);
  files = files.filter((f) => f.endsWith(".json"));
  console.log(`Processing ${files.length} files...`);

  await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(githubDataPath, file);
      const data = JSON.parse(await readFile(filePath, { encoding: "utf-8" }));

      const before = data.activity.length;
      data.activity = Object.values(
        Object.fromEntries(data.activity.map((event) => [hash(event), event])),
      );
      const after = data.activity.length;
      if (before !== after) {
        await writeFile(filePath, JSON.stringify(data, undefined, "  "), {
          encoding: "utf-8",
        });
      }
    }),
  );

  console.log("Processed");
}

main();
