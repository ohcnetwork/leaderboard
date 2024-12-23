import { getContributors } from "@/lib/api";
import Link from "next/link";
import GithubDiscussions from "@/components/discussions/GithubDiscussions";
import { fetchGithubDiscussion } from "@/lib/discussion";

export default async function Page() {
  const discussions = await fetchGithubDiscussion();

  if (!discussions) {
    return null;
  }

  const contributors = await calculateContributor();

  return (
    <>
      <GithubDiscussions discussions={discussions} searchParams={{}} />
      <div className="mb-4 h-fit w-full rounded-lg pt-7 lg:fixed lg:right-28 lg:top-20 lg:w-[23%]">
        <div className="bg-secondary-100/50 dark:bg-secondary-800/50 w-full border border-secondary-100  shadow-lg dark:border-secondary-800">
          <div className="flex flex-col justify-between rounded-t-lg border-b border-secondary-300 bg-secondary-100 px-6 py-4 dark:border-secondary-700 dark:bg-secondary-800 md:flex-row md:items-center">
            <h4 className="font-bold">Most Helpful</h4>
          </div>
          <div className="flex flex-col gap-2 p-4 ">
            {contributors
              .filter((contributor) => contributor.points > 0)
              .sort((a, b) => b.points - a.points)
              .slice(0, 3)
              .map((contributor, index) => (
                <Link
                  key={index}
                  href={`/contributors/${contributor.githubHandle}`}
                >
                  <span className="flex cursor-pointer items-center space-x-3 rounded-lg bg-background px-2 py-3 transition duration-300 hover:shadow-lg hover:shadow-primary-500">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100 text-lg dark:bg-secondary-800">
                      {index + 1}
                    </span>
                    <span className="text-lg font-medium">
                      {contributor.name}
                    </span>
                  </span>
                </Link>
              ))}
          </div>
          <div className="pt-2">
            <Link
              className="block rounded border border-primary-500 bg-gradient-to-b from-primary-500 to-primary-700 p-3 px-10 text-center font-bold text-white shadow-lg transition hover:from-secondary-800 hover:to-secondary-900 hover:text-primary-500 hover:shadow-xl"
              href="/leaderboard/last-week?ordering=discussion_created"
            >
              Show More
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

interface Contributor {
  name: string;
  points: number;
  githubHandle: string;
}

async function calculateContributor() {
  const contributors = await getContributors();

  // If we have contributors then we will calculate the top contributors and save it in an array of objects {name, points, githubHandle}
  // points = 1 for each comment + 2 for creating a discussion + 5 discussion marked as helpful
  if (contributors) {
    const uniqueContributors: Contributor[] = [];

    contributors.forEach((contributor) => {
      const existingContributor = uniqueContributors.find(
        (c) => c.name === contributor.name,
      );

      const points =
        contributor.highlights.discussion_answered ||
        contributor.highlights.discussion_created ||
        contributor.highlights.discussion_comment_created ||
        0;

      if (existingContributor) {
        existingContributor.points += points;
      } else {
        uniqueContributors.push({
          name: contributor.name,
          points: points,
          githubHandle: contributor.slug,
        });
      }
    });

    return uniqueContributors;
  }

  return [];
}
