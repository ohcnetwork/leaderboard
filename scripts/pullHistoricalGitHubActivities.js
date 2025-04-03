/**
 * Script to populate the data-repo with historical information from GitHub.
 *
 * Supports populating the following activity types:
 *
 * - [x] issue_opened
 * - [x] pr_opened
 * - [x] pr_merged
 *
 * Supports populating GitHub Discussions
 */

const { join } = require("path");
const { writeFile, mkdir, readFile } = require("fs/promises");
const { Octokit } = require("octokit");

const basePath = join(process.env.DATA_REPO || process.cwd(), "data/github");
console.info(`Data will be written to: '${basePath}'`);

const org = process.env.GITHUB_ORG;
const token = process.env.GITHUB_TOKEN;

if (!org) {
  throw Error(
    "'GITHUB_ORG' environment needs to be set with a GitHub Organization (e.g.: 'ohcnetwork').",
  );
}

if (!token) {
  throw Error(
    "'GITHUB_TOKEN' environment needs to be set with a GitHub Access Token.",
  );
}

const blacklistedAccounts = ["dependabot", "snykbot", "codecov-commenter"];

const octokit = new Octokit({ auth: token });

const getRepositories = async () => {
  const { organization } = await octokit.graphql.paginate(
    `query paginate($cursor: String, $org: String!) {
      organization(login: $org) {
        repositories(first: 100, orderBy: { field: UPDATED_AT, direction: DESC }, after: $cursor)  {
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
    { org },
  );
  return organization.repositories.nodes.map((node) => node.name);
};

const getIssues = async (repo) => {
  const { repository } = await octokit.graphql.paginate(
    `query paginate($cursor: String, $org: String!, $repo: String!) {
      repository(owner: $org, name: $repo) {
        issues(first: 100, after: $cursor) {
          nodes {
            number
            title
            url
            createdAt
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
    }
    `,
    { org, repo },
  );
  return repository.issues.nodes;
};

const getPullRequests = async (repo) => {
  const { repository } = await octokit.graphql.paginate(
    `query paginate($cursor: String, $org: String!, $repo: String!) {
      repository(owner: $org, name: $repo) {
        pullRequests(first: 100, after: $cursor) {
          nodes {
            number
            title
            url
            createdAt
            merged
            mergedAt
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
    }
    `,
    { org, repo },
  );
  return repository.pullRequests.nodes;
};

const getUserActivities = async () => {
  const userActivities = {};

  const addActivity = (user, activity) => {
    userActivities[user] ??= [];
    userActivities[user].push(activity);
  };

  const repositories = await getRepositories();

  for (const [i, repo] of repositories.entries()) {
    console.info(
      `[${i + 1}/${repositories.length}] Pulling activities for repository '${repo}'`,
    );

    const issues = await getIssues(repo);
    console.info(`  Captured ${issues.length} issues`);
    for (const issue of issues) {
      if (!issues.author?.login) {
        continue;
      }

      addActivity(issue.author.login, {
        type: "issue_opened",
        title: `${org}/${repo}#${issue.number}`,
        time: issue.createdAt,
        link: issue.url,
        text: issue.title,
      });
    }

    const pulls = await getPullRequests(repo);
    console.info(`  Captured ${pulls.length} pull requests`);
    for (const pr of pulls) {
      if (!pr.author?.login) {
        continue;
      }

      addActivity(pr.author.login, {
        type: "pr_opened",
        title: `${org}/${repo}#${pr.number}`,
        time: pr.createdAt,
        link: pr.url,
        text: pr.title,
      });

      if (pr.merged) {
        addActivity(pr.author.login, {
          type: "pr_merged",
          title: `${org}/${repo}#${pr.number}`,
          time: pr.mergedAt,
          link: pr.url,
          text: pr.title,
        });
      }
    }
  }

  return userActivities;
};

const getUserJson = async (user, scrapedActivities) => {
  try {
    const data = JSON.parse(
      await readFile(join(basePath, `${user}.json`), "utf8"),
    );

    const oldActivities = data.activity;
    const newActivities = scrapedActivities.filter(
      (a) => !oldActivities.find((b) => a.link === b.link && a.type === b.type),
    );

    return {
      ...data,
      activity: [...oldActivities, ...newActivities],
    };
  } catch {
    return {
      last_updated: scrapedActivities[0]?.time ?? new Date().toISOString(),
      activity: scrapedActivities,
      open_prs: [],
      authored_issue_and_pr: [],
    };
  }
};

const isBlacklisted = (login) => {
  return login.includes("[bot]") || blacklistedAccounts.includes(login);
};

const discussionQuery = `query($org: String!, $cursor: String) {
  organization(login: $org) {
    repositories(first: 100, after: $cursor, orderBy: {field: UPDATED_AT, direction: DESC}) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          name
            discussions(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
            edges {
              node {
                title
                body
                author {
                  login
                }
                url
                isAnswered
                category {
                  name
                  emojiHTML
                }
                comments(first: 10) {
                  edges {
                    node {
                      author {
                        login
                      }
                    }
                  }
                }
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    }
  }
}`;

async function getAllDiscussions(endDate, startDate) {
  const iterator = octokit.graphql.paginate.iterator(discussionQuery, { org });

  let discussionsList = [];

  for await (const response of iterator) {
    const repositories = response.organization.repositories.edges;

    for (const repo of repositories) {
      const discussions = repo.node.discussions.edges.map((discussion) => ({
        repository: repo.node.name,
        discussion: discussion.node,
      }));

      const isDiscussionOutOfDateRange = discussions.find((d) => {
        const createdAt = new Date(d.discussion.createdAt);
        const updatedAt = new Date(d.discussion.updatedAt);

        return (
          (createdAt <= new Date(startDate) &&
            createdAt >= new Date(endDate)) ||
          (updatedAt <= new Date(startDate) && updatedAt >= new Date(endDate))
        );
      });
      if (isDiscussionOutOfDateRange) {
        return discussionsList;
      }
      discussionsList = discussionsList.concat(discussions);
    }
  }
  return discussionsList;
}

async function parseDiscussionData(allDiscussions, endDate, startDate) {
  const discussionsWithinDateRange = allDiscussions.filter((d) => {
    const createdAt = new Date(d.discussion.createdAt);
    const updatedAt = new Date(d.discussion.updatedAt);

    return (
      (createdAt >= new Date(startDate) && createdAt <= new Date(endDate)) ||
      (updatedAt >= new Date(startDate) && updatedAt <= new Date(endDate))
    );
  });
  const parsedDiscussions = discussionsWithinDateRange.map((d) => {
    const participants = d.discussion.comments.edges.map(
      (comment) => comment.node.author.login,
    );
    return {
      source: "github",
      title: d.discussion.title,
      text: d.discussion.body,
      author: d.discussion.author.login,
      link: d.discussion.url,
      isAnswered: d.discussion.isAnswered,
      time: d.discussion.createdAt,
      updateTime: d.discussion.updatedAt,
      category: {
        name: d.discussion.category.name,
        emoji: d.discussion.category.emojiHTML.replace(/<\/?div>/g, ""),
      },
      participants: participants || [],
      repository: d.repository,
    };
  });
  return parsedDiscussions;
}

async function mergeDiscussions(oldData, newDiscussions) {
  const mergedDiscussions = [...oldData];
  if (!newDiscussions) {
    return mergedDiscussions;
  }
  newDiscussions.forEach((newDiscussion) => {
    const oldIndex = oldData.findIndex(
      (oldDiscussion) => oldDiscussion.link === newDiscussion.link,
    );

    if (oldIndex !== -1) {
      if (
        oldData[oldIndex].updateTime !== newDiscussion.updateTime ||
        oldData[oldIndex].participants !== newDiscussion.participants
      ) {
        mergedDiscussions[oldIndex] = newDiscussion;
      }
    } else {
      mergedDiscussions.push(newDiscussion);
    }
  });

  return mergedDiscussions;
}

async function saveDiscussionData(discussions, basePath) {
  await mkdir(basePath + "/discussions", { recursive: true });
  if (discussions.length === 0) {
    return;
  }
  const discussionsDir = join(basePath, "discussions");
  const file = join(discussionsDir, "discussions.json");
  try {
    const response = await readFile(file);
    const oldData = JSON.parse(response.toString());
    const mergedData = await mergeDiscussions(oldData, discussions);
    const jsonData = JSON.stringify(mergedData, null, 2);
    await writeFile(file, jsonData);
  } catch (err) {
    const jsonData = JSON.stringify(discussions, null, 2);
    await writeFile(file, jsonData);
  }
}

async function main() {
  const userActivities = await getUserActivities();

  const dataPoints = Object.values(userActivities)
    .map((arr) => arr.length)
    .reduce((p, v) => p + v, 0);
  console.log(`Captured ${dataPoints} data points.`);

  await mkdir(basePath, { recursive: true });

  await Promise.all(
    Object.entries(userActivities).map(async ([user, activities]) => {
      if (isBlacklisted(user)) {
        console.log(`Skipping for blacklisted account '${user}'`);
        return;
      }

      const path = join(basePath, `${user}.json`);
      console.log(`Writing activities for '${user}' to '${path}'.`);
      await writeFile(
        path,
        JSON.stringify(await getUserJson(user, activities), undefined, "  "),
        {
          encoding: "utf-8",
        },
      );
    }),
  );

  const startDate = new Date("2021-01-01");
  const endDate = new Date(Date.now());

  console.log(
    "Fetching discussions between " +
      startDate.toLocaleDateString() +
      " and " +
      endDate.toLocaleDateString(),
  );

  try {
    const allDiscussions = await getAllDiscussions(endDate, startDate);
    const parsedDiscussions = await parseDiscussionData(
      allDiscussions,
      endDate,
      startDate,
    );
    console.log(
      "Saving discussions to " + basePath + "/discussions/discussions.json",
    );
    await saveDiscussionData(parsedDiscussions, basePath);
  } catch (error) {
    throw new Error(`Error fetching discussions: ${error.message}`);
  }

  console.log("Completed");
}

main();
