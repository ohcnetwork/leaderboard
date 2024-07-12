import { ParsedDiscussion } from "@/scraper/src/github-scraper/types";
import fs from "fs";
import path, { join } from "path";
import stripJsonComments from "strip-json-comments";

const cwd = process.cwd();

const GH_DATA = join(
  cwd,
  process.env.DATA_REPO ?? "data-repo",
  "../data/github/discussions",
);
export const categoriesMap = new Map();

export async function fetchGithubDiscussion(noOfDiscussion?: number) {
  const filesInDir = fs
    .readdirSync(GH_DATA)
    .filter((file) => path.extname(file) === ".json");

  const discussions = filesInDir.map((file) => {
    const content = fs.readFileSync(path.join(GH_DATA, file)).toString();
    return JSON.parse(stripJsonComments(content));
  });
  discussions[0].forEach((d: ParsedDiscussion) => {
    if (d.category) {
      const key = `${d.category.name}-${d.category.emoji}`;
      if (!categoriesMap.has(key)) {
        categoriesMap.set(key, d.category);
      }
    }
  });

  return noOfDiscussion
    ? discussions[0].slice(0, noOfDiscussion)
    : discussions[0];
}

export async function fetchGithubDiscussionForUser(user?: string) {
  const filesInDir = fs
    .readdirSync(GH_DATA)
    .filter((file) => path.extname(file) === ".json");

  const discussions = filesInDir.map((file) => {
    const content = fs.readFileSync(path.join(GH_DATA, file)).toString();
    return JSON.parse(stripJsonComments(content));
  });

  return (
    user &&
    discussions[0].filter(
      (discussion: ParsedDiscussion) =>
        (discussion.participants ?? []).includes(user) ||
        discussion.author === user,
    )
  );
}
