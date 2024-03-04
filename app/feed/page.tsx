import LoadingText from "@/components/LoadingText";
import { IGitHubEvent } from "@/lib/gh_events";
import GitHubEvent from "@/components/gh_events/GitHubEvent";
import { Octokit } from "octokit";
import getGitHubAccessToken from "@/lib/getGitHubAccessToken";

const GITHUB_PAT: string = getGitHubAccessToken() || "";
const GITHUB_ORG: string = process.env.NEXT_PUBLIC_GITHUB_ORG || "";

export const revalidate = 600;

type Props = {
  searchParams: {
    page?: string;
  };
};
const octokit = new Octokit({
  auth: GITHUB_PAT,
});

export default async function FeedPage({ searchParams }: Props) {
  const events = await octokit.paginate(
    "GET /orgs/{org}/events",
    {
      org: GITHUB_ORG,
      per_page: 1000,
    },
    (response: any) => {
      const data = response.data as IGitHubEvent[];
      const filteredData = data
        .filter(exludeBotEvents)
        .filter(excludeBlacklistedEvents);
      return filteredData;
    },
  );
  if (!Object.entries(events).length) {
    return <LoadingText text="Fetching latest events" />;
  }
  return (
    <div className="relative mx-auto my-8 flow-root max-w-4xl p-4">
      <h1 className="text-4xl text-primary-500 dark:text-white">Feed</h1>
      <ul role="list" className="mb-20 mt-10 flex flex-col gap-4 space-y-4">
        {events.map((e) => (
          <GitHubEvent key={e.id} event={e} />
        ))}
      </ul>
    </div>
  );
}

const excludeBlacklistedEvents = (event: IGitHubEvent): boolean => {
  const blacklist = [
    "CreateEvent",
    "WatchEvent",
    // "PullRequestReviewEvent",
    "PullRequestReviewCommentEvent",
    "DeleteEvent",
    "IssueCommentEvent",
  ] as IGitHubEvent["type"][];

  return !blacklist.includes(event.type);
};

const exludeBotEvents = (event: IGitHubEvent): boolean => {
  return !event.actor.login.includes("bot");
};
