import Link from "next/link";
import LeaderboardCard from "../contributors/LeaderboardCard";

export default function MainLeaderboard({ description, contributors, link }) {
  return (
    <div className="lg:col-span-7 2xl:col-span-8">
      <div className="sticky top-0 pt-24">
        <div className="terminal-container-bg border text-white rounded-lg border-primary-500">
          <div className="flex space-x-2 px-6 py-3 border-b border-primary-500 ">
            <span>{description}</span>
            <div className="flex-1"></div>
            <Link href={link.href}>
              <span className="cursor-pointer text-primary-500 hover:bg-primary-500 hover:text-gray-900 mr-1">
                {link.description}
              </span>
            </Link>
          </div>
          <ul className="space-y-6 lg:space-y-8 p-2 lg:p-2 overflow-x-auto">
            {contributors
              .filter((contributor) => contributor.intern)
              .map((contributor, index) => {
                return (
                  <li key={contributor.github}>
                    <LeaderboardCard
                      position={index}
                      key={contributor.github}
                      contributor={contributor}
                    />
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
}
