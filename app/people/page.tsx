import { getContributors } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

export default async function Page() {
  const contributors = (await getContributors()).sort(
    (a, b) => b.highlights.points - a.highlights.points,
  );

  return (
    <div className="mx-auto mb-20 flex max-w-full flex-col items-center justify-center gap-8 px-24">
      <h1 className="text-center text-6xl leading-none drop-shadow-lg">
        <p>{contributors.length}</p>
        <p className="text-xl">contributors</p>
      </h1>
      <ul className="relative flex flex-wrap justify-center gap-1">
        {contributors.map((c) => (
          <li
            key={c.github}
            className="transition-all duration-150 ease-in-out hover:scale-125 hover:shadow-xl hover:shadow-primary-500"
          >
            <Link href={`/contributors/${c.github}`}>
              <Image
                height={48}
                width={48}
                className="h-12 w-12 rounded-lg hover:ring hover:ring-primary-500"
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
