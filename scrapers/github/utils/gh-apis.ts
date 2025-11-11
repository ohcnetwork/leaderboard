import { octokit } from "@/scrapers/github/utils/octokit";
import { Activity } from "@/types/db";
import { subDays } from "date-fns";
import {
  addActivities,
  addContributors,
  getDb,
  upsertActivityDefinitions,
} from "./db";

const org = process.env.GITHUB_ORG!;
// const apiVersion = process.env.GITHUB_API_VERSION ?? "2022-11-28";

/**
 * Get all repositories from a GitHub organization
 * If since is provided, only get repositories updated since the date
 * @param org - The GitHub organization to get repositories from
 * @param since - The date to start getting repositories from based on the `updated_at` field (optional)
 * @returns An array of repositories
 */
async function getRepositories(org: string, since?: string) {
  const repos = [];

  for await (const response of octokit.paginate.iterator(
    "GET /orgs/{org}/repos",
    {
      org,
      sort: "pushed",
    }
  )) {
    console.log(`Found ${response.data.length} repositories`);
    for (const repo of response.data) {
      // If since is provided and repo is older than since, stop pagination
      if (
        since &&
        repo.pushed_at &&
        new Date(repo.pushed_at) < new Date(since)
      ) {
        return repos;
      }

      // Skip repos without required fields
      if (!repo.pushed_at) continue;

      repos.push({
        name: repo.name,
        url: repo.html_url,
        defaultBranch: repo.default_branch,
      });
    }
  }

  return repos;
}

/**
 * Get all pull requests and their reviews from a repository using GraphQL
 * If since is provided, only get pull requests updated since the date
 * @param repo - The repository to get pull requests from
 * @param since - The date to start getting pull requests from based on the `updated_at` field (optional)
 * @returns An array of pull requests with their reviews
 */
async function getPRsAndReviews(repo: string, since?: string) {
  const pullRequests = [];

  let hasNextPage = true;
  let cursor: string | null = null;

  console.log(`Fetching pull requests from ${repo}...`);

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
              mergedBy {
                login
              }
              reviews(first: 100) {
                nodes {
                  id
                  author {
                    login
                  }
                  state
                  submittedAt
                  url
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
            mergedBy: { login: string | null };
            reviews: {
              nodes: Array<{
                author: { login: string | null };
                id: string;
                state: string;
                submittedAt: string | null;
                url: string | null;
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

    console.log(`Found ${prs.length} pull requests`);

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
        merged_by: pr.mergedBy?.login ?? null,
        reviews: pr.reviews.nodes.map((review) => ({
          id: review.id,
          author: review.author?.login ?? null,
          state: review.state,
          submitted_at: review.submittedAt,
          html_url: review.url,
        })),
      });
    }

    hasNextPage = response.repository.pullRequests.pageInfo.hasNextPage;
    cursor = response.repository.pullRequests.pageInfo.endCursor;
  }

  return pullRequests;
}

async function getComments(repo: string, since?: string) {
  console.log(`Fetching comments from ${repo}...`);

  const comments = await octokit.paginate(
    "GET /repos/{owner}/{repo}/issues/comments",
    { owner: org, repo, since, sort: "updated", direction: "desc" },
    (response) =>
      response.data.map((comment) => ({
        id: comment.node_id,
        issue_number: comment.issue_url.split("/").pop(),
        body: comment.body,
        created_at: comment.created_at,
        author: comment.user?.login,
        html_url: comment.html_url,
      }))
  );

  console.log(`Found ${comments.length} comments`);

  return comments;
}

/**
 * Get all issues and assign events from a repository
 * If since is provided, only get issues updated since the date
 * @param repo - The repository to get issues from
 * @param since - The date to start getting issues from based on the `updated_at` field (optional)
 * @returns An array of issues
 */
