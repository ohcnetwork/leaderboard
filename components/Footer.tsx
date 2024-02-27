import Image from "next/image";
import { env } from "@/env.mjs";

export default function Footer() {
  return (
    <footer className="">
      <div className="bg-gray-800 p-4 lg:p-10 border-t dark:border-gray-700 border-gray-300 h-full">
        <div className="max-w-5xl font-bold text-white dark:text-primary-500 text-center text-sm lg:leading-tight lg:mx-auto">
          <div className="flex items-center justify-center w-full">
            Powered by{" "}
            <span className="w-20 ml-4">
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
