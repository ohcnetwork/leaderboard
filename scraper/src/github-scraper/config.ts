import { Octokit } from "octokit";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("GITHUB_TOKEN not found in environment");
  process.exit(1);
}

export const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});
