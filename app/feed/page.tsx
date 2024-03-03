import LoadingText from "@/components/LoadingText";
import { IGitHubEvent } from "@/lib/gh_events";
import { Key } from "react";
import GitHubEvent from "@/components/gh_events/GitHubEvent";
import { fetchFilteredGitHubEvents } from "@/lib/github.server-action";
export const revalidate = 600;
type Props = {
  searchParams: {
    page?: string;
  };
};
export default async function FeedPage({ searchParams }: Props) {
  const events = await fetchFilteredGitHubEvents();
  if (!Object.entries(events).length) {
    return <LoadingText text="Fetching latest events" />;
  }
  return (
    <div className="relative mx-auto my-8 flow-root max-w-4xl p-4">
      <h1 className="text-4xl text-primary-500 dark:text-white">Feed</h1>
      <ul role="list" className="mb-20 mt-10 flex flex-col gap-4 space-y-4">
        {events.map(
          (e: IGitHubEvent | undefined, index: Key | null | undefined) => (
            <GitHubEvent key={index} event={e} />
          ),
        )}
      </ul>
    </div>
  );
}
