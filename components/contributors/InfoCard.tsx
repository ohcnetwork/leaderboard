import { Contributor } from "@/lib/types";
import clsx from "clsx";
import Link from "next/link";
import { BsSlack, BsTwitterX, BsLinkedin, BsGithub } from "react-icons/bs";
import { env } from "@/env.mjs";
import ContributorImage from "@/components/contributors/ContributorImage";

export default function InfoCard({
  contributor,
  rank = null,
  isClickable = false,
}: {
  contributor: Contributor;
  rank?: number | null;
  isClickable?: boolean;
  isFirstTimeContributor?: boolean;
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
              size="large"
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
            {contributor.isNewContributor ? (
              <p className="inline-block rounded-full text-sm text-primary-400 md:text-base">
                New Contributor 🎉
              </p>
            ) : (
              <p className="text-sm text-secondary-400 md:text-base">
                {contributor.title}
              </p>
            )}
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
                    <BsGithub className="size-6 md:size-7" />
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
                    <BsTwitterX className="size-6 md:size-7" />
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
                    <BsLinkedin className="size-6 md:size-7" />
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
