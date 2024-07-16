import GithubDiscussion from "@/components/discussions/GithubDiscussion";
import { parseDateRangeSearchParam } from "@/lib/utils";
import { ParsedDiscussion } from "@/scraper/src/github-scraper/types";

interface Props {
  discussions: ParsedDiscussion[];
  searchParams?: { [key: string]: string };
}

const GithubDiscussions = ({ discussions, searchParams }: Props) => {
  const category = searchParams?.category;
  const dateRange = searchParams?.between;
  const [start, end] = parseDateRangeSearchParam(dateRange);

  if (category && dateRange) {
    discussions = discussions.filter(
      (discussion) =>
        new Date(discussion.time) >= new Date(start) &&
        new Date(discussion.time) <= new Date(end) &&
        discussion.category?.name === category,
    );
  } else if (category) {
    discussions = discussions.filter(
      (discussion) => discussion.category?.name === category,
    );
  } else if (dateRange) {
    discussions = discussions.filter(
      (discussion) =>
        new Date(discussion.time) >= new Date(start) &&
        new Date(discussion.time) <= new Date(end),
    );
  }

  return (
    <div className="flex w-full flex-col items-start justify-center lg:w-[90%]">
      {discussions.length > 0 ? (
        <>
          {discussions.map((discussion: ParsedDiscussion, index: number) => (
            <GithubDiscussion key={index} discussion={discussion} />
          ))}
        </>
      ) : (
        <div className="mt-40 text-center text-xl font-medium text-secondary-200">
          No Discussions Found
        </div>
      )}
    </div>
  );
};

export default GithubDiscussions;
