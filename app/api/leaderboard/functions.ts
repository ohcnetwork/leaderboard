import { LeaderboardSortKey } from "@/app/leaderboard/_components/Leaderboard";
import { getContributors } from "@/lib/api";
import { Highlights } from "@/lib/types";
import { ReleasesResponse } from "@/lib/types";
import { Repository } from "@/lib/types";
import { Release } from "@/lib/types";
import { env } from "@/env.mjs";
import getGitHubAccessToken from "@/lib/getGitHubAccessToken";

export type LeaderboardAPIResponse = {
  user: {
    slug: string;
    name: string;
    title: string;
    role: ("core" | "intern" | "operations" | "contributor")[];
    content: string;
    social: ContributorSocials;
    joining_date: string;
  };
  highlights: Highlights & { pr_stale: number };
}[];

type ContributorSocials = {
  github: string;
  twitter: string;
  linkedin: string;
  slack: string;
};

type OrderingKey = LeaderboardSortKey | `-${LeaderboardSortKey}`;

export const getLeaderboardData = async (
  dateRange: readonly [Date, Date],
  ordering: OrderingKey,
  role: ("core" | "intern" | "operations" | "contributor")[],
) => {
  const sortBy = ordering.replace("-", "") as LeaderboardSortKey;
  const shouldReverse = !ordering.startsWith("-");

  const contributors = await getContributors();

  let data = contributors
    .filter((a) => a.highlights.points)
    .map((contributor) => ({
      ...contributor,
      summary: contributor.summarize(...dateRange),
    }))
    .filter(
      (contributor) => contributor.summary.points && contributor.first_activity,
    )
    .filter((contributor) => {
      if (role.length === 0) return true;
      if (role.includes("core") && contributor.core) return true;
      if (role.includes("intern") && contributor.intern) return true;
      if (role.includes("operations") && contributor.operations) return true;
      if (
        role.includes("contributor") &&
        !contributor.core &&
        !contributor.intern &&
        !contributor.operations
      )
        return true;
      return false;
    })

    .sort((a, b) => {
      if (
        a.first_activity !== undefined &&
        b.first_activity !== undefined &&
        sortBy === "new_contributor"
      ) {
        return (
          new Date(b.first_activity).getTime() -
          new Date(a.first_activity).getTime()
        );
      }
      if (sortBy === "pr_stale") {
        return b.activityData.pr_stale - a.activityData.pr_stale;
      }
      if (sortBy !== "new_contributor") {
        return (b.summary[sortBy] ?? 0) - (a.summary[sortBy] ?? 0);
      }
      return 0;
    });

  if (shouldReverse) {
    data.reverse();
  }

  if (sortBy === "new_contributor") {
    data = data
      .filter((a) => {
        if (
          a.first_activity !== undefined &&
          typeof a.first_activity === "string"
        ) {
          let date = new Date(dateRange[1]);
          date.setDate(date.getDate() - 8);

          return (
            new Date(a.first_activity) > date &&
            new Date(a.first_activity) < new Date(dateRange[1])
          );
        }
      })
      .sort((a, b) => {
        return b.highlights.points - a.highlights.points;
      });
  }
  return data.map((contributor): LeaderboardAPIResponse[number] => {
    const role: LeaderboardAPIResponse[number]["user"]["role"] = [];

    if (contributor.intern) role.push("intern");
    if (contributor.operations) role.push("operations");
    if (contributor.core) role.push("core");
    if (!role.length) role.push("contributor");

    return {
      user: {
        slug: contributor.slug,
        name: contributor.name,
        title: contributor.title,
        role: role,
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
