import Link from "next/link";
import { AiFillGithub } from "react-icons/ai";
import { env } from "@/env.mjs";

const ContributeButton = () => {
  return (
    <Link
      href={`https://github.com/${env.NEXT_PUBLIC_GITHUB_ORG}`}
      className="flex  items-center justify-center"
      rel="nonreferrer"
    >
      <div className="flex cursor-pointer  flex-row items-center justify-center gap-1">
        <p className="text-gradient hidden text-base font-bold md:block">
          Contribute Now
        </p>
        <AiFillGithub className="text-3xl" />
      </div>
    </Link>
  );
};

export default ContributeButton;
