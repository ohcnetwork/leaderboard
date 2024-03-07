import { Contributor } from "@/lib/types";
import clsx from "clsx";
import Image from "next/image";

export default function InfoCard({
  contributor,
}: {
  contributor: Contributor;
}) {
  return (
    <div
      className={clsx(
        "w-44 rounded-lg bg-secondary-300 dark:bg-secondary-800 xl:text-left ",
        "border-2 border-primary-700",
      )}
      role="listitem"
    >
      <div className="flex shrink-0 items-center  md:space-y-2 xl:space-y-1">
        <div
          className={`z-10 flex h-16 w-16 shrink-0 items-center rounded-full md:h-20 md:w-20 md:p-1`}
        >
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
            <h3
              className={clsx(
                "md:text-md overflow-hidden text-ellipsis text-sm leading-tight",
              )}
            >
              {contributor.name}
            </h3>
            <p className="text-xs text-secondary-600 dark:text-secondary-400 ">
              {contributor.title}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
