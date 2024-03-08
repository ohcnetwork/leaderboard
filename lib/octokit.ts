import "server-only";
import { env } from "@/env.mjs";
import { Octokit } from "octokit";

export const getGitHubAccessToken = () => {
  const accessToken = env.GITHUB_PAT as string | null;

  if (!accessToken) {
    if (process.env.NODE_ENV === "development") {
      console.warn("GITHUB_PAT is not configured in the environment.");
      return;
    }

    throw "GITHUB_PAT is not configured in the environment.";
  }

  return accessToken;
};

const octokit = new Octokit({
  auth: getGitHubAccessToken(),
});

export default octokit;
