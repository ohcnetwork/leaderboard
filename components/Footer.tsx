import Image from "next/image";
import { env } from "@/env.mjs";

export default function Footer() {
  return (
    <footer className="bg-gray-900 p-4 text-gray-100 dark:bg-gray-800 dark:text-gray-300">
      <div className="container mx-auto text-center">
        <div className="mb-4 flex flex-col items-center">
          <h2 className="mb-2 text-lg font-semibold">Connect with Us</h2>
          <div className="mb-2 flex items-center">
            <span className="mr-2 text-sm text-gray-300">Powered by</span>
            <a href={env.NEXT_PUBLIC_ORG_URL as string}>
              <Image
                src={env.NEXT_PUBLIC_ORG_LOGO as string}
                alt={env.NEXT_PUBLIC_ORG_NAME as string}
                width={100}
                height={24}
                className="ml-2"
              />
            </a>
          </div>
        </div>
        <div className="mb-4">
          <a
            href={env.NEXT_PUBLIC_DATA_SOURCE}
            className="mb-1 block text-base font-medium text-gray-300 hover:text-gray-200"
          >
            Data Repository
          </a>
          <a
            href={env.NEXT_PUBLIC_FLAT_REPO_EXPLORER_URL}
            className="block text-base font-medium text-gray-300 hover:text-gray-200"
          >
            Flat Repository Explorer
          </a>
        </div>
        <div className="mb-4">
          <h3 className="mb-1 text-base font-semibold">Socials</h3>
          <div className="flex justify-center space-x-2">
            <a
              href={env.NEXT_PUBLIC_YOUTUBE_URL}
              className="text-base text-gray-300 hover:text-gray-200"
            >
              YouTube
            </a>
            <a
              href={env.NEXT_PUBLIC_LINKEDIN_URL}
              className="text-base text-gray-300 hover:text-gray-200"
            >
              LinkedIn
            </a>
            <a
              href={env.NEXT_PUBLIC_GITHUB_URL}
              className="text-base text-gray-300 hover:text-gray-200"
            >
              GitHub
            </a>
          </div>
        </div>
        <div>
          <a
            href={`mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`}
            className="text-base font-medium text-gray-300 hover:text-gray-200"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}
