import { fetchGithubDiscussion } from "../../lib/discussion";
import GithubDiscussions from "../../components/discussions/GithubDiscussions";

const page = async () => {
  const discussions = await fetchGithubDiscussion();

  return (
    <div className="gap-5">
      <GithubDiscussions discussions={discussions} />
      {/* In future we have more discussion here */}
    </div>
  );
};

export default page;
