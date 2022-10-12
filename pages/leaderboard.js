import { useState, useEffect } from "react";
import LeaderboardCard from "../components/contributors/LeaderboardCard";
import TopContributor from "../components/contributors/TopContributor";
import Filters from "../components/filters/Filters";
import { getContributors } from "../lib/api";
import { TbZoomQuestion } from "react-icons/tb";

// Calculate week number
const getWeekNumber = (date) => {
  const d = new Date(date);
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const categories = [
  { slug: "eod_update", title: "EOD Updates" },
  { slug: "pr_opened", title: "Pull Requests Opened" },
  { slug: "pr_merged", title: "Pull Requests Merged" },
  { slug: "pr_reviewed", title: "Pull Requests Reviewed" },
  { slug: "issue_opened", title: "Issues Opened" },
  { slug: "comment_created", title: "Comments Created" },
];

export default function Home(props) {
  const [contributors, setContributors] = useState(props.contributors);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("points");
  const [sortDescending, setSortDescending] = useState(true);
  const [showCoreMembers, setShowCoreMembers] = useState(false);
  const [categoryLeaderboard, setCategoryLeaderboard] = useState([]);

  useEffect(() => {
    let filteredContributors = props.contributors;

    if (!showCoreMembers) {
      filteredContributors = filteredContributors.filter(
        (contributor) => !contributor.core
      );
    }

    if (searchTerm) {
      const searchTermLC = searchTerm.toLowerCase();
      filteredContributors = filteredContributors.filter(
        (contributor) =>
          contributor.name.toLowerCase().includes(searchTermLC) ||
          contributor.github.toLowerCase().includes(searchTermLC) ||
          contributor.linkedin.toLowerCase().includes(searchTermLC) ||
          contributor.twitter.toLowerCase().includes(searchTermLC)
      );
    }

    filteredContributors = filteredContributors.sort(
      (a, b) => a.weekSummary[sortBy] - b.weekSummary[sortBy]
    );

    if (sortDescending) {
      filteredContributors = filteredContributors.reverse();
    }

    setCategoryLeaderboard(() => {
      let temp = props.contributors;
      if (!showCoreMembers) {
        temp = temp.filter((contributor) => !contributor.core);
      }
      return categories.map((category) => ({
        ...category,
        contributor: temp.sort(
          (a, b) => b.weekSummary[category.slug] - a.weekSummary[category.slug]
        )[0],
      }));
    });

    setContributors([...filteredContributors]);
  }, [props.contributors, searchTerm, sortBy, sortDescending, showCoreMembers]);

  return (
    <section className="bg-gray-900 border-t border-gray-600">
      <div className="max-w-6xl mx-auto">
        <Filters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDescending={sortDescending}
          setSortDescending={setSortDescending}
          showCoreMembers={showCoreMembers}
          setShowCoreMembers={setShowCoreMembers}
        />
        <div className="border-gray-600 mx-4 xl:mx-0">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 2xl:gap-5 px-0 pb-10 lg:pb-20">
            <div className="lg:col-span-7 2xl:col-span-8">
              <div className="sticky top-0 pt-6">
                <div className="terminal-container-bg border text-white rounded-lg border-primary-500">
                  <div className="flex space-x-2 px-6 py-3 border-b border-primary-500 ">
                    <span>
                      Live Leaderboard of last 7 days | Week{" "}
                      {getWeekNumber(new Date())} of {new Date().getFullYear()}
                    </span>
                  </div>
                  {contributors.length ? (
                    <ul className="space-y-6 lg:space-y-8 p-2 lg:p-2 overflow-x-auto">
                      {contributors.map((contributor, index) => {
                        return (
                          <li key={contributor.github}>
                            <LeaderboardCard
                              position={searchTerm ? -1 : index}
                              key={contributor.github}
                              contributor={contributor}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="my-4 overflow-x-auto">
                      <div className="flex flex-row justify-center">
                        <TbZoomQuestion size={25} />{" "}
                        <span className="ml-4">No results found</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 2xl:col-span-4">
              <div>
                <div className="mx-auto py-12 px-4 max-w-6xl sm:px-6 lg:px-8 lg:py-24 ">
                  <div className="space-y-12 p-4 border border-primary-500 rounded-lg">
                    <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                      <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                        Top Contributors of the week
                      </h2>
                      <p className="text-xl text-gray-300">
                        Our top contributers across different metrics
                      </p>
                    </div>
                    <ul
                      role="list"
                      className="space-y-4 sm:grid sm:grid-cols-1 sm:gap-6 sm:space-y-0 lg:grid-cols-1 lg:gap-8"
                    >
                      {categoryLeaderboard.map((category, index) => {
                        return (
                          <TopContributor
                            key={index}
                            contributor={category.contributor}
                            category={category}
                            minimal={true}
                          />
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function getStaticProps() {
  const contributors = getContributors();

  const calculateStalePrs = (contributor) =>
    contributor.activityData?.open_prs?.reduce(
      (acc, pr) => (pr?.stale_for >= 7 ? acc + 1 : acc),
      0
    );

  return {
    props: {
      title: "Leaderboard",
      contributors: contributors.map((contributor) => ({
        ...contributor,
        weekSummary: {
          ...contributor.weekSummary,
          pr_stale: calculateStalePrs(contributor),
        },
      })),
    },
  };
}
