import { Contributor, PageProps } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import HoverInfocard from "./HoverInfocard";
import { TbZoomQuestion } from "react-icons/tb";
export default function ContributorPage({
  data,
  searchString,
}: {
  data: Contributor[];
  searchString: string | undefined;
}) {
  const searchTerm = searchString ?? "";
  const contributors = data.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.github.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  return (
    <>
      {contributors.length ? (
        <>
          <h1 className="text-center text-6xl leading-none drop-shadow-lg">
            <p>{contributors.length}</p>
            <p className="text-xl">contributors</p>
          </h1>
          <ul className="relative flex flex-wrap justify-center gap-1">
            {contributors.map((c) => (
              <li
                key={c.github}
                className="group transition-all duration-150 ease-in-out hover:scale-125 hover:shadow-xl hover:shadow-primary-500"
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
                <div className="absolute right-0 mt-1.5 translate-x-16 opacity-0 group-hover:opacity-100">
                  <HoverInfocard contributor={c} />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="my-4 overflow-x-auto">
          <div className="flex flex-row justify-center">
            <TbZoomQuestion size={35} />{" "}
            <span className="ml-4 text-xl">No results found</span>
          </div>
        </div>
      )}
    </>
  );
}
