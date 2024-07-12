"use client";
import GithubDiscussion from "@/components/discussions/GithubDiscussion";
import { parseDateRangeSearchParam } from "@/lib/utils";
import { ParsedDiscussion } from "@/scraper/src/github-scraper/types";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface Params {
  discussions: ParsedDiscussion[];
  minimal?: boolean;
}

const GithubDiscussions = ({ discussions }: Params) => {
  const [filterDiscussions, setFilterDiscussions] =
    useState<ParsedDiscussion[]>(discussions);

  const filter = useSearchParams().get("category");
  const dateRange = useSearchParams().get("between");

  useEffect(() => {
    let filterData = discussions;
    const [start, end] = parseDateRangeSearchParam(dateRange);
    if (dateRange && filter) {
      filterData = discussions.filter((discussion) => {
        const discussionDate = new Date(discussion.time);
        return (
          discussionDate >= new Date(start) &&
          discussionDate <= new Date(end) &&
          discussion.category?.name === filter
        );
      });
    } else if (dateRange) {
      filterData = discussions.filter((discussion) => {
        const discussionDate = new Date(discussion.time);
        return (
          discussionDate >= new Date(start) && discussionDate <= new Date(end)
        );
      });
    } else if (filter) {
      filterData = discussions.filter(
        (discussion) => discussion.category?.name === filter,
      );
    }

    setFilterDiscussions(filterData);
  }, [filter, discussions, dateRange]);

  return (
    <div className="flex w-full flex-col items-center justify-center lg:w-[90%]">
      {filterDiscussions.length > 0 ? (
        <>
          {filterDiscussions.map(
            (discussion: ParsedDiscussion, index: number) => (
              <GithubDiscussion key={index} discussion={discussion} />
            ),
          )}
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
