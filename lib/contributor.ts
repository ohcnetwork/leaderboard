import { env } from "@/env.mjs";
import octokit from "@/lib/octokit";
import { parseDateRangeSearchParam } from "@/lib/utils";

const org = env.NEXT_PUBLIC_GITHUB_ORG;

export type DailyReport = Awaited<ReturnType<typeof getDailyReport>>;

export const getDailyReport = async (
  user: string,
  defaultReviews?: Awaited<ReturnType<typeof getPullRequestReviews>>,
) => {
  const dateRange = getDateRange();

  const [pull_requests, commits, reviews, issues_active, issues_pending] =
    await Promise.all([
      getPullRequestsOpened(user, dateRange),
      getCommits(user, dateRange),
      !defaultReviews ? getPullRequestReviews(user, dateRange) : defaultReviews,
      getActiveIssues(user),
      getPendingIssues(user),
    ]);

  return {
    pull_requests,
    commits,
    reviews,
    issues_active,
    issues_pending,
  };
};

const Q = (filters: Record<string, string | string[]>) => {
  const _ = (key: string, value: string) => `${key}:${value}`;

  return Object.entries({ ...filters, org })
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((value) => _(key, value)).join("+");
      }
      return _(key, value);
    })
    .join("+");
};

const getDateRange = () => {
  return parseDateRangeSearchParam(null, 1)
    .map((a) => a.toISOString())
    .join("..");
};

const getUserInfo = async (user: string) => {
  return octokit.rest.users.getByUsername({ username: user });
};

const getPullRequestsOpened = (user: string, dateRange: string) => {
  return octokit.paginate(
    "GET /search/issues",
    {
      q: Q({ author: user, is: "pr", created: dateRange }),
      per_page: 100,
    },
    (res) =>
      res.data.map((issue) => ({
        title: issue.title,
        url: issue.html_url,
      })),
  );
};

const getCommits = (user: string, dateRange: string) => {
  return octokit.paginate(
    "GET /search/commits",
    {
      q: Q({
        author: user,
        committer: user,
        merge: "false",
        "author-date": dateRange,
      }),
      per_page: 100,
    },
    (res) =>
      res.data.map((commit) => ({
        title: commit.commit.message,
        url: commit.html_url,
      })),
  );
};

const getActiveIssues = (user: string) => {
  return octokit.paginate(
    "GET /search/issues",
    {
      q: Q({ assignee: user, is: ["issue", "open"], linked: "pr" }),
      per_page: 100,
    },
    (res) =>
      res.data.map((issue) => ({
        title: issue.title,
        url: issue.html_url,
      })),
  );
};

const getPendingIssues = (user: string) => {
  return octokit.paginate(
    "GET /search/issues",
    {
      q: Q({ assignee: user, is: ["issue", "open"], "-linked": "pr" }),
      per_page: 100,
    },
    (res) =>
      res.data.map((issue) => ({
        title: issue.title,
        url: issue.html_url,
      })),
  );
};

type IGetReviewsResponse = {
  organization: {
    repositories: {
      nodes: Array<{
        name: string;
        pullRequests: {
          nodes: Array<{
            title: string;
            reviews: {
              nodes: Array<{
                author?: { login: string };
                state: string;
                createdAt: string;
                url: string;
              }>;
            };
          }>;
        };
      }>;
    };
  };
};

export const getPullRequestReviews = async (
  user?: string,
  dateRange?: string,
) => {
  const since = new Date(
    (dateRange || getDateRange()).split("..")[0],
  ).getTime();

  const data: IGetReviewsResponse = await (user
    ? octokit.graphql(
        `
      query getReviews($org: String!, $author: String!) {
        organization(login: $org) {
          repositories(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes {
              name
              pullRequests(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {
                nodes {
                  title
                  reviews(last: 10, author: $author) {
                    nodes {
                      state
                      createdAt
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
      `,
        { org, author: user },
      )
    : octokit.graphql(
        `
      query getReviews($org: String!) {
        organization(login: $org) {
          repositories(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes {
              name
              pullRequests(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {
                nodes {
                  title
                  reviews(last: 10) {
                    nodes {
                      author {
                        login
                      }
                      state
                      createdAt
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
      `,
        { org },
      ));

  return data.organization.repositories.nodes.flatMap((repo) =>
    repo.pullRequests.nodes.flatMap((pr) =>
      pr.reviews.nodes
        .filter((review) => new Date(review.createdAt).getTime() > since)
        .map((review) => ({
          author: review.author?.login,
          state: review.state,
          pull_request: pr.title,
          url: review.url,
        })),
    ),
  );
};