export async function getIssues(repo: string, since?: string) {
  const issues = [];

  let hasNextPage = true;
  let cursor: string | null = null;

  console.log(`Fetching issues from ${repo}...`);

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
              closed
              closedAt
              createdAt
              timelineItems(itemTypes: [ASSIGNED_EVENT, CLOSED_EVENT], first: 50) {
                nodes {
                  ... on AssignedEvent {
                    createdAt
                    assignee {
                      __typename
                      ... on User { login }
                      ... on Mannequin { login }
                    }
                  }
                  ... on ClosedEvent {
                    createdAt
                    actor { login }
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
            closed: boolean;
            timelineItems: {
              nodes: Array<
                | {
                    __typename?: "AssignedEvent";
                    createdAt: string;
                    actor: { login: string | null };
                    assignee: { login: string | null };
                  }
                | {
                    __typename?: "ClosedEvent";
                    createdAt: string;
                    actor: { login: string | null };
                  }
              >;
            };
          }>;
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
          };
        };
      };
    } = await octokit.graphql(query, { owner: org, repo, cursor });

    const allIssues = response.repository.issues.nodes;

    for (const issue of allIssues) {
      // Optional stop if issue is older than `since`
      if (since && new Date(issue.updatedAt) < new Date(since)) {
        return issues;
      }

      const assignedEvents =
        issue.timelineItems.nodes?.filter(
          (e): e is Extract<typeof e, { assignee: unknown }> =>
            "assignee" in e && e.createdAt !== undefined
        ) ?? [];

      const closedEvent = issue.timelineItems.nodes?.find(
        (e): e is Extract<typeof e, { __typename?: "ClosedEvent" }> =>
          !("assignee" in e)
      );

      issues.push({
        number: issue.number,
        title: issue.title,
        url: issue.url,
        author: issue.author?.login,
        closed_at: issue.closedAt,
        closed: issue.closed,
        closed_by: closedEvent?.actor?.login ?? null,
        created_at: issue.createdAt,
        assign_events: assignedEvents.map((e) => ({
          createdAt: e.createdAt,
          assignee: e.assignee?.login,
        })),
      });
    }

    hasNextPage = response.repository.issues.pageInfo.hasNextPage;
    cursor = response.repository.issues.pageInfo.endCursor;
  }

  return issues;
}

/**
 * Get all commits from push events of a repository from its events API.
 * @param repo - The repository to get commits from
 * @param since - The date to start getting commits from based on the push event's `created_at` field (optional)
 * @returns An array of commits
 */
export async function getCommitsFromPushEvents(
  repo: string,
  since?: string
): ReturnType<typeof getBranchCommits> {
  const commits = [];

  // Iterate through repository events using paginate.iterator
  for await (const response of octokit.paginate.iterator(
    "GET /repos/{owner}/{repo}/events",
    {
      owner: org,
      repo,
      per_page: 100,
    }
  )) {
    for (const event of response.data) {
      // Check if event is older than since parameter - if so, stop pagination
      if (
        since &&
        event.created_at &&
        new Date(event.created_at) < new Date(since)
      ) {
        return commits;
      }

      // Only process PushEvents
      if (event.type !== "PushEvent") {
        continue;
      }

      const payload = event.payload as {
        head?: string;
        before?: string;
        ref?: string;
      };

      // Skip events without required payload fields or initial pushes (before is null)
      if (!payload.head || !payload.before || !payload.ref) {
        continue;
      }

      // Extract branch name from ref (strip "refs/heads/" prefix)
      const branchName = payload.ref.replace("refs/heads/", "");

      try {
        // Use Compare API to get commits between before and head
        const compareResponse = await octokit.request(
          "GET /repos/{owner}/{repo}/compare/{basehead}",
          {
            owner: org,
            repo,
            basehead: `${payload.before}...${payload.head}`,
          }
        );

        // Extract and transform commits to match expected structure
        for (const commit of compareResponse.data.commits) {
          commits.push({
            commitId: commit.sha,
            branchName,
            commitMessage: commit.commit.message?.split("\n")[0] ?? "", // Get headline (first line)
            committedDate: commit.commit.committer?.date ?? null,
            author: commit.author?.login ?? null,
            url: commit.html_url,
          });
        }
      } catch (error) {
        // Skip this push event if compare fails (e.g., commits deleted, force push)
        console.error(
          `Failed to compare ${payload.before}...${payload.head} in ${repo}:`,
          error
        );
        continue;
      }
    }
  }

  return commits;
}

export async function getBranchCommits(repo: string, branch: string) {
  const commits = await octokit.paginate(
    "GET /repos/{owner}/{repo}/commits",
    { owner: org, repo, sha: branch },
    (response) =>
      response.data.map((commit) => ({
        commitId: commit.sha,
        branchName: branch,
        commitMessage: commit.commit.message,
        committedDate: commit.commit.committer?.date ?? null,
        author: commit.author?.login ?? null,
        url: commit.html_url,
      }))
  );
  return commits;
}

