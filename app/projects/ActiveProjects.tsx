import Markdown from "@/components/Markdown";
import RelativeTime from "@/components/RelativeTime";
import { parseIssueNumber } from "@/lib/utils";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import Link from "next/link";
import { ActiveProjectLabelConfig } from "./constants";
import { env } from "@/env.mjs";
import { getGitHubAccessToken } from "@/lib/octokit";

type GraphQLOrgActiveProjectsResponse = {
  data: {
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
};

async function fetchIssues(labels: string[]) {
  const labelsFilter = labels.map((label) => `"${label}"`).join(", ");

  const accessToken = getGitHubAccessToken();

  if (!accessToken) {
    return [];
  }

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
    {
      organization(login: "${env.NEXT_PUBLIC_GITHUB_ORG}") {
        repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
          edges {
            node {
              name
              issues(first: 100, states: OPEN, labels: [${labelsFilter}]) {
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
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const json = (await res.json()) as GraphQLOrgActiveProjectsResponse;

  const result = json.data.organization.repositories.edges.flatMap((repo) =>
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
          className="flex flex-col rounded-lg border shadow-sm dark:border-secondary-700"
        >
          <div className="flex items-center justify-between p-6 pb-0 pt-4">
            <div
              className={`flex items-center ${props.small ? "gap-2" : "gap-3"}`}
            >
              <div className="flex flex-wrap gap-2">
                {issue.labels
                  .filter((label) => label in props.labels)
                  .map((label) => (
                    <Link
                      key={label}
                      href={props.labels[label].ref}
                      target="_blank"
                      className={`rounded-full border font-semibold capitalize ${
                        props.labels[label].className
                      }
                            ${
                              props.small
                                ? "border-secondary-200 px-2.5 py-1 text-xs dark:border-secondary-800"
                                : "border-current px-3 py-1 text-sm"
                            }`}
                    >
                      {props.small ? label : props.labels[label].name}
                    </Link>
                  ))}
              </div>
              <Link
                href={issue.url}
                target="_blank"
                className={`font-mono font-bold tracking-wide text-secondary-700 dark:text-secondary-300 ${
                  props.small ? "text-xs" : "text-sm"
                }`}
              >
                <span className="pr-0.5 tracking-normal text-secondary-400">
                  {env.NEXT_PUBLIC_GITHUB_ORG}/{issue.repo}
                </span>
                #{issue.number}
              </Link>
            </div>
            {props.small ? (
              <Link
                href={`/projects#${issue.repo}-${issue.number}`}
                className="flex items-center gap-2 rounded-lg border border-secondary-200 px-4 py-2 text-sm text-secondary-800 transition-colors hover:bg-secondary-100 hover:text-secondary-900 dark:border-secondary-800 dark:text-secondary-200 hover:dark:bg-secondary-800 hover:dark:text-secondary-100"
              >
                <FiExternalLink />
                View
              </Link>
            ) : (
              <Link
                href={issue.url}
                target="_blank"
                className="flex items-center gap-2 rounded-lg border border-secondary-200 px-4 py-2 text-sm text-secondary-800 transition-colors hover:bg-secondary-100 hover:text-secondary-900 dark:border-secondary-800 dark:text-secondary-200 hover:dark:bg-secondary-800 hover:dark:text-secondary-100"
              >
                <FiGithub />
                Open in GitHub
              </Link>
            )}
          </div>

          <div className="flex flex-col space-y-2 p-6">
            <h3
              className={`font-semibold ${
                props.small ? "text-2xl" : "pb-2 text-4xl"
              }`}
            >
              {issue.title}
            </h3>
            <p className="text-sm text-secondary-700 dark:text-secondary-300">
              Opened by{" "}
              <span className="font-semibold">{issue.author.login}</span>{" "}
              <RelativeTime
                time={issue.createdAt}
                className="text-secondary-500"
              />
            </p>
          </div>

          {!props.small && (
            <div className="break-all bg-secondary-100 p-6 text-sm dark:bg-secondary-800 ">
              <Markdown>{issue.body}</Markdown>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
