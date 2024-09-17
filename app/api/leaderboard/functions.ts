import {
  LeaderboardSortKey,
  ReleasesResponse,
  LeaderboardAPIResponse,
  Release,
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
    .filter((contributor) => {
      if (sortBy) {
        return contributor.summary[sortBy] ?? 0 > 0;
      }
    })
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
        slug: `${contributor.slug}`,
        name: `${contributor.name}`,
        title: contributor.title,
        role: contributor.role,
        joining_date: contributor.joining_date,
        social: {
          github: `${contributor.github}`,
          linkedin: contributor.linkedin,
          slack: contributor.slack,
          twitter: contributor.twitter,
        },
      },
      highlights: {
        ...contributor.summary,
        pr_stale: contributor.activityData.pr_stale ?? 0,
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
