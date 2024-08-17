import Link from "next/link";
import { env } from "@/env.mjs";

const Logo = () => {
  return (
    <Link href="/">
      <div className="flex flex-col  items-end justify-end">
        <p className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 hover:text-primary-500 transition-colors duration-200">
          {env.NEXT_PUBLIC_ORG_NAME || "Open Source"}
        </p>
        <p className="text-sm md:text-base">Contributions</p>
      </div>
    </Link>
  );
};

export default Logo;
