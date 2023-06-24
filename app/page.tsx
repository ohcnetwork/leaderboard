import InfoCard from '../components/contributors/InfoCard';
import Link from 'next/link';
import { getContributors } from '../lib/api';
import { getLastWeekDateRangeString } from '../lib/utils';

export default function Home() {
  const contributors: any = getContributors();
  const dateRange = getLastWeekDateRangeString();
  return (
    <div className="bg-gray-900 min-h-screen">
      <section className="bg-gray-900 border-t border-gray-700 ">
        <div className="max-w-6xl mx-auto">
          <div className="border-gray-600 mx-4 xl:mx-0">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 2xl:gap-5 px-0 pb-10 lg:pb-20">
              <div className="lg:col-span-8 space-y-20">
                {process.env.NEXT_PUBLIC_ORG_INFO ? (
                  <div className="pt-20">
                    <div className="mx-auto max-w-7xl">
                      <div className="space-y-12">
                        <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                          <h2 className="text-3xl font-bold text-white tracking-tight sm:text-5xl">
                            What do we do?
                          </h2>
                          <p className="text-xl text-gray-300">
                            {process.env.NEXT_PUBLIC_ORG_INFO}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-0" />
                )}
                <div>
                  <div className="mx-auto">
                    <div className="space-y-12">
                      <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                        <h2 className="text-3xl font-bold text-white tracking-tight sm:text-5xl">
                          Our Contributors
                        </h2>
                        <p className="text-xl text-gray-300 hidden">
                          {process.env.NEXT_PUBLIC_CONTRIBUTORS_INFO}
                        </p>
                      </div>
                      <ul
                        role="list"
                        className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:grid-cols-2 lg:gap-8 mt-4"
                      >
                        {contributors.map((contributor: any, index: number) => {
                          return (
                            <InfoCard
                              key={index}
                              contributor={contributor}
                              minimal
                              isClickable
                            />
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="sticky top-0 pt-20">
                  <div className=" text-white rounded-lg bg-gray-800 bg-opacity-50 shadow-lg border border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between md:items-end bg-gray-800 rounded-t-lg px-6 py-4 border-b border-gray-700 ">
                      <p className="text-xl font-medium">Leaderboard</p>
                      <span className="block text-gray-400">{dateRange}</span>
                    </div>
                    <div className="space-y-2 p-4 ">
                      {contributors
                        .filter((contributor: any) => !contributor.core)
                        .slice(0, 5)
                        .map((contributor: any, index: number) => {
                          return (
                            <Link
                              key={index}
                              href={`/contributors/${contributor.github}`}
                            >
                              <span className="hover:shadow-lg hover:shadow-primary-500 transition duration-300 flex space-x-3 items-center cursor-pointer bg-gray-900 bg-opacity-75 px-2 py-3 rounded-lg hover:bg-opacity-30">
                                <span className="flex items-center justify-center text-lg h-10 w-10 bg-gray-800 rounded-full">
                                  {index + 1}
                                </span>
                                <span className="text-lg font-medium text-gray-300">
                                  {contributor.name}
                                </span>
                              </span>
                            </Link>
                          );
                        })}

                      <div className="pt-2">
                        <Link
                          className="block px-10 p-3 text-center bg-gradient-to-b from-primary-500 to-primary-700 text-gray-300 border border-primary-500 font-bold rounded shadow-lg hover:shadow-xl hover:from-gray-800 hover:to-gray-900 hover:text-primary-500 transition"
                          href="/leaderboard"
                        >
                          View Leaderboard
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
