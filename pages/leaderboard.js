import LeaderboardCard from "../components/contributors/LeaderboardCard";
import TopContributor from "../components/contributors/TopContributor";
import Header from "../components/Header";
import PageHead from "../components/PageHead";
import { getContributors } from "../lib/api";
import Image from "next/image";

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
  { slug: "issue_assigned", title: "Issues Assigned" },
  { slug: "issue_opened", title: "Issues Opened" },
  { slug: "comment_created", title: "Comments Created" },
];

export default function Home(props) {
  return (
    <div className="bg-gray-900 min-h-screen">
      <PageHead title="Leaderboard"/>
      <Header/>
      <section className="bg-gray-900 border-t border-gray-600 relative">
        <div className="max-w-6xl mx-auto">
          <div className="border-gray-600 mx-4 xl:mx-0">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 2xl:gap-5 px-0 pb-10 lg:pb-20">
              <div className="lg:col-span-7 2xl:col-span-8">
                <div className="sticky top-0 pt-24">
                  <div className="terminal-container-bg border text-white rounded-lg border-primary-500">
                    <div className="flex space-x-2 px-6 py-3 border-b border-primary-500 ">
                      <span>
                        Leaderboard of the week | Week{" "}
                        {getWeekNumber(new Date())}
                      </span>
                    </div>
                    <ul className="space-y-6 lg:space-y-8 p-4 lg:p-2 ">
                      {props.contributors
                        .filter((contributor) => contributor.intern)
                        .map((contributor, index) => {
                          return (
                            <li key={contributor.github}>
                              <LeaderboardCard
                                position={index}
                                key={contributor.github}
                                contributor={contributor}
                              />
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 2xl:col-span-4">
                <div>
                  <div className="mx-auto py-12 px-4 max-w-6xl sm:px-6 lg:px-8 lg:py-24">
                    <div className="space-y-12">
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
                        {props.categoryLeaderboard.map((category, index) => {
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

      <footer className="">
        <div className="bg-gray-800 p-4 lg:p-10 border-t border-gray-700 h-full">
          <div className="max-w-5xl font-bold text-primary-500 text-center text-sm lg:leading-tight lg:mx-auto">
            <div className="flex items-center justify-center w-full">
              Powered by{" "}
              <span className={"w-20 ml-4"}>
                <Image src="/logo.webp" alt="Coronasafe" width="80" height="21.88" layout="responsive" />
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  const contributors = getContributors();
  const categoryLeaderboard = categories.map((category) => ({
    ...category,
    contributor: contributors
      .filter((contributor) => contributor.intern)
      .sort((a, b) => {
        return b.weekSummary[category.slug] - a.weekSummary[category.slug];
      })[0],
  }));
  return {
    props: {
      contributors: contributors,
      categoryLeaderboard: categoryLeaderboard,
    },
  };
}
