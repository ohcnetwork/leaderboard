import {
  Activity,
  IGitHubEvent,
  ProcessData,
  PullRequestEvent,
} from "./types.js";
import { calculateTurnaroundTime } from "./utils.js";
import { parseISO } from "date-fns";
import { isBlacklisted } from "./utils.js";
import { octokit } from "./config.js";

const processedData: ProcessData = {};
const defaultBranches: Record<string, string> = {};

async function getDefaultBranch(owner: string, repo: string) {
  if (defaultBranches[repo] == null) {
    try {
      const { data } = await octokit.request("GET /repos/{owner}/{repo}", {
        owner,
        repo,
      });
      defaultBranches[repo] = data.default_branch;
    } catch (e) {
      console.error(`Error fetching default branch for  ${owner}/${repo} `);
    }
  }
  return defaultBranches[repo];
}
function appendEvent(user: string, event: Activity) {
  if (isBlacklisted(user)) {
    return;
  }
  console.debug(
    `Appending ${event.type} event for user ${user}. ${event.link}`,
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
}

const nameUserCache: { [key: string]: string } = {};
const emailUserCache: { [key: string]: string } = {};

async function addCollaborations(event: PullRequestEvent, eventTime: Date) {
  const collaborators: Set<string> = new Set();

  const [owner, repo] = event.repo.name.split("/");
  const defaultBranch = await getDefaultBranch(owner, repo);
  if (event.payload.pull_request.base.ref !== defaultBranch) {
    return;
  }

  const url = event.payload.pull_request?.commits_url;
  const { data: commits } = await octokit.request("GET " + url);
  for (const commit of commits) {
    // Merge commits has more than 1 parent commits; skip merge commit authors from being counted as collaborators
    if (commit.parents.length > 1) {
      continue;
    }

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
    const collaboratorArray = Array.from(collaborators);
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

export const parseEvents = async (events: IGitHubEvent[]) => {
  for (const event of events) {
    const eventTime = parseISO(event.created_at);
    const user = event.actor.login;
    if (isBlacklisted(user)) continue;

    console.log(
      "Processing event for user:",
      user + " | " + "event_id : ",
      event.id,
    );

    switch (event.type) {
      case "IssueCommentEvent":
        if (event.payload.action === "created") {
          appendEvent(user, {
            type: "comment_created",
            title: `${event.repo.name}#${event.payload.issue.number}`,
            time: eventTime?.toISOString(),
            link: event.payload.comment.html_url,
            text: event.payload.comment.body,
          });
        }
        break;
      case "IssuesEvent":
        if (["opened", "assigned", "closed"].includes(event.payload.action)) {
          appendEvent(user, {
            type: `issue_${event.payload.action}`,
            title: `${event.repo.name}#${event.payload.issue.number}`,
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
          let turnaroundTime: number | undefined = undefined;
          try {
            turnaroundTime = await calculateTurnaroundTime(event);
          } catch (e) {
            console.error(
              `Error calculating turnaround time for event ${event.id}: ${e}`,
              `Likely due to PR author ${event.payload.pull_request.user.login} being deleted`,
              event,
            );
          }
          appendEvent(event.payload.pull_request.user.login, {
            type: "pr_merged",
            title: `${event.repo.name}#${event.payload.pull_request.number}`,
            time: eventTime?.toISOString(),
            link: event.payload.pull_request.html_url,
            text: event.payload.pull_request.title,
            turnaround_time: turnaroundTime,
          });
          try {
            await addCollaborations(event, eventTime);
          } catch (e) {
            console.error(
              `Error adding collaborations for event ${event.id}: ${e}`,
              event,
            );
          }
        }
        break;
      case "PullRequestReviewEvent":
        if (event.payload.pull_request.user.login !== user) {
          appendEvent(user, {
            type: "pr_reviewed",
            time: eventTime?.toISOString(),
            title: `${event.repo.name}#${event.payload.pull_request.number}`,
            link: event.payload.review.html_url,
            text: event.payload.pull_request.title,
          });
        }
        break;
      default:
        break;
    }
  }
  return processedData;
};
