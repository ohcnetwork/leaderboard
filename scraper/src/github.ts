import { formatISO, parseISO, startOfDay, subDays } from "date-fns";
import fs from "fs";
import path from "path";
import { Activity, ActivityData, ProcessData, Action } from "../../lib/types";
import { PullRequestEvent, IGitHubEvent } from "../../lib/gh_events";
import { Octokit } from "octokit";

let processedData: ProcessData = {};

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("GITHUB_TOKEN not found in environment");
  process.exit(1);
}
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

const fetchEvents = async (org: string, startDate: Date, endDate: Date) => {
  const events = await octokit.paginate(
    "GET /orgs/{org}/events",
    {
      org: org,
      per_page: 1000,
    },
    (response: { data: IGitHubEvent[] }) => {
      return response.data;
    },
  );

  let eventsCount: number = 0;
  let filteredEvents = [];
  for (const event of events) {
    const eventTime: Date = new Date(event.created_at ?? 0);

    if (eventTime > endDate) {
      continue;
    } else if (eventTime <= startDate) {
      return filteredEvents;
    }
    const isBlacklisted: boolean = [
      "dependabot",
      "snyk-bot",
      "codecov-commenter",
      "github-actions[bot]",
    ].includes(event.actor.login);
    const isRequiredEventType: boolean = [
      "IssueCommentEvent",
      "IssuesEvent",
      "PullRequestEvent",
      "PullRequestReviewEvent",
    ].includes(event.type ?? "");
    console.log(isRequiredEventType);
    if (!isBlacklisted && isRequiredEventType) {
      console.log(event.type);
      filteredEvents.push(event);
    }
    eventsCount++;
  }
  console.log("Fetched " + { eventsCount } + " events");

  return filteredEvents;
};
function appendEvent(user: string, event: Activity) {
  console.log(`Appending event for ${user}`);
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
}
const userBlacklist = new Set(["dependabot", "snyk-bot", "codecov-commenter"]);

