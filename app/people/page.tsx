import HoverCardWrapper from "@/app/people/_components/HoverCardWrapper";
import { getContributors } from "@/lib/api";
import { Contributor } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { TbZoomQuestion } from "react-icons/tb";

export default async function Page() {
  const contributors = (await getContributors()).sort(
    (a, b) => b.highlights.points - a.highlights.points,
  );

  console.table(getContributorsGroupedByFirstActivityMonth(contributors));

  return (
    <div className="mx-auto mb-20 flex max-w-full flex-col items-center justify-center gap-8 px-24">
      {contributors.length ? (
        <>
          <h1 className="pt-10 text-center text-6xl leading-none drop-shadow-lg">
            <p>{contributors.length}</p>
            <p className="text-xl">contributors</p>
          </h1>
          <ul className="relative flex flex-wrap justify-center gap-1">
            {contributors.map((c) => (
              <li
                key={c.github}
                className="group transition-all duration-150 ease-in-out hover:scale-125 hover:shadow-xl hover:shadow-primary-500"
              >
                <HoverCardWrapper
                  key={c.github}
                  github={c.github}
                  name={c.name}
                  title={c.title}
                  content={
                    c.content && c.content.trim() !== "Still waiting for this"
                      ? c.content
                      : ""
                  }
                >
                  <Link href={`/contributors/${c.github}`}>
                    <Image
                      height={48}
                      width={48}
                      className="h-12 w-12 rounded-lg hover:ring hover:ring-primary-500"
                      src={`https://avatars.githubusercontent.com/${c.github}?s=128`}
                      alt={c.github}
                    />
                  </Link>
                </HoverCardWrapper>
              </li>
            ))}
          </ul>
          {/* <div className="whitespace-nowrap">
            <PeopleJoinOrgChart
              data={Object.entries(
                getContributorsGroupedByFirstActivityMonth(contributors),
              ).map(([group, contributors]) => {
                const [year, month] = group.split("-").map((a) => parseInt(a));
                return { year, month, newContributors: contributors.length };
              })}
            />
          </div> */}
        </>
      ) : (
        <div className="my-4 overflow-x-auto">
          <div className="flex flex-row justify-center">
            <TbZoomQuestion size={35} />{" "}
            <span className="ml-4 text-xl">No results found</span>
          </div>
        </div>
      )}
    </div>
  );
}

const getContributorsGroupedByFirstActivityMonth = (
  contributors: Contributor[],
) => {
  const result: Record<string, number> = {};
  for (const contributor of contributors) {
    if (!contributor.firstActivity) {
      continue;
    }
    const firstActivity = new Date(contributor.firstActivity);
    const group = `${firstActivity.getFullYear()}-${firstActivity.getMonth() + 1}`;
    result[group] ??= 0;
    result[group] += 1;
  }

  return Object.fromEntries(
    Object.entries(result).toSorted(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
    ),
  );
};
