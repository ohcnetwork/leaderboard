import { GoIssueOpened, GoIssueClosed } from "react-icons/go";
import { BiGitPullRequest } from "react-icons/bi";
import { TbGitMerge } from "react-icons/tb";
import { getLeaderboardData } from "@/app/api/leaderboard/functions";
import PosterGenerator from "./PosterGenerator";
import { format } from "date-fns";
import Image from "next/image";
import { calcDateRange } from "@/lib/utils";

export default async function PostersPage() {
  const dateRange = calcDateRange("last-week")!;
  const data = await getLeaderboardData(dateRange);

  // Calculate total stats for the week
  const weekStats = data.reduce(
    (acc, contributor) => ({
      issuesOpened:
        acc.issuesOpened + (contributor.highlights.issue_opened || 0),
      issuesClosed:
        acc.issuesClosed + (contributor.highlights.issue_closed || 0),
      prsOpened: acc.prsOpened + (contributor.highlights.pr_opened || 0),
      prsMerged: acc.prsMerged + (contributor.highlights.pr_merged || 0),
    }),
    { issuesOpened: 0, issuesClosed: 0, prsOpened: 0, prsMerged: 0 },
  );

  const currentDate = format(new Date(), "yyyy-MM-dd");
  const formattedDate = format(new Date(), "MMMM d, yyyy");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Community Stats Posters</h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* LinkedIn Poster (1:1) */}
        <PosterGenerator
          aspectRatio="1:1"
          filename={`community-stats-linkedin-${currentDate}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden p-12 pt-8">
            {/* Logo */}
            <div className="absolute right-4 top-4 w-24">
              <Image
                src="/logo.png"
                alt="OHC Network Logo"
                width={96}
                height={96}
                className="h-auto w-full"
              />
            </div>

            {/* Background Pattern */}
            <div className="absolute inset-0 -z-10 bg-black opacity-25">
              <div className="flex flex-wrap justify-between gap-1 p-1">
                {Array(48)
                  .fill(null)
                  .map((_, index) =>
                    data.map((c) => (
                      <Image
                        key={`${c.user.social.github}-${index}`}
                        height={48}
                        width={48}
                        className="h-12 w-12 rounded-lg"
                        src={`https://avatars.githubusercontent.com/${c.user.social.github}?s=128`}
                        alt={c.user.social.github}
                      />
                    )),
                  )}
              </div>
            </div>

            {/* Content */}
            <div className="flex w-full max-w-2xl flex-col items-center">
              <h3 className="mb-4 text-center text-2xl font-bold md:mb-8">
                Weekly Stats
              </h3>

              <div className="w-full rounded-xl bg-background p-6 backdrop-blur-sm">
                <div className="grid w-full grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4 rounded-lg border border-secondary-600 p-6 dark:border-secondary-300">
                    <GoIssueOpened className="text-2xl text-green-500" />
                    <div>
                      <p className="text-sm text-secondary-500 dark:text-secondary-300">
                        Issues Opened
                      </p>
                      <p className="text-xl font-semibold">
                        {weekStats.issuesOpened}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg border border-secondary-600 p-6 dark:border-secondary-300">
                    <GoIssueClosed className="text-2xl text-purple-500" />
                    <div>
                      <p className="-mt-1 text-sm text-secondary-500 dark:text-secondary-300">
                        Issues Closed
                      </p>
                      <p className="text-xl font-semibold">
                        {weekStats.issuesClosed}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg border border-secondary-600 p-6 dark:border-secondary-300">
                    <BiGitPullRequest className="text-2xl text-blue-500" />
                    <div>
                      <p className="text-sm text-secondary-500 dark:text-secondary-300">
                        PRs Opened
                      </p>
                      <p className="text-xl font-semibold">
                        {weekStats.prsOpened}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-lg border border-secondary-600 p-6 dark:border-secondary-300">
                    <TbGitMerge className="text-2xl text-primary-500" />
                    <div>
                      <p className="text-sm text-secondary-500 dark:text-secondary-300">
                        PRs Merged
                      </p>
                      <p className="text-xl font-semibold">
                        {weekStats.prsMerged}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="absolute bottom-4 left-4 text-xs font-semibold text-secondary-500 opacity-40">
              Taken on: {formattedDate}
            </p>
          </div>
        </PosterGenerator>

        {/* Instagram Poster (9:16) */}
        {/* <PosterGenerator
          aspectRatio="9:16"
          filename={`community-stats-instagram-${currentDate}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-between overflow-hidden p-12 pt-6">
            
            <div className="absolute right-8 top-8 w-24">
              <Image
                src="/logo.png"
                alt="OHC Network Logo"
                width={96}
                height={96}
                className="h-auto w-full"
              />
            </div>

          
            <div className="absolute inset-0 -z-10 opacity-10">
              <div className="grid grid-cols-4 gap-1 p-2">
                {Array(24).fill(null).map((_, index) => (
                  data.map((c) => (
                    <Image
                      key={`${c.user.social.github}-${index}`}
                      height={48}
                      width={48}
                      className="h-12 w-12 rounded-lg"
                      src={`https://avatars.githubusercontent.com/${c.user.social.github}?s=128`}
                      alt={c.user.social.github}
                    />
                  ))
                ))}
              </div>
            </div>

            
            <div className="flex w-full flex-col items-center">
              <h2 className="mb-6 text-xl font-medium">Contributions</h2>

              <div className="w-full max-w-2xl rounded-xl border-2 border-primary-500 bg-background p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-center text-xl font-bold">
                  This Week&apos;s Stats
                </h3>
                <div className="grid w-full gap-4">
                  <div className="bg-background/80 flex items-center space-x-2 rounded-lg border border-secondary-600 p-4 dark:border-secondary-300">
                    <GoIssueOpened className="text-2xl text-green-500" />
                    <div>
                      <p className="text-sm text-secondary-500 dark:text-secondary-300">
                        Issues Opened
                      </p>
                      <p className="text-xl font-semibold">
                        {weekStats.issuesOpened}
                      </p>
                    </div>
                  </div>
                  <div className="bg-background/80 flex items-center space-x-2 rounded-lg border border-secondary-600 p-4 dark:border-secondary-300">
                    <GoIssueClosed className="text-2xl text-purple-500" />
                    <div>
                      <p className="text-sm text-secondary-500 dark:text-secondary-300">
                        Issues Closed
                      </p>
                      <p className="text-xl font-semibold">
                        {weekStats.issuesClosed}
                      </p>
                    </div>
                  </div>
                  <div className="bg-background/80 flex items-center space-x-2 rounded-lg border border-secondary-600 p-4 dark:border-secondary-300">
                    <BiGitPullRequest className="text-2xl text-blue-500" />
                    <div>
                      <p className="text-sm text-secondary-500 dark:text-secondary-300">
                        PRs Opened
                      </p>
                      <p className="text-xl font-semibold">
                        {weekStats.prsOpened}
                      </p>
                    </div>
                  </div>
                  <div className="bg-background/80 flex items-center space-x-2 rounded-lg border border-secondary-600 p-4 dark:border-secondary-300">
                    <TbGitMerge className="text-2xl text-primary-500" />
                    <div>
                      <p className="text-sm text-secondary-500 dark:text-secondary-300">
                        PRs Merged
                      </p>
                      <p className="text-xl font-semibold">
                        {weekStats.prsMerged}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-secondary-400">{formattedDate}</p>
          </div>
        </PosterGenerator> */}
      </div>
    </div>
  );
}
