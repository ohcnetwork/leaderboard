import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import InfoCard from "../components/contributors/InfoCard";
import Header from "../components/Header";
import PageHead from "../components/PageHead";
import { getContributors } from "../lib/api";

export default function Home(props) {
  return (
    <div className="bg-gray-900 min-h-screen">
      <PageHead/>
      <Header/>
      <section className="bg-gray-900 border-t border-gray-600 relative">
        <div className="max-w-6xl mx-auto">
          <div className="border-gray-600 mx-4 xl:mx-0">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 2xl:gap-5 px-0 pb-10 lg:pb-20">
              <div className="lg:col-span-7 2xl:col-span-8">
                <div className="pt-10 lg:pt-20">
                  <div className="mx-auto py-12 px-4 max-w-7xl sm:px-6 lg:px-8 lg:py-24">
                    <div className="space-y-12">
                      <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                          What do we do?
                        </h2>
                        <p className="text-xl text-gray-300">
                          CoronaSafe Network is a free and open-source disaster
                          management system that is used by National Health
                          Mission, Government of India and various state
                          governments for reimaging digital war rooms. The
                          solution that students got an opportunity to intern
                          with has supported 3.34Lac patient management and 1.29
                          Lac ambulance shiftings and is approved by the United
                          Nations as a Digital Public Good.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mx-auto py-12 px-4 max-w-6xl sm:px-6 lg:px-8 lg:py-24">
                    <div className="space-y-12">
                      <div className="space-y-5 sm:space-y-4 md:max-w-xl lg:max-w-3xl xl:max-w-none">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                          Our Contributors
                        </h2>
                        <p className="text-xl text-gray-300">
                          Ornare sagittis, suspendisse in hendrerit quis. Sed
                          dui aliquet lectus sit pretium egestas vel mattis
                          neque.
                        </p>
                      </div>
                      <ul
                        role="list"
                        className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:grid-cols-2 lg:gap-8"
                      >
                        {props.contributors.map((contributor, index) => {
                          return (
                            <InfoCard
                              key={index}
                              contributor={contributor}
                              minimal={true}
                            />
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 2xl:col-span-4">
                <div className="sticky top-0 pt-24">
                  <div className="terminal-container-bg border text-white rounded-lg border-primary-500">
                    <div className="flex space-x-2 px-6 py-3 border-b border-primary-500 ">
                      <span>Leaderboard | 18-24 May 2022 </span>
                    </div>
                    <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 ">
                      {props.contributors
                        .slice(0, 5)
                        .map((contributor, index) => {
                          return (
                            <Link
                              key={index}
                              href={`/contributors/${contributor.github}`}
                            >
                              <div className="flex " key={index}>
                                <span className="text-primary-500 text-xl">
                                  &#10142;
                                </span>
                                <p className="pl-3">
                                  <span className="cursor-pointer text-primary-500 hover:bg-primary-500 hover:text-gray-900 mr-1">
                                    {contributor.name}
                                  </span>
                                  | {index + 1}
                                </p>
                              </div>
                            </Link>
                          );
                        })}

                      <div className="pt-2">
                        <Link
                          className="block px-10 p-3 text-center bg-gradient-to-b from-primary-500 to-primary-700 text-gray-900 border border-primary-500 font-bold font-montserrat rounded shadow-lg hover:shadow-xl hover:from-gray-800 hover:to-gray-900 hover:text-primary-500 transition"
                          href="/leaderboard"
                        >
                          View Leaderboard
                        </Link>
                        <p className="text-yellow-400 font-semibold p-4 rounded bg-gray-800 bg-opacity-50 text-center md:text-lg hidden">
                          {"{"} Application Closed! {"}"}
                        </p>
                      </div>
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
                <img src="/logo.webp" alt="Coronasafe" />
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
  return {
    props: {
      contributors: contributors,
    },
  };
}
