/**
 * This is experimental. Needs to be made configurable as this may not work
 * for pulling items from project board's of other orgs.
 *
 * Notes:
 * - SCRAPER_GITHUB_TOKEN requires `read:project` scope.
 * - Status change events can't be extracted atm. using GraphQL API, however should be in future. (Ref: Ref: https://github.com/orgs/community/discussions/5859#discussioncomment-4679381)
 */

import { mkdir, readFile, writeFile } from "fs/promises";
import { octokit } from "./config.js";
import path from "path";

interface ProjectBoardItem {
  user: string;
  type: "PULL_REQUEST" | "ISSUE" | "DRAFT_ISSUE";
  url: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  completedAtMonth: string | null;
  sprint: string | null;
  category: string | null;
  status: string | null;
  storyPoints: number | null;
  priority: string | null;
  author: string;
  assignees: string; // comma separated list of assignees
  focus: string | null;
}

async function getProjectBoardItems(projectId: string) {
  const iterator = octokit.graphql.paginate.iterator(
    `query getProjectItems($projectId: ID!, $cursor: String) {
        node(id: $projectId) {
            ... on ProjectV2 {
                updatedAt
                items(first: 100, orderBy: {field: POSITION, direction: DESC}, after: $cursor) {
                    pageInfo {
                        hasNextPage
                        endCursor
                    }
                    nodes {
                        id
                        createdAt
                        updatedAt
                        type
                        fieldValues(first: 10) {
                            nodes {
                                ... on ProjectV2ItemFieldTextValue {
                                    text
                                    field {
                                        ... on ProjectV2FieldCommon {
                                            name
                                        }
                                    }
                                }
                                ... on ProjectV2ItemFieldIterationValue {
                                    title
                                    startDate
                                    duration
                                    field {
                                        ... on ProjectV2FieldCommon {
                                            name
                                        }
                                    }
                                }
                                ... on ProjectV2ItemFieldNumberValue {
                                    number
                                    field {
                                        ... on ProjectV2FieldCommon {
                                            name
                                        }
                                    }
                                }
                                ... on ProjectV2ItemFieldSingleSelectValue {
                                    name
                                    description
                                    color
                                    field {
                                        ... on ProjectV2FieldCommon {
                                            name
                                        }
                                    }
                                }
                            }
                        }
                        content {              
                            ... on DraftIssue {
                                assignees(last: 10) {
                                    nodes {
                                        login
                                    }
                                }
                            }
                            ... on Issue {
                                url
                                closedAt
                                stateReason
                                author {
                                    login
                                }
                                assignees(last: 10) {
                                    nodes {
                                        login
                                    }
                                }
                            }
                            ... on PullRequest {
                                url
                                closedAt
                                merged
                                mergedAt
                                author {
                                    login
                                }
                                assignees(last: 10) {
                                    nodes {
                                        login
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }`,
    { projectId },
  );

  let items: [string, ProjectBoardItem][] = [];

  for await (const response of iterator) {
    console.log(`Processing ${response.node.items.nodes.length} items`);

    for (const node of response.node.items.nodes) {
      const get = (fieldName: string) => {
        return node.fieldValues.nodes.find(
          (fieldValue: any) => fieldValue.field?.name === fieldName,
        );
      };

      let assignees = new Set<string>(
        node.content.assignees.nodes.map((user: any) => user.login),
      );

      // Adding author as assignee for PRs because they may not be present in
      // the assignees list.
      if (node.content.type === "PULL_REQUEST") {
        const author = node.content.author?.login;
        if (author) {
          assignees.add(author);
        }
      }

      let completedAt = null;

      if (node.type === "ISSUE" && node.content.stateReason === "COMPLETED") {
        completedAt = node.content.closedAt;
      }
      if (node.type === "PULL_REQUEST" && node.content.merged) {
        completedAt = node.content.mergedAt;
      }

      const baseData = {
        type: node.type,
        url: node.content.url,
        title: get("Title").text,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        closedAt: node.content.closedAt,
        completedAtMonth:
          completedAt &&
          new Date(completedAt).toLocaleString("default", {
            month: "short",
            year: "numeric",
          }),
        sprint: get("Sprint")?.title,
        assignees: Array.from(assignees).join(","),
        category: get("Category")?.name,
        status: get("Status")?.name,
        storyPoints: get("Story Points")?.number,
        priority: get("Priority")?.name,
        author: node.content.author?.login,
        focus: get("Focus")?.name,
      } satisfies Omit<ProjectBoardItem, "id" | "user">;

      // Voluntarily duplicating for each contributor because, contributors
      // are the first class citizen in the cache.
      assignees.forEach((assignee) => {
        items.push([`${node.id}/${assignee}`, { ...baseData, user: assignee }]);
      });
    }
  }

  console.log(`Processed ${items.length} items`);

  return Object.fromEntries(items);
}

async function readExistingItems(filePath: string): Promise<object> {
  try {
    const contents = await readFile(filePath);
    return JSON.parse(contents.toString());
  } catch (e) {}
  return {};
}

async function upsertItems(items: object, filePath: string) {
  const existing = await readExistingItems(filePath);
  await writeFile(filePath, JSON.stringify({ ...existing, ...items }, null, 2));
}

export default async function scrapeProjectBoardItems(
  projectId: string,
  rootDir: string,
) {
  await mkdir(path.join(rootDir, "project-boards"), { recursive: true });
  const file = path.join(rootDir, "project-boards", `${projectId}.json`);
  await upsertItems(await getProjectBoardItems(projectId), file);
}
