import Markdown from "@/components/Markdown";
import RelativeTime from "@/components/RelativeTime";
import { parseIssueNumber } from "@/lib/utils";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import Link from "next/link";
import { ActiveProjectLabelConfig } from "@/app/projects/constants";
import { env } from "@/env.mjs";
import octokit, { getGitHubAccessToken } from "@/lib/octokit";
import ActiveProject from "@/app/projects/ActiveProject";

type GraphQLOrgActiveProjectsResponse = {
  organization: {
    repositories: {
      edges: {
        node: {
          name: string;
          issues: {
            edges: {
              node: {
                title: string;
                body: string;
                url: string;
                createdAt: string;
                updatedAt: string;
                author: { login: string };
                labels: {
                  edges: {
                    node: {
                      name: string;
                    };
                  }[];
                };
              };
            }[];
          };
        };
      }[];
    };
  };
};

async function fetchIssues(labels: string[]) {
  const accessToken = getGitHubAccessToken();

  if (!accessToken) {
    return [];
  }

  const data: GraphQLOrgActiveProjectsResponse = await octokit.graphql(
    `
      query getIssues($org: String!, $labels: [String!]!) {
        organization(login: $org) {
          repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
            edges {
              node {
                name
                issues(first: 100, states: OPEN, labels: $labels) {
                  edges {
                    node {
                      title
                      body
                      url
                      createdAt
                      updatedAt
                      author {
                        login
                      },
                      labels(first: 5) {
                        edges {
                          node {
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      org: env.NEXT_PUBLIC_GITHUB_ORG,
      labels,
    },
  );

  const result = data.organization.repositories.edges.flatMap((repo) =>
    repo.node.issues.edges.map((issue) => ({
      ...issue.node,
      labels: issue.node.labels.edges.map((label) => label.node.name),
      repo: repo.node.name,
      number: parseIssueNumber(issue.node.url),
    })),
  );

  return result;
}

export default async function ActiveProjects(props: {
  limit?: number;
  small?: boolean;
  className?: string;
  labels: ActiveProjectLabelConfig;
}) {
  const issues = (await fetchIssues(Object.keys(props.labels)))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getDate() - new Date(a.updatedAt).getDate(),
    )
    .slice(0, props.limit);

  if (issues.length === 0) {
    return (
      <span className="flex w-full justify-center py-10 text-lg font-semibold text-secondary-600 dark:text-secondary-400">
        No ongoing active projects
      </span>
    );
  }

  return (
    <ul className={props.className}>
      {issues.map((issue) => (
        <li
          key={issue.url}
          id={`${issue.repo}-${issue.number}`}
          className="flex flex-col rounded-lg border shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg dark:border-secondary-700"
        >
          <ActiveProject
            issue={issue}
            labels={props.labels}
            small={props.small}
          />
        </li>
      ))}
    </ul>
  );
}
