import Link from "next/link";
import ThemeSwitch from "./ThemeSwitch";
import { env } from "@/env.mjs";

export default function Header() {
  return (
    <header className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row lg:py-8 xl:px-0">
      <div className="flex items-center justify-between">
        <Link className="inline-block cursor-pointer" href="/">
          <h1 className="flex cursor-pointer flex-col items-end text-4xl text-primary-400">
            {env.NEXT_PUBLIC_ORG_NAME || "Open Source"}
            <span className="block text-xl font-bold tracking-normal text-gray-600 dark:text-gray-400">
              Contributors
            </span>
          </h1>
        </Link>
      </div>
      <ThemeSwitch />
    </header>
  );
}
