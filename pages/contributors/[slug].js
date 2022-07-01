import React from "react";
import markdownToHtml from "../../lib/markdownToHtml";
import Head from "next/head";

import InfoCard from "../../components/contributors/InfoCard";
import GithubActivity from "../../components/contributors/GithubActivity";
import BadgeIcons from "../../components/contributors/BadgeIcons";
import GraduateAttributeBadge from "../../components/contributors/GraduateAttributeBadge";
import {
  professionalSelfSkills,
  professionalTeamSkills,
  advancedSkills,
  humanValues,
  resolveGraduateAttributes,
} from "../../config/GraduateAttributes";

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
      {/* <Header /> */}
      <section className="max-w-6xl mx-auto bg-gray-900 border-t border-gray-600 p-4">
        <div className="hidden md:block bg-gray-900 p-4">
          <div className="grid grid-cols-2">
            <div className="pr-2 pb-2">
              <div>
                <div className="flex items-center justify-center p-3 bg-gray-700 rounded-t-lg">
                  <p className="text-white font-medium">
                    Professional Skills - Self
                  </p>
                </div>
                <div className="grid grid-cols-6 divide-x divide-gray-600 border border-gray-600 bg-gray-800">
                  <div className="p-2"></div>
                  <div className="p-2"></div>
                  <div className="p-2"></div>

                  {professionalSelfSkills.map((skill) => (
                    <div className="p-2" key={skill.key}>
                      <BadgeIcons
                        skill={resolveGraduateAttributes(skill, contributor)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pl-2 pb-2 border-l-4 border-indigo-700">
              <div>
                <div className="flex items-center justify-center p-3 bg-gray-700 rounded-t-lg">
                  <p className="text-white font-medium">
                    Professional Skills - Team
                  </p>
                </div>
                <div className="grid grid-cols-6 divide-x divide-gray-600 border border-gray-600 bg-gray-800">
                  {professionalTeamSkills.map((skill) => (
                    <div className="p-2" key={skill.key}>
                      <BadgeIcons
                        skill={resolveGraduateAttributes(skill, contributor)}
                      />
                    </div>
                  ))}
                  <div className="p-2"></div>
                  <div className="p-2"></div>
                  <div className="p-2"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="pr-2 pt-2 border-t-4 border-indigo-700">
              <div>
                <div className="grid grid-cols-6 divide-x divide-gray-600 border border-gray-600 bg-gray-800">
                  <div className="p-2"></div>
                  <div className="p-2"></div>
                  {advancedSkills.map((skill) => (
                    <div className="p-2" key={skill.key}>
                      <BadgeIcons
                        skill={resolveGraduateAttributes(skill, contributor)}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center p-3 bg-gray-700 rounded-b-lg">
                  <p className="text-white font-medium">Advanced Skills</p>
                </div>
              </div>
            </div>
            <div className="pt-2 pl-2 border-t-4 border-l-4 border-indigo-700">
              <div>
                <div className="grid grid-cols-6 divide-x divide-gray-600 border border-gray-600 bg-gray-800">
                  {humanValues.map((skill) => (
                    <div className="p-2" key={skill.key}>
                      <BadgeIcons
                        skill={resolveGraduateAttributes(skill, contributor)}
                      />
                    </div>
                  ))}
                  <div className="p-2"></div>
                  <div className="p-2"></div>
                </div>
                <div className="flex items-center justify-center p-3 bg-gray-700 rounded-b-lg">
                  <p className="text-white font-medium">Human Values</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div>
            <InfoCard contributor={contributor} />
          </div>
          <div className="flex md:hidden w-full overflow-x-auto">
            {professionalSelfSkills.map((skill) => (
              <div className="p-1 flex-shrink-0 w-14 h-14" key={skill.key}>
                <BadgeIcons
                  skill={resolveGraduateAttributes(skill, contributor)}
                />
              </div>
            ))}
            {professionalTeamSkills.map((skill) => (
              <div className="p-1 flex-shrink-0 w-14 h-14" key={skill.key}>
                <BadgeIcons
                  skill={resolveGraduateAttributes(skill, contributor)}
                />
              </div>
            ))}
            {advancedSkills.map((skill) => (
              <div className="p-1 flex-shrink-0 w-14 h-14" key={skill.key}>
                <BadgeIcons
                  skill={resolveGraduateAttributes(skill, contributor)}
                />
              </div>
            ))}
            {humanValues.map((skill) => (
              <div className="p-1 flex-shrink-0 w-14 h-14" key={skill.key}>
                <BadgeIcons
                  skill={resolveGraduateAttributes(skill, contributor)}
                />
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto space-y-16">
            <div>
              <h3 className="font-bold text-gray-100 mt-6">
                Graduate Attributes
              </h3>
              <div className="bg-gray-900 mt-3">
                <div className="flex space-x-6 md:space-x-0 overflow-x-auto w-full md:grid md:grid-cols-2">
                  <div className="md:pr-2 pb-2 bg-gray-800 flex flex-col md:justify-between flex-shrink-0 w-3/4 md:w-auto">
                    <div className="flex items-center md:justify-center p-3 bg-gray-700 rounded-t-lg">
                      <p className="text-white md:text-lg font-semibold">
                        Professional Skills - Self
                      </p>
                    </div>
                    <div className="flex flex-wrap md:flex-row-reverse py-2 pl-2 gap-2">
                      {professionalSelfSkills.map((skill) => (
                        <GraduateAttributeBadge
                          skill={resolveGraduateAttributes(skill, contributor)}
                          key={skill.key}
                          color={"bg-green-600"}
                          colorDark={"bg-green-700"}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="md:pl-2 pb-2 md:border-l-4 md:border-indigo-700 bg-gray-800 flex flex-col md:justify-between flex-shrink-0 w-3/4 md:w-auto">
                    <div className="flex items-center md:justify-center p-3 bg-gray-700 rounded-t-lg">
                      <p className="text-white md:text-lg font-semibold">
                        Professional Skills - Team
                      </p>
                    </div>
                    <div className="flex flex-wrap py-2 pl-2 md:pl-0 md:pr-2 gap-2">
                      {professionalTeamSkills.map((skill) => (
                        <GraduateAttributeBadge
                          skill={resolveGraduateAttributes(skill, contributor)}
                          key={skill.key}
                          color={"bg-indigo-500"}
                          colorDark={"bg-indigo-700"}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="md:pr-2 md:pt-2 md:border-t-4 md:border-indigo-700 bg-gray-800 flex flex-col-reverse md:flex-col justify-end md:justify-between flex-shrink-0 w-3/4 md:w-auto">
                    <div className="flex flex-wrap md:flex-row-reverse py-2 pl-2 pr-2 md:pr-0 gap-2 leading-tight">
                      {advancedSkills.map((skill) => (
                        <GraduateAttributeBadge
                          skill={resolveGraduateAttributes(skill, contributor)}
                          key={skill.key}
                          color={"bg-orange-500"}
                          colorDark={"bg-orange-700"}
                        />
                      ))}
                    </div>
                    <div className="flex items-center md:justify-center p-3 bg-gray-700 rounded-b-lg ">
                      <p className="text-white md:text-lg font-semibold">
                        Advanced Skills
                      </p>
                    </div>
                  </div>
                  <div className="md:pt-2 md:pl-2 md:border-t-4 md:border-l-4 md:border-indigo-700 bg-gray-800 flex flex-col-reverse md:flex-col justify-end md:justify-between flex-shrink-0 w-3/4 md:w-auto">
                    <div className="flex flex-wrap py-2 pl-2 md:pl-0 pr-2 gap-2">
                      {humanValues.map((skill) => (
                        <GraduateAttributeBadge
                          skill={resolveGraduateAttributes(skill, contributor)}
                          key={skill.key}
                          color={"bg-rose-500"}
                          colorDark={"bg-rose-700"}
                        />
                      ))}
                    </div>
                    <div className="flex items-center md:justify-center p-3 bg-gray-700 rounded-t-lg md:rounded-b-lg">
                      <p className="text-white md:text-lg font-semibold">
                        Human Values
                      </p>
                    </div>
                  </div>
                </div>
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
              <h3 className="font-bold text-gray-100 mt-4">
                Learning Activity
              </h3>
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
            <div className="hidden">
              {contributor.courses_completed && (
                <div>
                  <h3 className="font-bold text-gray-100 mt-4">Journey Map</h3>
                  <div className="p-2 py-8 bg-white text-center rounded-lg px-6 sm:px-10 xl:text-left mt-4">
                    {/* <ActivityCalendar
                  showWeekdayLabels
                  data={contributor.calendarData}
                /> */}
                    <div className="flex overflow-x-auto space-x-8 font-semibold">
                      {contributor.courses_completed.map((course) => (
                        <div
                          key={course}
                          className="p-2 rounded-lg w-32 h-32 bg-green-200 flex items-center text-center shadow"
                        >
                          {course}
                        </div>
                      ))}
                      <div className="p-2 rounded-lg w-32 h-32 bg-blue-200 flex items-center text-center shadow animate-pulse animate-bounce">
                        Industry Internship
                      </div>
                      <div className="p-2 rounded-lg w-32 h-32 bg-gray-200 flex items-center text-center shadow">
                        Industry Placement
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
