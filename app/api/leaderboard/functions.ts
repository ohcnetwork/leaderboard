import { LeaderboardSortKey } from "@/lib/types";
import { getContributors } from "@/lib/api";
import {
  ReleasesResponse,
  Repository,
  LeaderboardAPIResponse,
  Release,
} from "@/lib/types";
import { env } from "@/env.mjs";
import { getGitHubAccessToken } from "@/lib/octokit";

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
  const accessToken = getGitHubAccessToken();

  if (!accessToken) {
    return [];
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
        organization(login: "${env.NEXT_PUBLIC_GITHUB_ORG}") {
          repositories(first: 100) {
            nodes {
              name
              releases(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
                nodes {
                  name
                  createdAt
                  description
                  url
                  author {
                    login
                    avatarUrl
                  }
                  mentions (first: 10) {
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
      }`,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = (await response.json()) as ReleasesResponse;
  const repositories: Repository[] = json.data.organization.repositories.nodes;
  const allReleases: Release[] = [];

  for (const repository of repositories) {
    for (const release of repository.releases.nodes) {
      release.repository = repository.name;
      allReleases.push(release);
    }
  }

  const sortedReleases = allReleases.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return sortedReleases.slice(0, sliceLimit);
}