const isBlacklisted = (login: string): boolean => {
  return login.includes("[bot]") || userBlacklist.has(login);
};
function parseISODate(isoDate: Date) {
  return new Date(isoDate);
}
async function calculateTurnaroundTime(event: PullRequestEvent) {
  const user: string = event.payload.pull_request.user.login;
  const mergedAt: Date = parseISODate(event.payload.pull_request.merged_at);
  const createdAt: Date = parseISODate(event.payload.pull_request.created_at);

  const linkedIssues: [string, string][] = [];
  const body = event.payload.pull_request.body || "";
  const regex =
    /(fix|fixes|fixed|close|closes|closed|resolve|resolves|resolved) ([\w\/.-]*)(#\d+)/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(body)) !== null) {
    linkedIssues.push([match[2], match[3]]);
  }

  const prTimelineResponse = await octokit.request(
    `GET ${event.payload?.pull_request?.issue_url}/timeline`,
  );

  const prTimeline = prTimelineResponse.data;

  prTimeline.forEach((action: Action) => {
    if (
      action.event === "cross-referenced" &&
      action.source.type === "issue" &&
      !action.source.issue.pull_request
    ) {
      linkedIssues.push([
        action.source.issue.repository.full_name,
        `#${action.source.issue.number}`,
      ]);
    }

    if (action.event === "connected") {
      // TODO: currently there is no way to get the issue number from the timeline, handle this case while moving to graphql
    }
  });
  const uniqueLinkedIssues: [string, string][] = Array.from(
    new Set(linkedIssues.map((issue) => JSON.stringify(issue))),
  ).map((item) => JSON.parse(item) as [string, string]);
  const assignedAts: { issue: string; time: Date }[] = [];

  for (const [org_repo, issue] of uniqueLinkedIssues) {
    const org = org_repo.split("/")[0] || event.repo.name.split("/")[0];
    const repo = org_repo.split("/")[-1] || event.repo.name.split("/")[1];
    const issueNumber = parseInt(issue.split("#")[1]);

    const issueTimelineResponse = await octokit.request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline",
      {
        owner: org,
        repo: repo,
        issue_number: issueNumber,
      },
    );

    const issueTimeline = issueTimelineResponse.data;
    issueTimeline.forEach((action: Action) => {
      if (action.event === "assigned" && action.assignee.login === user) {
        assignedAts.push({
          issue: `${org}/${repo}#${issueNumber}`,
          time: parseISODate(action.created_at),
        });
      }

      if (action.event === "unassigned" && action.assignee.login === user) {
        assignedAts.pop();
      }
    });
  }

  const assignedAt: Date | null =
    assignedAts.length === 0
      ? null
      : assignedAts.reduce((min, current) =>
          current.time < min.time ? current : min,
        ).time;
  const turnaroundTime =
    (mergedAt.getTime() - (assignedAt || createdAt.getTime()).valueOf()) / 1000;
  return turnaroundTime;
}
async function addCollaborations(event: PullRequestEvent, eventTime: Date) {
  let nameUserCache: { [key: string]: string } = {};
  let emailUserCache: { [key: string]: string } = {};
  const collaborators: Set<string> = new Set();

  const url: string | undefined = event.payload.pull_request?.commits_url;

  const response = await octokit.request("GET " + url);
  const commits = response.data;
  for (const commit of commits) {
    let authorLogin = commit.author && commit.author.login;
    if (!authorLogin) {
      authorLogin = commit.commit.author.name;
    }

    if (isBlacklisted(authorLogin)) {
      continue;
    }

    collaborators.add(authorLogin);

    const coAuthors = commit.commit.message.match(
      /Co-authored-by: (.+) <(.+)>/,
    );
    if (coAuthors) {
      for (const [name, email] of coAuthors) {
        if (isBlacklisted(name)) {
          continue;
        }

        if (name in nameUserCache) {
          collaborators.add(nameUserCache[name]);
          continue;
        }

        if (email in emailUserCache) {
          collaborators.add(emailUserCache[email]);
          continue;
        }

        try {
          const usersByEmail = await octokit.request("GET /search/users", {
            q: email,
          });

          if (usersByEmail.data.total_count > 0) {
            const login = usersByEmail.data.items[0].login;
            emailUserCache[email] = login;
            collaborators.add(login);
            continue;
          }
          const usersByName = await octokit.request("GET /search/users", {
            q: name,
          });

          if (usersByName.data.total_count === 1) {
            const login = usersByName.data.items[0].login;
            nameUserCache[name] = login;
            collaborators.add(login);
          }
        } catch (e) {
          console.error(
            `Error fetching co-authors for commit ${commit} - ${name} <${email}>: ${e}`,
          );
        }
      }
    }
  }

  if (collaborators.size > 1) {
    const collaboratorArray = Array.from(collaborators); // Convert Set to Array
    for (const user of collaboratorArray) {
      const others = new Set(collaborators);
      const othersArray = Array.from(others);

      others.delete(user);
      appendEvent(user, {
        type: "pr_collaborated",
        title: `${event.repo.name}#${event.payload.pull_request.number}`,
        time: eventTime.toISOString(),
        link: event.payload.pull_request.html_url,
        text: event.payload.pull_request.title,
        collaborated_with: [...othersArray],
      });
    }
  }
}
async function resolve_autonomy_responsibility(event: Action, user: string) {
  if (event.event === "cross-referenced" && event.source.type === "issue") {
    return event.source.issue.user.login === user;
  }
  return false;
}
const fetch_merge_events = async (user: string, org: string) => {
  console.log("Merge events for : ", user);

  // Fetching closed issues authored by the user
  const { data: issues } = await octokit.request("GET /search/issues", {
    q: `is:issue is:closed org:${org} author:${user}`,
  });

  let merged_prs = [];

  for (const issue of issues.items) {
    const { data: timeline_events } = await octokit.request(
      "GET " + issue.timeline_url,
    );

    for (const event of timeline_events) {
      if (await resolve_autonomy_responsibility(event, user)) {
        const pull_request = event.source.issue.pull_request;
        if (pull_request && pull_request.merged_at) {
          merged_prs.push({
            issue_link: issue.html_url,
            pr_link: pull_request.html_url,
          });
        }
      }
    }
  }

  if (!processedData[user]) {
    processedData[user] = {
      authored_issue_and_pr: [],
      last_updated: "",
      activity: [],
      open_prs: [],
    };
  }

  for (const pr of merged_prs) {
    processedData[user].authored_issue_and_pr.push(pr);
  }

  return processedData;
};

