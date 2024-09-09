/**
 * This is experimental. Needs to be made configurable as this may not work
 * for pulling items from project board's of other orgs.
 *
 * Notes:
 * - GITHUB_TOKEN requires `read:project` scope.
 * - Status change events can't be extracted atm. using GraphQL API, however should be in future. (Ref: Ref: https://github.com/orgs/community/discussions/5859#discussioncomment-4679381)
 */

import { mkdir, readFile, writeFile } from "fs/promises";
import { octokit } from "./config.js";
import path from "path";

async function getProjectBoardItems(projectId: string) {
  const data: any = await octokit.graphql(
    `query getProjectItems($projectId: ID!) {
        node(id: $projectId) {
            ... on ProjectV2 {
                updatedAt
                items(first: 100, orderBy: {field: POSITION, direction: DESC}) {
                    nodes {
                        id
                        createdAt
                        updatedAt
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

  return Object.fromEntries(
    data.node.items.nodes.map((node: any) => {
      const get = (fieldName: string) => {
        return node.fieldValues.nodes.find(
          (fieldValue: any) => fieldValue.field?.name === fieldName,
        );
      };

      return [
        node.id,
        {
          url: node.content.url,
          title: get("Title").text,
          createdAt: node.createdAt,
          updatedAt: node.updatedAt,
          closedAt: node.content.closedAt,
          sprint: get("Sprint")?.title,
          category: get("Category")?.name,
          status: get("Status")?.name,
          storyPoints: get("Story Points")?.number,
          priority: get("Priority")?.name,
          author: node.content.author?.login,
          assignees: node.content.assignees.nodes.map(
            (user: any) => user.login,
          ),
          focus: get("Focus")?.name,
        },
      ];
    }),
  );
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
  try {
    await upsertItems(await getProjectBoardItems(projectId), file);
  } catch (e) {
    console.error("Failed to scrape project board items.");
    console.error(e);
  }
}
