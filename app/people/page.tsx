import { getContributors } from "@/lib/api";
import Link from "next/link";

export default async function Page() {
  const contributors = (await getContributors()).sort(
    (a, b) => b.highlights.points - a.highlights.points,
  );

  return (
    <div className="flex flex-col gap-8 max-w-full px-24 mx-auto justify-center items-center mb-20">
      <h1 className="text-6xl text-center leading-none drop-shadow-lg">
        <p>{contributors.length}</p>
        <p className="text-xl">contributors</p>
      </h1>
      <ul className="flex flex-wrap gap-1 relative justify-center">
        {contributors.map((c) => (
          <li
            key={c.github}
            className="hover:scale-125 transition-all duration-150 ease-in-out hover:shadow-xl hover:shadow-primary-500"
          >
            <Link href={`/contributors/${c.github}`}>
              <img
                className="rounded-lg h-12 w-12 hover:ring hover:ring-primary-500"
                src={`https://avatars.githubusercontent.com/${c.github}?s=128`}
                alt={c.github}
                title={`${c.name} - @${c.github}`}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
