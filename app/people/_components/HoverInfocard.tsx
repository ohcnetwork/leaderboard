import Markdown from "@/components/Markdown";
import { Contributor } from "@/lib/types";

import Image from "next/image";

export default function HoverInfoCard({
  contributor,
}: {
  contributor: Contributor;
}) {
  return (
    <div
      className="max-h-64 w-44 overflow-hidden rounded-lg border-2 border-primary-700 bg-secondary-300 pb-2 dark:bg-secondary-800 xl:text-left"
      role="listitem"
    >
      <div className="flex shrink-0 items-center  space-y-2 xl:space-y-1">
        <div className="z-10 flex h-16 w-16 shrink-0 items-center rounded-full p-1 md:h-20 md:w-20">
          <Image
            className="rounded-full border-2 border-indigo-500"
            src={`https://avatars.githubusercontent.com/${contributor.github}`}
            alt={contributor.github}
            height={64}
            width={64}
          />
        </div>
        <div className={`overflow-hidden `}>
          <div className="fnt-medium space-y-1 overflow-hidden text-sm">
            <h3 className="md:text-md overflow-hidden text-ellipsis text-base leading-tight">
              {contributor.name}
            </h3>
            <p className="text-xs text-secondary-600 dark:text-secondary-400 ">
              {contributor.title}
            </p>
          </div>
        </div>
      </div>
      <p className="sm:p-x-4 max-h-64 p-2 text-secondary-700 dark:text-secondary-300 ">
        <Markdown className="text-xs md:text-sm">
          {contributor.content}
        </Markdown>
      </p>
    </div>
  );
}
