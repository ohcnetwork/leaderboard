import { octokit } from "./config.js";
import { appendEvent } from "./parseEvents.js";
import { ProcessData, Fork, Branch, CommitEvent } from "./types.js";

const processedData: ProcessData = {};

export const fetchForkedCommits = async (org: string) => {
  try {
    // Fetch all repositories in the organization
    const result = await octokit.graphql.paginate(
      `query ($org: String!, $after: String) {
          organization(login: $org) {
            repositories(first: 100, after: $after) {
              nodes {
                name
                owner {
                  login
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }`,
      { org },
    );

    const repos: { name: string; owner: { login: string } }[] =
      result.organization.repositories.nodes;

    for (const repo of repos) {
      const { name, owner } = repo;

      // Fetch all forks of the repository
      const result = await octokit.graphql.paginate(
        `query ($owner: String!, $repo: String!, $after: String) {
            repository(owner: $owner, name: $repo) {
              forks(first: 100, after: $after) {
                nodes {
                  name
                  owner {
                    login
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          }`,
        { owner: owner.login, repo: name },
      );

      const forks: Fork[] = result.repository.forks.nodes;

      for (const fork of forks) {
        const { name: forkName, owner: forkOwner } = fork;

        // Fetch all branches of the fork
        const result = await octokit.graphql.paginate(
          `query ($owner: String!, $repo: String!, $after: String) {
              repository(owner: $owner, name: $repo) {
                refs(refPrefix: "refs/heads/", first: 100, after: $after) {
                  nodes {
                    name
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            }`,
          { owner: forkOwner.login, repo: forkName },
        );

        const branches: Branch[] = result.repository.refs.nodes;

        for (const branch of branches) {
          const branchName = branch.name;

          // Fetch all commit events of the branch
          const result = await octokit.graphql.paginate(
            `query ($owner: String!, $repo: String!, $branch: String!, $after: String) {
                repository(owner: $owner, name: $repo) {
                  ref(qualifiedName: $branch) {
                    target {
                      ... on Commit {
                        history(first: 100, after: $after) {
                          nodes {
                            oid
                            message
                            committedDate
                            url
                          }
                          pageInfo {
                            hasNextPage
                            endCursor
                          }
                        }
                      }
                    }
                  }
                }
              }`,
            { owner: forkOwner.login, repo: forkName, branch: branchName },
          );

          const commitEvents: CommitEvent[] =
            result.repository.ref?.target?.history?.nodes;

          for (const event of commitEvents) {
            const commit = {
              type: "pushed_commits",
              title: `${forkName}@${event.oid.slice(0, 7)}`,
              time: new Date(event.committedDate).toISOString(),
              link: event.url,
              text: event.message,
            };

            appendEvent(forkOwner.login, commit);
          }
        }
      }
    }
    return processedData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
