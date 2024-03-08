import { IGitHubEvent, combineSimilarPushEvents } from "@/lib/gh_events";
import GitHubEvent from "./GitHubEvent";
import { env } from "@/env.mjs";
import octokit from "@/lib/octokit";

const exludeBotEvents = (event: IGitHubEvent) => {
  return !event.actor.login.includes("bot");
};

const excludeBlacklistedEvents = (event: IGitHubEvent) => {
  const blacklist = [
    "CreateEvent",
    "WatchEvent",
    "PullRequestReviewEvent",
    "PullRequestReviewCommentEvent",
    "DeleteEvent",
    "IssueCommentEvent",
  ] as IGitHubEvent["type"][];

  return !blacklist.includes(event.type);
};

export default async function GitHubEvents({ minimal }: { minimal?: boolean }) {
  const events = await getEvent().then((data: any) =>
    data.filter(excludeBlacklistedEvents).filter(exludeBotEvents).slice(0, 5),
  );
  if (!env.NEXT_PUBLIC_GITHUB_ORG) {
    throw new Error("Missing NEXT_PUBLIC_GITHUB_ORG");
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8 mt-4 flex flex-col gap-4 space-y-4">
        {events ? (
          events.map((e: any) => (
            <GitHubEvent key={e.id} event={e as IGitHubEvent | undefined} />
          ))
        ) : (
          <>
            <GitHubEvent />
            <GitHubEvent />
            <GitHubEvent />
            <GitHubEvent />
            <GitHubEvent />
          </>
        )}
      </ul>
    </div>
  );
}

async function getEvent() {
  const response = await octokit.paginate("GET /orgs/{org}/events", {
    org: env.NEXT_PUBLIC_GITHUB_ORG,
    per_page: 100,
    page: 1,
  });

  return response;
}
