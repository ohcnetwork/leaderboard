import {
  advancedSkills,
  humanValues,
  professionalSelfSkills,
  professionalTeamSkills,
  resolveGraduateAttributes,
} from "../../../config/GraduateAttributes";
import { getContributorBySlug } from "../../../lib/api";
import ActivityCalendarGit from "../../../components/contributors/ActivityCalendarGitHub";
import BadgeIcons from "../../../components/contributors/BadgeIcons";
import GithubActivity from "../../../components/contributors/GithubActivity";
import GraduateAttributeBadge from "../../../components/contributors/GraduateAttributeBadge";
import InfoCard from "../../../components/contributors/InfoCard";
import React from "react";
import markdownToHtml from "../../../lib/markdownToHtml";
import clsx from "clsx";
import Tooltip from "../../../components/filters/Tooltip";
import { Contributor } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

type Params = {
  params: {
    slug: string;
  };
};

export default async function Contributor({ params: { slug } }: Params) {
  const contributor = getContributorBySlug(slug, true) as Contributor;
  const content = await markdownToHtml(contributor.content || "");
  return (
    <div className="bg-background min-h-screen">
      {/* <Header /> */}
      <div className="pt-2 pb-3 border-b dark:border-gray-700 border-gray-300 shadow-md dark:bg-gray-700 bg-gray-200 bg-opacity-50">
        <h1 className="max-w-6xl mx-auto text-sm md:text-xl dark:text-gray-400 text-gray-600 text-center">
          Personal Learning Dashboard (Beta)
        </h1>
      </div>
      <section className="px-4 py-8 dark:bg-gray-800 bg-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row ">
          <div className="md:w-2/3">
            <InfoCard contributor={contributor} />
          </div>
          <div className="flex md:grid md:grid-cols-7 mt-6 md:mt-0 w-full overflow-x-auto md:overflow-x-visible gap-2">
            {[
              professionalSelfSkills,
              professionalTeamSkills,
              advancedSkills,
              humanValues,
            ].map((attributeGroup) => {
              return attributeGroup.map((skill) => (
                <div
                  className="flex items-center justify-center flex-shrink-0  bg-opacity-40 rounded-lg"
                  key={skill.key}
                >
                  <BadgeIcons
                    skill={resolveGraduateAttributes(skill, contributor)}
                  />
                </div>
              ));
            })}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto space-y-16">
        <div className="pl-4 md:p-0">
          <div className="flex items-end justify-between">
            <h3 className="font-bold text-foreground mt-14">
              Graduate Attributes
            </h3>
            <a
              href="#"
              className="inline-flex items-center underline text-gray-400 space-x-2 hover:text-primary-400 transition mt-1 pl-1 pt-2"
            >
              <span>Learn More</span>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="w-5 h-5"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z" />
                </svg>
              </span>
            </a>
          </div>
          <div className="mt-3">
            <div className="flex space-x-6 md:space-x-0 overflow-x-auto w-full md:grid md:grid-cols-2">
              <div className="md:pr-2 pb-2 rounded-tl-lg dark:bg-gray-800 bg-gray-200 flex flex-col md:justify-between flex-shrink-0 w-3/4 md:w-auto">
                <div className="flex items-center md:justify-center p-3 dark:bg-gray-700 bg-gray-300 rounded-t-lg">
                  <p className="text-foreground md:text-lg font-semibold">
                    Individual Skills
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
              <div className="md:pl-2 pb-2 md:border-l-4 md:border-indigo-700 rounded-tr-lg dark:bg-gray-800 bg-gray-200 flex flex-col md:justify-between flex-shrink-0 w-3/4 md:w-auto">
                <div className="flex items-center md:justify-center p-3 dark:bg-gray-700 bg-gray-300 rounded-t-lg">
                  <p className="text-foreground md:text-lg font-semibold">
                    Team Skills
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
              <div className="md:pr-2 md:pt-2 md:border-t-4 md:border-indigo-700 rounded-bl-lg dark:bg-gray-800 bg-gray-200 flex flex-col-reverse md:flex-col justify-end md:justify-between flex-shrink-0 w-3/4 md:w-auto">
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
                <div className="flex items-center md:justify-center p-3 dark:bg-gray-700 bg-gray-300 rounded-b-lg ">
                  <p className="text-foreground md:text-lg font-semibold">
                    Advanced Skills
                  </p>
                </div>
              </div>
              <div className="md:pt-2 md:pl-2 md:border-t-4 md:border-l-4 md:border-indigo-700 rounded-br-lg dark:bg-gray-800 bg-gray-200 flex flex-col-reverse md:flex-col justify-end md:justify-between flex-shrink-0 w-3/4 md:w-auto">
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
                <div className="flex items-center md:justify-center p-3 dark:bg-gray-700 bg-gray-300 md:rounded-b-lg">
                  <p className="text-foreground md:text-lg font-semibold">
                    Cultural Skills
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:p-0">
          {contributor.courses_completed && (
            <div>
              <h3 className="font-bold text-foreground mt-4">Journey Map</h3>
              <div className="bg-[url('/images/map-bg-light.svg')] dark:bg-[url('/images/map-bg.svg')] bg-no-repeat bg-cover relative dark:bg-gray-800 text-center rounded-lg px-4 py-8 sm:px-8 xl:text-left mt-4">
                <div className="flex flex-col md:flex-row overflow-x-auto md:space-y-0 md:space-x-3 font-semibold">
                  {contributor.courses_completed.map((course) => (
                    <div
                      key={course}
                      className="relative flex flex-col items-center justify-center"
                    >
                      <div className="journey-map__milestone relative z-10 p-2 w-24 h-24 dark:bg-gray-600 bg-gray-300 rounded-full flex items-center text-center shadow-xl"></div>
                      <p className="text-sm text-center text-foreground mt-2 z-10 py-0.5">
                        {course}
                      </p>
                      <div className="absolute top-12 z-20">
                        <img
                          className="mx-auto h-9 w-9"
                          src="/images/map-check.png"
                        ></img>
                      </div>
                    </div>
                  ))}

                  <div className="relative  flex flex-col items-center juustify-center">
                    <div className="relative journey-map__milestone z-10 p-2 w-24 h-24 dark:bg-gray-600 bg-gray-300 rounded-full flex items-center text-center shadow-xl"></div>
                    <p className="text-sm text-center text-foreground mt-2 z-10 py-0.5">
                      Teaching Assistant &amp; Internship
                    </p>
                    <div className="absolute top-8 md:top-5 animate-bounce z-20 flex items-center justify-center">
                      <img
                        className="mx-auto w-14 md:w-16"
                        src="/images/map-pointer.png"
                      ></img>
                      <img
                        className="absolute top-1.5 mx-auto h-7 md:h-8 w-7 md:w-8 rounded-full border border-primary-200"
                        src={`https://avatars.githubusercontent.com/${contributor.github}?size=200`}
                        alt={contributor.github}
                      />
                    </div>
                  </div>
                  <div className="relative flex flex-col items-center juustify-center">
                    <div className="relative journey-map__milestone z-10 p-2 w-24 h-24 dark:bg-gray-600 bg-gray-300 rounded-full flex items-center text-center shadow-xl"></div>
                    <p className="text-sm text-center text-foreground mt-2 z-10 py-0.5">
                      Industry Placement
                    </p>
                  </div>
                  <div className="relative flex flex-col items-center juustify-center">
                    <div className="relative journey-map__milestone z-10 p-2 w-24 h-24 dark:bg-gray-600 bg-gray-300 rounded-full flex items-center text-center shadow-xl"></div>
                    <p className="text-sm text-center text-foreground mt-2 z-10 py-0.5">
                      Alumni &amp; Teaching Fellow
                    </p>
                  </div>
                </div>
                <div className="w-2.5 md:w-auto md:h-2.5 absolute dark:bg-gray-900 bg-gray-400 top-24 bottom-20 left-1/2 transform -translate-x-1/2 md:-translate-x-0 md:left-20 md:right-20 z-1 md:bottom-24 mt-5"></div>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 md:p-0">
          <h3 className="font-bold text-foreground my-4">Short Bio</h3>
          <div className="dark:bg-gray-800 bg-gray-100 w-full rounded-lg ">
            <div
              className="prose dark:prose-invert py-10 px-6 rounded-lg xl:px-10 xl:text-left leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: contributor.content,
              }}
            ></div>
          </div>
        </div>

        <div className="px-4 md:p-0">
          <h3 className="font-bold text-foreground my-4">Learning Activity</h3>
          <ActivityCalendarGit calendarData={contributor.calendarData} />
        </div>
        <div className="px-4 md:p-0">
          <h3 className="font-bold text-foreground mt-6">Highlights</h3>
          <dl className="mt-4 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-300">
                Pull Request
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-foreground">
                {contributor.highlights.pr_opened}
              </dd>
            </div>
            <div className="flex flex-col mt-4 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-300">
                Reviews
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-foreground">
                {contributor.highlights.pr_reviewed}
              </dd>
            </div>
            <div className="flex flex-col mt-4 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-300">
                Feed
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-foreground">
                {contributor.highlights.eod_update}
              </dd>
            </div>
            <div className="col-span-3 flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-300">
                Avg. PR Turnaround Time
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-foreground truncate whitespace-nowrap">
                {formatDuration(
                  (contributor.activityData?.activity
                    .map((act) => act.turnaround_time)
                    .filter(Boolean)
                    .reduce(
                      (acc, curr, i, array) => acc! + curr! / array.length,
                      0
                    ) || 0) * 1000
                )}
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
            <div className="px-4 md:p-0">
              <h3 className="font-bold text-foreground mt-6">
                Currently Working on
              </h3>
              <div className="mt-4">
                {contributor["activityData"]["open_prs"].map((pr, index) => (
                  <a href={pr.link} key={index} className="flex gap-2">
                    <p
                      className={clsx(
                        "text-sm mb-2 transition-colors duration-75 ease-in-out flex gap-2",
                        pr?.stale_for >= 7
                          ? "dark:text-gray-600 text-gray-700 dark:hover:text-primary-200 hover:text-primary-400"
                          : "dark:text-gray-300 text-gray-400 dark:hover:text-primary-300 hover:text-primary-500"
                      )}
                      key={index}
                    >
                      <Tooltip
                        tip={
                          ((pr?.stale_for >= 7) as Boolean) &&
                          `Stale for ${pr?.stale_for} days`
                        }
                        tipStyle="absolute w-48 -top-8 translate-x-1/2 text-white text-sm flex flex-row gap-4"
                      >
                        <span className="flex items-center">
                          <span className="text-primary-500 text-sm pr-2">
                            ➞
                          </span>
                          <code
                            className={clsx(
                              "text-xs tracking-wide px-1.5 py-1 rounded mr-2",
                              pr.stale_for >= 7
                                ? "dark:bg-gray-800 bg-gray-200 dark:text-gray-600 text-gray-700"
                                : "dark:bg-gray-600 bg-gray-100 dark:text-white text-gray-400"
                            )}
                          >
                            {pr.link
                              .split("/")
                              .slice(-3)
                              .join("/")
                              .replace("/pull", "")}
                          </code>
                          {pr.title}
                        </span>
                      </Tooltip>
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

        {contributor["activityData"] &&
          contributor["activityData"]["activity"] && (
            <div className="mt-6 overflow-x-hidden px-4 md:p-0">
              <h3 className="font-bold text-foreground">Contributions</h3>
              <GithubActivity activityData={contributor["activityData"]} />
            </div>
          )}
      </div>
    </div>
  );
}
