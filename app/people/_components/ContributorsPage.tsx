"use client";
import { useState } from "react";
import { Contributor, ContributorsPageProps } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import HoverInfoCard from "./HoverInfoCard";
export default function ContributorsPage({
  contributors,
  searchParams,
}: { contributors: Contributor[] } & ContributorsPageProps) {
  const searchTerm = searchParams.search ?? "";
  const filteredContributors = contributors.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.github.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  const [isHovered, setIsHoverd] = useState("");
  return (
    <>
      <h1 className="text-center text-6xl leading-none drop-shadow-lg">
        <p>{filteredContributors.length}</p>
        <p className="text-xl">
          {filteredContributors.length == 1 ? "contributor" : "contributors"}
        </p>
      </h1>
      <ul className="relative flex flex-wrap justify-center gap-1">
        {filteredContributors.map((c) => {
          return (
            <li
              key={c.github}
              className="transition-all duration-150 ease-in-out hover:scale-125 hover:shadow-xl hover:shadow-primary-500"
            >
              <Link href={`/contributors/${c.github}`}>
                <Image
                  onMouseEnter={() => {
                    setIsHoverd(c.github);
                  }}
                  onMouseLeave={() => setIsHoverd("")}
                  height={48}
                  width={48}
                  className="h-12 w-12 rounded-lg hover:ring hover:ring-primary-500"
                  src={`https://avatars.githubusercontent.com/${c.github}?s=128`}
                  alt={c.github}
                />
                {isHovered == c.github && (
                  <div className="absolute right-4 mt-1 translate-x-1/2 transform">
                    <HoverInfoCard contributor={c} />
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
