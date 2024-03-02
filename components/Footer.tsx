import Image from "next/image";
import { env } from "@/env.mjs";

export default function Footer() {
  return (
    <footer className="">
      <div className="h-full border-t border-gray-300 bg-secondary-800 p-4 dark:border-gray-700 lg:p-10">
        <div className="max-w-5xl text-center text-sm font-bold text-white dark:text-primary-500 lg:mx-auto lg:leading-tight">
          <div className="flex w-full items-center justify-center">
            Powered by{" "}
            <span className="ml-4 w-20">
              <Image
                src={env.NEXT_PUBLIC_ORG_LOGO as string}
                alt={env.NEXT_PUBLIC_ORG_NAME as string}
                width="80"
                height="22"
              />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
