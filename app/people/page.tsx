import { getContributors } from "@/lib/api";
import Link from "next/link";

export default async function Page() {
  const contributors = (await getContributors()).sort(
    (a, b) => b.highlights.points - a.highlights.points,
  );

  return (
    <ul className="flex flex-wrap gap-2 max-w-7xl mx-auto my-8 relative justify-center">
      {contributors.map((c) => (
        <li
          key={c.github}
          className="hover:scale-125 transition-all duration-150 ease-in-out hover:shadow-xl hover:shadow-primary-500"
        >
          <Link href={`/contributors/${c.github}`}>
            <img
              className="rounded-lg h-16 w-16 hover:ring hover:ring-primary-500"
              src={`https://avatars.githubusercontent.com/${c.github}`}
              alt={c.github}
              title={`${c.name} - @${c.github}`}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
