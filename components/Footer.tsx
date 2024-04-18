import Image from "next/image";
import { env } from "@/env.mjs";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="">
      <div className="h-full border-t border-secondary-300 bg-secondary-800 p-4 dark:border-secondary-700 lg:p-10">
        <div className="max-w-7xl text-center text-sm font-bold text-white dark:text-primary-500 lg:mx-auto lg:leading-tight">
          <div className="flex w-full items-center justify-center">
            Powered by{" "}
            <span className="ml-4 flex">
              <Image
                src={env.NEXT_PUBLIC_ORG_LOGO as string}
                alt={env.NEXT_PUBLIC_ORG_NAME as string}
                width="80"
                height="30"
              />
              <Link
                className="w-full self-center text-white hover:underline dark:text-primary-500"
                href="https://github.com/coronasafe/leaderboard/issues/new/choose"
              >
                File an issue
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
