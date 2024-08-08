/*  */
import { Contributor } from "@/lib/types";
import clsx from "clsx";
import Link from "next/link";
import { BsSlack } from "react-icons/bs";
import { env } from "@/env.mjs";
import ContributorImage from "./ContributorImage";

export default async function InfoCard({
  contributor,
  rank = null,
  isClickable = false,
}: {
  contributor: Contributor;
  rank?: number | null;
  isClickable?: boolean;
}) {
  return (
    <div
      className={clsx(
        "xl:text-left",
        isClickable &&
          "rounded-lg border-2 border-transparent p-4 transition-all duration-300 ease-in-out hover:scale-105 hover:border-primary-400 hover:shadow-lg",
      )}
      role="listitem"
    >
      <div className=" flex shrink-0 items-center space-x-2 md:space-y-6 xl:space-y-1 ">
        <div className="mr-2 flex">
          {!!rank && (
            <div className="mr-5 hidden h-20 items-center self-center text-5xl font-bold tracking-wider text-secondary-500 dark:text-secondary-400 md:flex lg:flex lg:text-6xl">
              #{rank}
            </div>
          )}
          <Link
            href={isClickable ? `/contributors/${contributor.github}` : `#`}
            className=""
          >
            <ContributorImage
              contributorGithub={contributor.github}
              rank={rank}
              height={112}
              width={112}
            />
          </Link>
        </div>
        <div className="overflow-hidden">
          <div className="fnt-medium space-y-1 overflow-hidden text-lg">
            <Link
              href={isClickable ? `/contributors/${contributor.github}` : `#`}
              className="flex gap-2"
            >
              <h3
                className={clsx(
                  "overflow-hidden text-ellipsis text-lg leading-tight md:text-2xl",
                  isClickable && "cursor-pointer hover:text-primary-200",
                )}
              >
                {contributor.name}
              </h3>
              <span className="flex text-lg font-bold leading-tight tracking-wider text-secondary-500 dark:text-secondary-400 md:hidden lg:hidden">
                #{rank}
              </span>
            </Link>
            <p className="text-sm text-secondary-400 md:text-base">
              {contributor.title}
            </p>
          </div>

          <ul role="list" className="mt-4 flex items-center space-x-4">
            {contributor.github && (
              <li role="listitem">
                <Link
                  href={`https://github.com/${contributor.github}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="flex items-center text-secondary-500 hover:text-primary-300">
                    <span className="sr-only">Github</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-6 w-6 md:h-8 md:w-8"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.606 9.606 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48C19.137 20.107 22 16.373 22 11.969 22 6.463 17.522 2 12 2z"
                      ></path>
                    </svg>
                  </span>
                </Link>
              </li>
            )}
            {contributor.twitter && (
              <li role="listitem">
                <Link
                  href={`https://twitter.com/${contributor.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="flex items-center text-secondary-500 hover:text-primary-300">
                    <span className="sr-only">Twitter</span>
                    <svg
                      className="h-6 w-6 md:h-7 md:w-7"
                      fill="currentColor"
                      viewBox="0 0 1200 1227"
                      aria-hidden="true"
                    >
                      
                      <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
                    </svg>
                  </div>
                </Link>
              </li>
            )}
            {contributor.linkedin && (
              <li role="listitem">
                <Link
                  href={`https://linkedin.com/in/${contributor.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="flex items-center text-secondary-500 hover:text-primary-300">
                    <span className="sr-only">LinkedIn</span>
                    <svg
                      className="h-6 w-6 md:h-7 md:w-7"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </Link>
              </li>
            )}
            {contributor.slack && env.NEXT_PUBLIC_SLACK_URL && (
              <li role="listitem">
                <Link
                  href={`${env.NEXT_PUBLIC_SLACK_URL}/team/${contributor.slack}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="flex items-center text-secondary-500 hover:text-primary-300">
                    <span className="sr-only">Slack</span>
                    <BsSlack className="h-6 w-6 p-1 md:h-7 md:w-7" />
                  </div>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