export enum ActivityDefinition {
  ISSUE_OPENED = "issue_opened",
  ISSUE_CLOSED = "issue_closed",
  PR_OPENED = "pr_opened",
  PR_CLOSED = "pr_closed",
  PR_MERGED = "pr_merged",
  PR_REVIEWED = "pr_reviewed",
  PR_COLLABORATED = "pr_collaborated",
  ISSUE_ASSIGNED = "issue_assigned",
  COMMENT_CREATED = "comment_created",
  COMMIT_CREATED = "commit_created",
}

function activitiesFromIssues(
  issues: Awaited<ReturnType<typeof getIssues>>,
  repo: string
) {
  const activities: Activity[] = [];

  // Voluntarily making the slug the key to track the latest assign event for each issue
  // We cannot have multiple duplicate activity entry with same slug in a DB insert statement even though we are doing ON CONFLICT DO UPDATE
  const lastestIssueAssignEvents: Record<string, Omit<Activity, "slug">> = {};

  for (const issue of issues) {
    if (!issue.author) {
      continue;
    }

    // Issue opened
    activities.push({
      slug: `${ActivityDefinition.ISSUE_OPENED}_${repo}#${issue.number}`,
      contributor: issue.author,
      activity_definition: ActivityDefinition.ISSUE_OPENED,
      title: `Opened issue #${issue.number}`,
      text: issue.title,
      occured_at: new Date(issue.created_at),
      link: issue.url,
      points: null,
      meta: {},
    });

    // Issue assign events
    for (const assignEvent of issue.assign_events) {
      if (!assignEvent.assignee) {
        continue;
      }

      // TODO: figure out how to make the slug not depend on assignee username (since username can change)
      const slug = `${ActivityDefinition.ISSUE_ASSIGNED}_${repo}#${issue.number}_${assignEvent.assignee}`;

      // Skip if the assign event is older than the latest assign event for this issue
      if (
        lastestIssueAssignEvents[slug] &&
        lastestIssueAssignEvents[slug].occured_at >
          new Date(assignEvent.createdAt)
      ) {
        continue;
      }

      lastestIssueAssignEvents[slug] = {
        contributor: assignEvent.assignee,
        activity_definition: ActivityDefinition.ISSUE_ASSIGNED,
        title: `Issue #${issue.number} assigned`,
        text: issue.title,
        occured_at: new Date(assignEvent.createdAt),
        link: issue.url,
        points: null,
        meta: {},
      };
    }

    // Issue closed
    if (issue.closed && issue.closed_at && issue.closed_by) {
      activities.push({
        slug: `${ActivityDefinition.ISSUE_CLOSED}_${repo}#${issue.number}`,
        contributor: issue.closed_by,
        activity_definition: ActivityDefinition.ISSUE_CLOSED,
        title: `Closed issue #${issue.number}`,
        text: issue.title,
        occured_at: new Date(issue.closed_at),
        link: issue.url,
        points: null,
        meta: {},
      });
    }
  }

  // Append the latest assign events to activities
  for (const [slug, activity] of Object.entries(lastestIssueAssignEvents)) {
    activities.push({ slug, ...activity });
  }

  return activities;
}

function activitiesFromComments(
  comments: Awaited<ReturnType<typeof getComments>>,
  repo: string
) {
  const activities: Activity[] = [];
  for (const comment of comments) {
    if (!comment.author) {
      continue;
    }

    // Comment created
    activities.push({
      slug: `${ActivityDefinition.COMMENT_CREATED}_${repo}#${comment.issue_number}_${comment.id}`,
      contributor: comment.author,
      activity_definition: ActivityDefinition.COMMENT_CREATED,
      title: `Commented on #${comment.issue_number}`,
      text: null,
      occured_at: new Date(comment.created_at),
      link: comment.html_url,
      points: null,
      meta: {},
    });
  }
  return activities;
}

