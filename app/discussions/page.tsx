import { fetchGithubDiscussion } from "../../lib/discussion";
import GithubDiscussions from "../../components/discussions/GithubDiscussions";

interface Params {
  searchParams: { [key: string]: string };
}

export default async function Page({ searchParams }: Params) {
  const discussions = await fetchGithubDiscussion();

  return (
    discussions && (
      <GithubDiscussions
        discussions={discussions}
        searchParams={searchParams}
      />
    )
  );
}
