import Image from "next/image";
import { env } from "@/env.mjs";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-center">
      <div className="border-t border-secondary-300 bg-secondary-300 p-4 dark:border-secondary-700 dark:bg-secondary-800 lg:p-10">
        <div className="max-w-5xl text-sm font-bold text-foreground dark:text-primary-500 lg:mx-auto lg:leading-tight">
          <div className="flex items-center justify-center gap-2">
            Powered by{" "}
            <Image
              src={env.NEXT_PUBLIC_ORG_LOGO as string}
              alt={env.NEXT_PUBLIC_ORG_NAME as string}
              width={80}
              height={22}
            />
            <Link
              className="text-primary hover:underline dark:text-primary-500"
              href="https://github.com/coronasafe/leaderboard/issues/new/choose"
            >
              Report an Issue
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
