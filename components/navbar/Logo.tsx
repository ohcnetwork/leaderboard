import Link from "next/link";
import { env } from "@/env.mjs";

const Logo = () => {
  return (
    <Link href="/">
      <div className="flex flex-col  items-end justify-end">
        <p className="text-xl font-bold text-primary-500 dark:text-primary-300 md:text-4xl">
          {env.NEXT_PUBLIC_ORG_NAME || "Open Source"}
        </p>
        <p className="text-sm md:text-base">Contributions</p>
      </div>
    </Link>
  );
};

export default Logo;
