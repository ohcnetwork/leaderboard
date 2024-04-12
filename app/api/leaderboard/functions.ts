import {
  LeaderboardSortKey,
  ReleasesResponse,
  LeaderboardAPIResponse,
  Release,
  Repository,
} from "@/lib/types";
import { getContributors } from "@/lib/api";
import { env } from "@/env.mjs";
import octokit from "@/lib/octokit";

export const getLeaderboardData = async (
  dateRange: readonly [Date, Date],
  sortBy: LeaderboardSortKey = "points",
  ordering: "asc" | "desc" = "desc",
  roles: ("core" | "intern" | "operations" | "contributor")[] = [],
) => {
  const contributors = await getContributors();

  const data = contributors
    .filter((a) => a.highlights.points)
    .map((contributor) => ({
      ...contributor,
      summary: contributor.summarize(...dateRange),
    }))
    .filter((contributor) => contributor.summary.points)
    .filter(
      (contributor) => roles.length == 0 || roles.includes(contributor.role),
    )
    .sort((a, b) => {
      if (sortBy === "pr_stale") {
        return b.activityData.pr_stale - a.activityData.pr_stale;
      }
      return b.summary[sortBy] - a.summary[sortBy];
    });

  if (ordering === "asc") {
    data.reverse();
  }

  return data.map((contributor): LeaderboardAPIResponse[number] => {
    return {
      user: {
        slug: contributor.slug,
        name: contributor.name,
        title: contributor.title,
        role: contributor.role,
        content: contributor.content,
        joining_date: contributor.joining_date,
        social: {
          github: contributor.github,
          linkedin: contributor.linkedin,
          slack: contributor.slack,
          twitter: contributor.twitter,
        },
      },
      highlights: {
        ...contributor.summary,
        pr_stale: contributor.activityData.pr_stale,
      },
    };
  });
};

export default async function fetchGitHubReleases(
  sliceLimit: number,
): Promise<Release[]> {
  const response: ReleasesResponse = await octokit.graphql({
    query: `
        query GetReleases($org: String!) {
          organization(login: $org) {
            repositories(first: 100, orderBy: { field: UPDATED_AT, direction: DESC })  {
              nodes {
                name
                releases(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
                  nodes {
                    name
                    tag{
                      name
                    }
                    createdAt
                    description
                    url
                    author {
                      login
                      avatarUrl
                    }
                    mentions (first: 100) {
                      nodes {
                        login
                        avatarUrl
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
    org: env.NEXT_PUBLIC_GITHUB_ORG,
  });
  return response.organization.repositories.nodes
    .flatMap((repository) =>
      repository.releases.nodes.map((release) => ({
        ...release,
        name: release.tag.name,
        repository: repository.name,
      })),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, sliceLimit);
}

interface RepositoriesResponse {
  organization: {
    repositories: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      nodes: Repository[];
    };
  };
}
export async function fetchAllReposName() {
  let repos: string[] = [];
  let afterCursor: string | null = null;

  do {
    const response: RepositoriesResponse = await octokit.graphql({
      query: `
        query GetTop10ActiveRepos($org: String!, $after: String) {
          organization(login: $org) {
            repositories(first: 20, after: $after, orderBy: { field: UPDATED_AT, direction: DESC }) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                name
              }
            }
          }
        }
      `,
      org: env.NEXT_PUBLIC_GITHUB_ORG,
      after: afterCursor,
    });
    const { nodes, pageInfo } = response.organization.repositories;
    repos.push(...nodes.map((repo) => repo.name));
    afterCursor = pageInfo.hasNextPage ? pageInfo.endCursor : null;
  } while (afterCursor !== null);

  return repos;
}