const fetchOpenPulls = async (user: string, org: string) => {
  console.log(`Fetching open pull requests for ${user}`);
  const { data } = await octokit.request("GET /search/issues", {
    q: `is:pr is:open org:${org} author:${user}`,
  });

  type PullsData = (typeof data.items)[0];
  let pulls: PullsData[] = data.items;

  pulls.forEach((pr: PullsData) => {
    let today: Date = new Date();
    let prLastUpdated: Date = new Date(pr.updated_at);
    let staleFor: number = Math.floor(
      (today.getTime() - prLastUpdated.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (!processedData[user]) {
      processedData[user] = {
        last_updated: "",
        activity: [],
        authored_issue_and_pr: [],
        open_prs: [],
      };
    }
    processedData[user].open_prs.push({
      link: pr.html_url,
      title: pr.title,
      stale_for: staleFor,
      labels: pr.labels.map((label: { name: string }) => label.name),
    });
  });

  console.log(`Fetched ${pulls.length} open pull requests for ${user}`);
  return processedData;
};
const parse_event = async (events: IGitHubEvent[]) => {
  for (const event of events) {
    const eventTime: Date = parseISO(event.created_at);
    const user: string = event.actor.login;
    if (isBlacklisted(user)) continue;

    console.log("Processing event for user: ", user);
    console.log("event_id : ", event.id);

    switch (event.type) {
      case "IssueCommentEvent":
        if (event.payload.action === "created") {
          appendEvent(user, {
            type: "comment_created",
            title: `${event.repo.name}#${event.payload.issue.number}`,
            time: eventTime.toISOString(),
            link: event.payload.comment.html_url,
            text: event.payload.comment.body,
          });
        }
        break;
      case "IssuesEvent":
        if (["opened", "assigned", "closed"].includes(event.payload.action)) {
          appendEvent(user, {
            type: `issue_${event.payload.action}`,
            title: `${event.repo.name}#${event.payload.issue?.number}`,
            time: eventTime.toISOString(),
            link: event.payload.issue.html_url,
            text: event.payload.issue.title,
          });
        }
        break;
      case "PullRequestEvent":
        if (event.payload.action === "opened") {
          appendEvent(user, {
            type: "pr_opened",
            title: `${event.repo.name}#${event.payload.pull_request.number}`,
            time: eventTime.toISOString(),
            link: event.payload.pull_request.html_url,
            text: event.payload.pull_request.title,
          });
        } else if (
          event.payload.action === "closed" &&
          event.payload.pull_request?.merged
        ) {
          const turnaroundTime: number = await calculateTurnaroundTime(event);
          appendEvent(user, {
            type: "pr_merged",
            title: `${event.repo.name}#${event.payload.pull_request.number}`,
            time: eventTime.toISOString(),
            link: event.payload.pull_request.html_url,
            text: event.payload.pull_request.title,
            turnaround_time: turnaroundTime,
          });
          await addCollaborations(event, eventTime);
        }
        break;
      case "PullRequestReviewEvent":
        appendEvent(user, {
          type: "pr_reviewed",
          time: eventTime.toISOString(),
          title: `${event.repo.name}#${event.payload.pull_request.number}`,
          link: event.payload.review.html_url,
          text: event.payload.pull_request.title,
        });
        break;
      default:
        break;
    }
  }
  return processedData;
};
function loadUserData(user: string, dataDir: string) {
  const file = path.join(dataDir, `${user}.json`);
  console.log(`Loading user data from ${file}`);

  try {
    const response = fs.readFileSync(file);
    const data: ActivityData = JSON.parse(response.toString());
    return data;
  } catch (error: any) {
    if (error.code === "ENOENT" || error.name === "SyntaxError") {
      console.log(`User data not found for ${user}`);
      return { activity: [] };
    } else {
      throw error; // rethrow unexpected errors
    }
  }
}
function saveUserData(
  user: string,
  data: ActivityData,
  dataDir: string,
  serializer: any,
) {
  const file = path.join(dataDir, `${user}.json`);
  console.log(`Saving user data to ${file}`);

  try {
    const jsonData = JSON.stringify(data, serializer, 2);
    fs.writeFileSync(file, jsonData);
  } catch (error: any) {
    console.error(`Failed to save user data for ${user}: ${error.message}`);
    throw error;
  }
}
const merged_data = async (dataDir: string) => {
  console.log("Updating data");
  fs.mkdirSync(dataDir, { recursive: true });

  for (let user in processedData) {
    if (processedData.hasOwnProperty(user)) {
      console.log(`Merging user data for ${user}`);
      let oldData = await loadUserData(user, dataDir);
      let userData = processedData[user];
      let newUniqueEvents = [];

      for (let event of userData.activity) {
        if (
          !oldData.activity.some(
            (oldEvent) => JSON.stringify(oldEvent) === JSON.stringify(event),
          )
        ) {
          newUniqueEvents.push(event);
        }
      }

      userData.activity = newUniqueEvents.concat(oldData.activity);
      saveUserData(user, userData, dataDir, null);
    }
  }
};

const scrapeGitHub = async (
  org: string,
  date: string,
  numDays: number = 1,
): Promise<void> => {
  const endDate: Date = startOfDay(parseISO(date));
  const startDate: Date = startOfDay(subDays(endDate, numDays));
  console.log(
    `Scraping GitHub data for ${org} from ${formatISO(startDate)} to ${formatISO(endDate)}`,
  );

  const events: IGitHubEvent[] = (await fetchEvents(
    org,
    startDate,
    endDate,
  )) as IGitHubEvent[];
  processedData = await parse_event(events);

  for (const user of Object.keys(processedData)) {
    try {
      await fetch_merge_events(user, org);
    } catch (e) {
      console.error(`Error fetching merge events for ${user}: ${e}`);
    }
    try {
      await fetchOpenPulls(user, org);
    } catch (e) {
      console.error(`Error fetching open pulls for ${user}: ${e}`);
    }
  }

  console.log("Scraping completed");
};

// Type Done and check done
const main = async () => {
  // Extract command line arguments (skip the first two default arguments)
  const args: string[] = process.argv.slice(2);

  // Destructure arguments with default values
  const [
    orgName,
    dataDir,
    date = formatISO(subDays(new Date(), 1), { representation: "date" }),
    numDays = 1,
  ] = args;

  if (!orgName || !dataDir) {
    console.error("Usage: node script.js <org> <dataDir> [date] [numDays]");
    process.exit(1);
  }

  await scrapeGitHub(orgName, date, Number(numDays));
  await merged_data(dataDir);
  console.log("Done");
};

main();
