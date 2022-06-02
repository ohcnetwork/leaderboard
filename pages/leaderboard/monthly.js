import Header from "../../components/Header";
import PageHead from "../../components/PageHead";
import Footer from "../../components/Footer";
import MainLeaderboard from "../../components/leaderboard/MainLeaderboard";
import CategoryLeaderboard from "../../components/leaderboard/CategoryLeaderboard";
import { getContributors } from "../../lib/api";
import { getWeekNumber } from "../../lib/utils";
import { categories } from "../../lib/leaderboard";

function getMonthDescription() {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 28);

  const formatOptions = { day: "2-digit", month: "long" };
  const startStr = start.toLocaleDateString(undefined, formatOptions);
  const endStr = end.toLocaleDateString(undefined, formatOptions);

  return `${startStr} - ${endStr}`;
}

export default function Home(props) {
  return (
    <div className="bg-gray-900 min-h-screen">
      <PageHead title="Leaderboard" />
      <Header />
      <section className="bg-gray-900 border-t border-gray-600 ">
        <div className="max-w-6xl mx-auto">
          <div className="border-gray-600 mx-4 xl:mx-0">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 2xl:gap-5 px-0 pb-10 lg:pb-20">
              <MainLeaderboard
                description={`Live Leaderboard of last 28 days | ${getMonthDescription()}`}
                contributors={props.contributors}
                link={{
                  href: "/leaderboard",
                  description: "View Weekly",
                }}
              />
              <CategoryLeaderboard
                durationType="month"
                categoryLeaderboard={props.categoryLeaderboard}
              />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export async function getStaticProps() {
  const contributors = getContributors(false, "monthSummary").map(
    (contributor) => ({
      ...contributor,
      // Voluntarily reassigning so that LeaderboardCard component need not be
      // aware of where it is (monthly or weekly leaderboard).
      summary: contributor.monthSummary,
    })
  );
  const categoryLeaderboard = categories.map((category) => ({
    ...category,
    contributor: contributors
      .filter((contributor) => contributor.intern)
      .sort((a, b) => {
        return b.monthSummary[category.slug] - a.monthSummary[category.slug];
      })[0],
  }));
  return {
    props: {
      contributors: contributors,
      categoryLeaderboard: categoryLeaderboard,
    },
  };
}