function activitiesFromPullRequests(
  pullRequests: Awaited<ReturnType<typeof getPRsAndReviews>>,
  repo: string
) {
  const activities: Activity[] = [];

  for (const pullRequest of pullRequests) {
    if (!pullRequest.author) {
      continue;
    }

    // PR opened
    activities.push({
      slug: `${ActivityDefinition.PR_OPENED}_${repo}#${pullRequest.number}`,
      contributor: pullRequest.author,
      activity_definition: ActivityDefinition.PR_OPENED,
      title: `Opened pull request #${pullRequest.number}`,
      text: pullRequest.title,
      occured_at: new Date(pullRequest.created_at),
      link: pullRequest.url,
      points: null,
      meta: {},
    });

    // PR merged
    if (pullRequest.merged_at && pullRequest.merged_by) {
      activities.push({
        slug: `${ActivityDefinition.PR_MERGED}_${repo}#${pullRequest.number}`,
        contributor: pullRequest.author,
        activity_definition: ActivityDefinition.PR_MERGED,
        title: `Merged pull request #${pullRequest.number}`,
        text: pullRequest.title,
        occured_at: new Date(pullRequest.merged_at),
        link: pullRequest.url,
        points: null,
        meta: {},
      });
    }

    // PR review events
    for (const review of pullRequest.reviews) {
      if (!review.author) {
        continue;
      }

      const title = {
        COMMENTED: `Reviewed PR #${pullRequest.number}`,
        APPROVED: `Approved PR #${pullRequest.number}`,
        CHANGES_REQUESTED: `Changes requested on PR #${pullRequest.number}`,
      };

      // Skip review events such as DISMISSED and PENDING.
      if (!title[review.state as keyof typeof title]) {
        continue;
      }

      activities.push({
        slug: `${ActivityDefinition.PR_REVIEWED}_${repo}#${pullRequest.number}_${review.state}_${review.id}`,
        contributor: review.author,
        activity_definition: ActivityDefinition.PR_REVIEWED,
        title: title[review.state as keyof typeof title],
        text: pullRequest.title,
        occured_at: new Date(review.submitted_at!),
        link: review.html_url,
        points: null,
        meta: {},
      });
    }
  }

  return activities;
}

function findActivitiesWithDuplicateSlug(activities: Activity[]) {
  const slugCount = new Map<string, number>();

  for (const activity of activities) {
    slugCount.set(activity.slug, (slugCount.get(activity.slug) ?? 0) + 1);

    if (slugCount.get(activity.slug) && slugCount.get(activity.slug)! > 1) {
      console.log(JSON.stringify(activity, null, 2));
    }
  }

  // TODO: report to sentry if there are any activities with duplicate slugs
}

function getActivitiesFromCommits(
  commits: Awaited<ReturnType<typeof getCommitsFromPushEvents>>
) {
  const activities: Activity[] = [];

  for (const commit of commits) {
    if (!commit.author || !commit.committedDate) {
      continue;
    }

    activities.push({
      slug: `${ActivityDefinition.COMMIT_CREATED}_${commit.branchName}_${commit.commitId}`,
      contributor: commit.author,
      activity_definition: ActivityDefinition.COMMIT_CREATED,
      title: `Pushed commit to ${commit.branchName}`,
      text: commit.commitMessage,
      occured_at: new Date(commit.committedDate),
      link: commit.url,
      points: null,
      meta: {},
    });
  }

  return activities;
}

async function main() {
  const since = subDays(new Date(), 7).toISOString(); // TODO: make this configurable

  await upsertActivityDefinitions();

  for (const { name: repository } of await getRepositories(org, since)) {
    // Parallelize the fetching of activities from repository
    // and then combine the activities into a single array
    const activities = await Promise.all([
      getIssues(repository, since),
      getComments(repository, since),
      getPRsAndReviews(repository, since),
      getCommitsFromPushEvents(repository, since),
    ]).then(([issues, comments, pullRequests, commits]) => [
      // yields: Issue Opened, Issue Assigned, Issue Closed
      ...activitiesFromIssues(issues, repository),
      // yields: Comment Created
      ...activitiesFromComments(comments, repository),
      // yields: PR Opened, PR Merged, PR Reviewed
      ...activitiesFromPullRequests(pullRequests, repository),
      // yields: Commit Created
      ...getActivitiesFromCommits(commits),
    ]);

    findActivitiesWithDuplicateSlug(activities); // TODO: report to sentry if there are any activities with duplicate slugs

    await addContributors(activities.map((a) => a.contributor));
    await addActivities(activities);
  }

  // TODO: slack scraper
  // TODO: import role from existing data
  // TODO: leaderboard activity defintion type based leaderboard
  // TODO: cleanup theme
  // TODO: exclude bots
  // TODO: people page
  // TODO: pull entire history
  // TODO: exclude merge commits
  // TODO: setup footer
  // TODO: add pr_collaborated activities
}

main();
