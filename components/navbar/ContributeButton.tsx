import Link from "next/link";
import { AiFillGithub } from "react-icons/ai";
import { env } from "@/env.mjs";

const ContributeButton = () => {
  return (
    <Link
      href={`https://github.com/${env.NEXT_PUBLIC_GITHUB_ORG}`}
      className="flex items-center justify-center"
      rel="nonreferrer"
    >
      <div className="flex cursor-pointer flex-row items-center justify-center gap-1 transition-transform duration-200 hover:scale-110">
        <AiFillGithub className="text-3xl transition-colors duration-200 hover:text-gray-500" />
      </div>
    </Link>
  );
};

export default ContributeButton;
