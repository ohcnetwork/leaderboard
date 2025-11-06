import { octokit } from "@/scrapers/github/utils/octokit";
import { subDays, subYears } from "date-fns";

const org = process.env.GITHUB_ORG!;
// const apiVersion = process.env.GITHUB_API_VERSION ?? "2022-11-28";

/**
 * Get all repositories from a GitHub organization
 * If since is provided, only get repositories updated since the date
 * @param org - The GitHub organization to get repositories from
 * @param since - The date to start getting repositories from based on the `updated_at` field (optional)
 * @returns An array of repositories
 */
async function getAllRepositories(
  org: string,
  since?: string
): Promise<Array<{ name: string; url: string; updated_at: string }>> {
  const repos = [];

  for await (const response of octokit.paginate.iterator(
    "GET /orgs/{org}/repos",
    {
      org,
      sort: "updated",
    }
  )) {
    for (const repo of response.data) {
      // If since is provided and repo is older than since, stop pagination
      if (
        since &&
        repo.updated_at &&
        new Date(repo.updated_at) < new Date(since)
      ) {
        return repos;
      }

      // Skip repos without required fields
      if (!repo.updated_at) continue;

      repos.push({
        name: repo.name,
        url: repo.html_url,
        updated_at: repo.updated_at,
      });
    }
  }

  return repos;
}

/**
 * Get all issues from a repository
 * If since is provided, only get issues updated since the date
 * @param repo - The repository to get issues from
 * @param since - The date to start getting issues from based on the `updated_at` field (optional)
 * @returns An array of issues
 */
async function getRepoIssues(repo: string, since?: string) {
  const issues = await octokit.paginate(
    "GET /repos/{owner}/{repo}/issues",
    {
      owner: org,
      repo,
      state: "all",
      since,
    },
    (response) =>
      response.data.map((issue) => {
        return {
          title: issue.title,
          url: issue.html_url,
          author: issue.user?.login,
          assignee: issue.assignees?.map((assignee) => assignee.login) ?? [],
          closed_by: issue.closed_by?.login,
          closed_at: issue.closed_at,
          created_at: issue.created_at,
        };
      })
  );
  return issues;
}

async function getRepoPullRequestReviews(repo: string, since?: string) {}

/**
 * Get all pull requests from a repository
 * If since is provided, only get pull requests updated since the date
 * @param repo - The repository to get pull requests from
 * @param since - The date to start getting pull requests from based on the `updated_at` field (optional)
 * @returns An array of pull requests
 */
async function getRepoPullRequests(repo: string, since?: string) {
  const pullRequests = [];

  for await (const response of octokit.paginate.iterator(
    "GET /repos/{owner}/{repo}/pulls",
    { owner: org, repo, state: "all", sort: "updated", direction: "desc" }
  )) {
    for (const pr of response.data) {
      // If since is provided and PR is older than since, stop pagination
      if (since && pr.updated_at && new Date(pr.updated_at) < new Date(since)) {
        return pullRequests;
      }

      // Skip PRs without required fields
      if (!pr.updated_at) continue;

      pullRequests.push({
        title: pr.title,
        number: pr.number,
        updated_at: pr.updated_at,
      });
    }
  }

  return pullRequests;
}

const activityDefinitions = [
  "comment_created",
  "issue_assigned",
  "pr_reviewed",
  "pr_reviewed",
  "issue_opened",
  "pr_opened",
  "pr_merged",
  "pr_collaborated",
  "issue_closed",
] as const;

const events: {
  slug: string;
  contributor: string;
  activity_definition: (typeof activityDefinitions)[number];
  title: string;
  occured_at: string;
  link: string;
  text: string;
  points?: number;
}[] = [];

async function main() {
  // const since = subYears(new Date(), 10).toISOString(); // TODO: make this configurable
  const since = subDays(new Date(), 1).toISOString(); // TODO: make this configurable

  const repositories = await getAllRepositories(org, since);
  console.log(`${repositories.length} repositories found`);

  for (const { name: repo } of repositories) {
    const issues = await getRepoIssues(repo, since);
    console.log(`${repo}: ${issues.length}`);
  }

  for (const { name: repo } of repositories) {
    const pullRequests = await getRepoPullRequests(repo, since);
    console.log(`${repo}: ${pullRequests.length}`);
  }
}

main();
