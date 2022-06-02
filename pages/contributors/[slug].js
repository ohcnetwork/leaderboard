import React from "react";
import markdownToHtml from "../../lib/markdownToHtml";
import Head from "next/head";

import InfoCard from "../../components/contributors/InfoCard";
import GithubActivity from "../../components/contributors/GithubActivity";

import { getContributorBySlug, getContributors } from "../../lib/api";
import Link from "next/link";

import ActivityCalendar from "react-activity-calendar";
import PageHead from "../../components/PageHead";
import Header from "../../components/Header";
// export function defaultCalendarData() {
//   return [...Array(365)].map((_, i) => {
//     // Current Date - i
//     const iReverse = 365 - i;
//     const date = new Date(
//       new Date().getTime() - iReverse * 24 * 60 * 60 * 1000
//     );
//     return {
//       date: date.toISOString(),
//       count: 0,
//       level: 0,
//     };
//   });
// }

export default function Contributor({ contributor, slug }) {
  // const md_content = xss(marked.parse(contributor.content));

  return (
    <div className="bg-gray-900 min-h-screen">
      <PageHead title={contributor.name} />
      <Header />
      <section className="max-w-6xl mx-auto bg-gray-900 border-t border-gray-600 p-4">
        <div className="space-y-4 sm:grid sm:grid-cols-1 sm:gap-6 sm:space-y-0 lg:grid-cols-3 lg:gap-8">
          <div className="md:sticky md:top-0 shadow">
            <InfoCard contributor={contributor} />
          </div>

          <div className="col-span-2">
            <div>
              <h3 className="font-bold text-gray-100 mt-4">Activity</h3>
              <div className="p-2 py-8 bg-white text-center rounded-lg px-6 sm:px-10 xl:text-left mt-4">
                {/* <p className="text-xl text-gray-300">
                  ...to add activity visualization...
                </p> */}

                <ActivityCalendar
                  showWeekdayLabels
                  data={contributor.calendarData}
                />
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-100 my-4">Bio</h3>
              <div className="bg-gray-800 w-full rounded-lg ">
                <div
                  className="prose prose-invert py-10 px-6 rounded-lg xl:px-10 xl:text-left leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: contributor.content,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-100 mt-6">Highlights</h3>
              <dl className="mt-4 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
                <div className="flex flex-col">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                    Pull Request
                  </dt>
                  <dd className="order-1 text-5xl font-extrabold text-white">
                    {contributor.highlights.pr_opened}
                  </dd>
                </div>
                <div className="flex flex-col mt-4 sm:mt-0">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                    Reviews
                  </dt>
                  <dd className="order-1 text-5xl font-extrabold text-white">
                    {contributor.highlights.pr_reviewed}
                  </dd>
                </div>
                <div className="flex flex-col mt-4 sm:mt-0">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                    Feed
                  </dt>
                  <dd className="order-1 text-5xl font-extrabold text-white">
                    {contributor.highlights.eod_update}
                  </dd>
                </div>
                {/* <div className="flex flex-col mt-4 sm:mt-0">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                    Points
                  </dt>
                  <dd className="order-1 text-5xl font-extrabold text-white">
                    {contributor.highlights.points}
                  </dd>
                </div> */}
              </dl>
            </div>

            {contributor["activityData"] &&
              contributor["activityData"]["open_prs"] &&
              contributor["activityData"]["open_prs"].length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-100 mt-6">
                    Currently Working on
                  </h3>
                  <div className="mt-4">
                    {contributor["activityData"]["open_prs"].map(
                      (pr, index) => (
                        <a href={pr.link} key={index}>
                          <p
                            className="text-sm text-gray-300 hover:text-primary-300"
                            key={index}
                          >
                            <span className="text-primary-500 text-sm pr-2">
                              ➞
                            </span>
                            {pr.title}
                          </p>
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}

            {contributor["activityData"] &&
              contributor["activityData"]["activity"] && (
                <div className="mt-6 overflow-x-hidden">
                  <h3 className="font-bold text-gray-100">Contributions</h3>
                  <GithubActivity activityData={contributor["activityData"]} />
                </div>
              )}
          </div>
        </div>
      </section>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const contributor = getContributorBySlug(params.slug, true);
  const content = await markdownToHtml(contributor.content || "");

  return {
    props: {
      contributor: {
        ...contributor,
        content,
      },
    },
  };
}
export async function getStaticPaths() {
  const paths = [];

  getContributors(true).map((contributor) => {
    paths.push({
      params: {
        slug: contributor.slug,
      },
    });
  });

  return {
    paths: paths,
    fallback: false,
  };
}
