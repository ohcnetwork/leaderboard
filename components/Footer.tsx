import Image from "next/image";
import { env } from "@/env.mjs";

export default function Footer() {
  return (
    <footer className="border-t border-secondary-300 bg-secondary-300 p-4 dark:border-secondary-700 dark:bg-secondary-800 lg:p-8">
      <div className="mx-auto max-w-4xl text-center text-sm font-medium text-foreground dark:text-primary-500 lg:leading-snug">
        <div className="mb-4 flex items-center justify-center">
          Powered by{" "}
          <span className="ml-4 w-28 brightness-0 dark:brightness-150">
            <Image
              src={env.NEXT_PUBLIC_ORG_LOGO as string}
              alt={env.NEXT_PUBLIC_ORG_NAME as string}
              width={140}
              height={36}
            />
          </span>
        </div>
        <div className="mb-4">
          <a
            href={env.NEXT_PUBLIC_DATA_SOURCE}
            className="mb-1 block font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Data Repository
          </a>
          <a
            href={env.NEXT_PUBLIC_FLAT_REPO_EXPLORER_URL}
            className="block font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Flat Repository Explorer
          </a>
        </div>
        <div className="mb-4 flex justify-center">
          <a
            href={env.NEXT_PUBLIC_YOUTUBE_URL}
            className="mr-4 font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            YouTube
          </a>
          <a
            href={env.NEXT_PUBLIC_LINKEDIN_URL}
            className="mr-4 font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            LinkedIn
          </a>
          <a
            href={env.NEXT_PUBLIC_GITHUB_URL}
            className="font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            GitHub
          </a>
        </div>
        <div>
          <a
            href={`mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`}
            className="font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}
