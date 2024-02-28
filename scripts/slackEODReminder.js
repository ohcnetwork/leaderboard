const { Octokit } = require("@octokit/action");
// const { Octokit } = require("octokit"); // Use this for local development
const matter = require("gray-matter");
const { readFile, readdir } = require("fs/promises");
const { join } = require("path");

const root = join(process.cwd(), "contributors");

const GITHUB_ORG = process.env.GITHUB_ORG;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SLACK_WEBHOOK_URL = process.env.SLACK_EOD_BOT_WEBHOOK_URL;

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

async function getContributorBySlug(file) {
  const { data } = matter(await readFile(join(root, file), "utf8"));
  return {
    github: file.replace(/\.md$/, ""),
    slack: data.slack,
  };
}

async function getContributors() {
  const slugs = await readdir(`${root}`);
  return Promise.all(slugs.map((path) => getContributorBySlug(path)));
}

const isPROpenEvent = (event) => {
  return event.type === "PullRequestEvent" && event.payload.action === "opened";
};

const isIssueAssignEvent = (event) => {
  return event.type === "IssuesEvent" && event.payload.action === "assigned";
};

async function fetchGitHubEvents(authors) {
  const aDayAgoDate = new Date();
  aDayAgoDate.setDate(aDayAgoDate.getDate() - 2);
  const aDayAgo = aDayAgoDate.getTime();

  const events = await octokit.paginate(
    "GET /orgs/{org}/events",
    {
      org: GITHUB_ORG,
      per_page: 1000,
    },
    (res) =>
      res.data.filter(
        (event) =>
          authors.includes(event.actor.login) &&
          event.created_at &&
          new Date(event.created_at).getTime() > aDayAgo &&
          (isPROpenEvent(event) || isIssueAssignEvent(event)),
      ),
  );

  return events;
}

function summarizeActivity(events) {
  return {
    activities:
      events
        .filter(isPROpenEvent)
        .map(
          (event) =>
            `- Made a PR: ${event.payload.pull_request.title} (${event.payload.pull_request.html_url})`,
        )
        .join("\n") || "None",

    upcoming_activities:
      events
        .filter(isIssueAssignEvent)
        .map(
          (event) =>
            `- Work on: ${event.payload.issue?.title} (${event.payload.issue.html_url})`,
        )
        .join("\n") || "None",
  };
}

async function main() {
  const today = new Date();
  const eod_date = `${today.getDate()}/${today.getMonth()}/${today.getFullYear()}`;

  const members = (await getContributors()).filter((c) => c.slack);
  const events = await fetchGitHubEvents(members.map((c) => c.github));

  const memberEvents = members
    .map((c) => ({
      slack: c.slack,
      github: c.github,
      events: events.filter((e) => e.actor.login === c.github),
    }))
    .filter((e) => e.events.length);

  const status = await Promise.all(
    memberEvents.map(async (member) => {
      const payload = {
        user_id: member.slack,
        eod_date,
        ...summarizeActivity(member.events),
      };

      const res = await fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      return {
        slack: member.slack,
        github: member.github,
        payload,
        webhook_response: {
          status: res.status,
          data: data,
        },
      };
    }),
  );
}

main();
