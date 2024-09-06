import { fetchGithubDiscussion } from "../../lib/discussion";
import GithubDiscussions from "../../components/discussions/GithubDiscussions";

export default async function Page() {
  const discussions = await fetchGithubDiscussion();

  return (
    discussions && (
      <GithubDiscussions discussions={discussions} searchParams={{}} />
    )
  );
}
