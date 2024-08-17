import Link from "next/link";
import { AiFillGithub } from "react-icons/ai";
import { env } from "@/env.mjs";

const ContributeButton = () => {
  return (
    <Link
      href={`https://github.com/${env.NEXT_PUBLIC_GITHUB_ORG}`}
      className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 transition-colors duration-200 hover:text-primary-500"
      rel="noopener noreferrer"
    >
      <div className="flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full shadow-md transition-all duration-300 ease-in-out hover:bg-primary-500 hover:text-white hover:shadow-lg">
        <AiFillGithub className="text-3xl" />
      </div>
      <span className="hidden md:inline">Contribute</span>
    </Link>
  );
};

export default ContributeButton;
