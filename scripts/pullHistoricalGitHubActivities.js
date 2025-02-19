/**
 * Script to populate the data-repo with historical information from GitHub.
 *
 * Supports populating the ollowing activity types:
 *
 * - [x] issue_opened
 * - [x] pr_opened
 * - [x] pr_merged
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

  console.log("Completed");
}

main();
