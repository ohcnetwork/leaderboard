import { IGitHubEvent } from "@/lib/gh_events";
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
  const events = await getEvents().then((res: any) =>
    res.data
      .filter(excludeBlacklistedEvents)
      .filter(exludeBotEvents)
      .slice(0, 5),
  );

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8 mt-4 flex flex-col gap-4 space-y-4">
        {events ? (
          events.map((e) => <GitHubEvent key={e.id} event={e} />)
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

async function getEvents() {
  const response = await octokit.request("GET /orgs/{org}/events", {
    org: env.NEXT_PUBLIC_GITHUB_ORG,
    per_page: 100,
    page: 1,
  });

  return response;
}
