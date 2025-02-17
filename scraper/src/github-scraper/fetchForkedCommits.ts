import { Activity, ProcessData } from "./types.js";
import { parseISO } from "date-fns";
import { isBlacklisted } from "./utils.js";
import { octokit } from "./config.js";

function appendEvent(
  user: string,
  event: Activity,
  processedData: ProcessData,
) {
  if (isBlacklisted(user)) {
    return processedData;
  }
  console.debug(
    `Appending ${event.type} event for user ${user}. ${event.link}. ${event.text}`,
  );
  if (!processedData[user]) {
    console.log(`Creating new user data for ${user}`);
    processedData[user] = {
      last_updated: event.time,
      activity: [event],
      open_prs: [],
      authored_issue_and_pr: [],
    };
  } else {
    processedData[user]["activity"].push(event);
    if (event["time"] > (processedData[user]["last_updated"] ?? 0)) {
      processedData[user]["last_updated"] = event["time"];
    }
  }
  return processedData;
}

export const fetchForkedCommits = async (
  org: string,
  processedData: ProcessData,
) => {
  try {
    const members = await octokit.graphql.paginate(
      `query ($org: String!, $cursor: String) {
        organization(login: $org) {
          membersWithRole(first: 100, after: $cursor) {
            nodes {
              login
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }`,
      {
        org,
      },
    );

    const memberSet = new Set(
      members.organization.membersWithRole.nodes.map((node: any) => node.login),
    );
    const isMember = (name: string): boolean => {
      return memberSet.has(name);
    };
    console.log(memberSet);

    const res = await octokit.graphql.paginate(
      `query ($org: String!, $cursor: String) {
        organization(login: $org) {
          repositories(first: 100, after: $cursor) {
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
      {
        org,
      },
    );

    const repos = res.organization.repositories.nodes;

    for (const repo of repos) {
      const repoName = repo.name;
      const repoOwner = repo.owner.login;

      const res = await octokit.graphql.paginate(
        `query ($owner: String!, $name: String!, $cursor: String) {
          repository(owner: $owner, name: $name) {
            pullRequests(first: 100, states: OPEN, after: $cursor) {
              nodes {
                id
                number
                author {
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
        {
          owner: repoOwner,
          name: repoName,
        },
      );

      const prs = res.repository.pullRequests.nodes.filter(
        (pr: any) =>
          !isMember(pr.author?.login) && !isBlacklisted(pr.author?.login),
      );

      const prAuthors = prs.map((pr: any) => pr.author?.login);

      console.log(
        `Fetched ${prs.length} PRs from ${repoName} for ${prAuthors.join(", ")}`,
      );

      for (const pr of prs) {
        const prCommits = await octokit.request(
          `/repos/${repoOwner}/${repoName}/pulls/${pr.number}/commits`,
          {
            owner: repoOwner,
            repo: repoName,
            pull_number: pr.number,
          },
        );
        console.log(
          `Fetched ${prCommits.data.length} commits for PR ${pr.number}`,
        );
        for (const { commit } of prCommits.data) {
          if (
            isMember(commit.author.name) ||
            commit.message.startsWith("Merge")
          ) {
            console.log(
              "Skipping merge/member commit by ",
              commit.author.name,
              commit.message,
            );
            continue;
          }

          const commitAuthor = commit.author.name;
          const eventTime = parseISO(commit.committer.date);
          const commitSha = commit.url.split("/").pop();
          const githubCommitUrl = `https://github.com/${repoOwner}/${repoName}/commit/${commitSha}`;

          processedData = appendEvent(
            commitAuthor,
            {
              type: "pushed_commits",
              title: `${repoName}@${commit.url.split("/").pop().slice(0, 7)}`,
              time: eventTime.toISOString(),
              link: githubCommitUrl,
              text: commit.message,
            },
            processedData,
          );
        }
      }
    }
    return processedData;
  } catch (error) {
    console.error("Error fetching forked commits:", error);
    throw error;
  }
};
