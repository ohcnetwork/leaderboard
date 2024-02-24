import { NextRequest, NextResponse } from "next/server";
import { GraphQLClient } from "graphql-request";

export default interface Release {
  name: string;
  createdAt: string;
  description: string;
  url: string;
  repository: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  mentions: {
    nodes: {
      login: string;
      avatarUrl: string;
    }[];
  };
}

interface Repository {
  name: string;
  releases: {
    nodes: Release[];
  };
}

interface Organization {
  repositories: {
    nodes: Repository[];
  };
}

interface GitHubResponse {
  organization: Organization;
}

const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN as string;
const NEXT_PUBLIC_GITHUB_ORG = process.env.NEXT_PUBLIC_GITHUB_ORG as string;

export async function GET(req: NextRequest, res: NextResponse) {
  const query = `
    query {
      organization(login: "${NEXT_PUBLIC_GITHUB_ORG}") {
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
    }
  `;

  try {
    const client = new GraphQLClient("https://api.github.com/graphql", {
      headers: {
        Authorization: `Bearer ${GITHUB_API_TOKEN}`,
      },
    });

    const data: GitHubResponse = await client.request(query);

    if (!data.organization) {
      return NextResponse.json(
        { error: `Organization "${NEXT_PUBLIC_GITHUB_ORG}" not found` },
        { status: 404 },
      );
    }

    const repositories: Repository[] = data.organization.repositories.nodes;
    const allReleases: Release[] = [];
    for (const repository of repositories) {
      for (const release of repository.releases.nodes) {
        // Assign repository name to each release
        release.repository = repository.name;
        allReleases.push(release);
      }
    }

    const sortedReleases = allReleases.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const latestReleases = sortedReleases.slice(0, 10);

    return NextResponse.json(latestReleases);
  } catch (error) {
    console.error("Error fetching repositories and releases:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories and releases" },
      { status: 500 },
    );
  }
}
