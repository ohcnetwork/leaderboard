import { fetchGithubDiscussion } from "../../lib/discussion";
import GithubDiscussions from "../../components/discussions/GithubDiscussions";

interface Params {
  searchParams: { [key: string]: string };
}

const page = async ({ searchParams }: Params) => {
  const discussions = await fetchGithubDiscussion();

  return (
    <GithubDiscussions discussions={discussions} searchParams={searchParams} />
  );
};

export default page;
