import { fetchGithubDiscussion } from "../../lib/discussion";
import GithubDiscussions from "../../components/discussions/GithubDiscussions";
import DiscussionLeaderboard from "@/components/discussions/DiscussionLeaderboard";

export default async function Page() {
  const discussions = await fetchGithubDiscussion();

  if (!discussions) return null;

  return (
    <>
      <GithubDiscussions discussions={discussions} searchParams={{}} />
      <DiscussionLeaderboard />
    </>
  );
}
