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

/**
 * Get all pull requests and their reviews from a repository using GraphQL
 * If since is provided, only get pull requests updated since the date
 * @param repo - The repository to get pull requests from
 * @param since - The date to start getting pull requests from based on the `updated_at` field (optional)
 * @returns An array of pull requests with their reviews
 */
async function getRepoPullRequestsAndReviews(repo: string, since?: string) {
  const pullRequests = [];

  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const query = `
      query($owner: String!, $repo: String!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
          pullRequests(
            first: 100
            orderBy: { field: UPDATED_AT, direction: DESC }
            after: $cursor
          ) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              number
              title
              url
              author {
                login
              }
              updatedAt
              createdAt
              mergedAt
              closedAt
              reviews(first: 100) {
                nodes {
                  author {
                    login
                  }
                  state
                  submittedAt
                }
              }
            }
          }
        }
      }
    `;

    const response: {
      repository: {
        pullRequests: {
          nodes: Array<{
            number: number;
            title: string;
            url: string;
            author: { login: string | null };
            updatedAt: string;
            createdAt: string;
            mergedAt: string | null;
            closedAt: string | null;
            reviews: {
              nodes: Array<{
                author: { login: string | null };
                state: string;
                submittedAt: string | null;
              }>;
            };
          }>;
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
          };
        };
      };
    } = await octokit.graphql(query, {
      owner: org,
      repo,
      cursor,
    });

    const prs = response.repository.pullRequests.nodes;

    for (const pr of prs) {
      // If since is provided and PR is older than since, stop pagination
      if (since && pr.updatedAt && new Date(pr.updatedAt) < new Date(since)) {
        return pullRequests;
      }

      // Skip PRs without required fields
      if (!pr.updatedAt) continue;

      pullRequests.push({
        number: pr.number,
        title: pr.title,
        url: pr.url,
        author: pr.author?.login ?? null,
        updated_at: pr.updatedAt,
        created_at: pr.createdAt,
        merged_at: pr.mergedAt,
        closed_at: pr.closedAt,
        reviews: pr.reviews.nodes.map((review) => ({
          author: review.author?.login ?? null,
          state: review.state,
          submitted_at: review.submittedAt,
        })),
      });
    }

    hasNextPage = response.repository.pullRequests.pageInfo.hasNextPage;
    cursor = response.repository.pullRequests.pageInfo.endCursor;
  }

  return pullRequests;
}

async function getRepoComments(repo: string, since?: string) {
  const comments = await octokit.paginate(
    "GET /repos/{owner}/{repo}/issues/comments",
    { owner: org, repo, since, sort: "updated", direction: "desc" },
    (response) =>
      response.data.map((comment) => ({
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        author: comment.user?.login,
        issue_url: comment.issue_url,
      }))
  );
  return comments;
}

export async function getAssignedIssues(repo: string, since?: string) {
  const issues: {
    number: number;
    title: string;
    url: string;
    author: { login: string | null };
    closedAt: string | null;
    updatedAt: string;
    createdAt: string;
    assignedEvents: Array<{
      createdAt: string;
      actor: { login: string | null };
      assignee: { login: string | null };
    }>;
  }[] = [];

  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const query = `
      query($owner: String!, $repo: String!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
          issues(first: 50, orderBy: { field: UPDATED_AT, direction: DESC }, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              number
              title
              url
              updatedAt
              author { login }
              closedAt
              createdAt
              timelineItems(itemTypes: [ASSIGNED_EVENT], first: 10) {
                nodes {
                  ... on AssignedEvent {
                    createdAt
                    actor { login }
                    assignee {
                      __typename
                      ... on User { login }
                      ... on Mannequin { login }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response: {
      repository: {
        issues: {
          nodes: Array<{
            number: number;
            title: string;
            url: string;
            author: { login: string | null };
            updatedAt: string;
            closedAt: string | null;
            createdAt: string;
            timelineItems: {
              nodes: Array<{
                createdAt: string;
                actor: { login: string | null };
                assignee: { login: string | null };
              }>;
            };
          }>;
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
          };
        };
      };
    } = await octokit.graphql(query, {
      owner: org,
      repo,
      cursor,
    });

    const allIssues = response.repository.issues.nodes;

    for (const issue of allIssues) {
      // Optional stop if issue is older than `since`
      if (since && new Date(issue.updatedAt) < new Date(since)) {
        return issues;
      }

      const assignedEvents =
        issue.timelineItems.nodes?.filter((e) => e.createdAt) ?? [];

      issues.push({
        number: issue.number,
        title: issue.title,
        url: issue.url,
        author: { login: issue.author?.login ?? null },
        closedAt: issue.closedAt,
        updatedAt: issue.updatedAt,
        createdAt: issue.createdAt,
        assignedEvents: assignedEvents.map((e) => ({
          createdAt: e.createdAt,
          actor: { login: e.actor?.login ?? null },
          assignee: { login: e.assignee?.login ?? null },
        })),
      });
    }

    hasNextPage = response.repository.issues.pageInfo.hasNextPage;
    cursor = response.repository.issues.pageInfo.endCursor;
  }

  return issues;
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
    const pullRequests = await getRepoPullRequestsAndReviews(repo, since);
    console.log(JSON.stringify(pullRequests, null, 2));
  }

  for (const { name: repo } of repositories) {
    const comments = await getRepoComments(repo, since);
    console.log(JSON.stringify(comments, null, 2));
  }
  for (const { name: repo } of repositories) {
    const assignedIssues = await getAssignedIssues(repo, since);
    console.log(JSON.stringify(assignedIssues, null, 2));
  }
}

main();
