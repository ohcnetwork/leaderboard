import { Metadata } from "next";
import { env } from "@/env.mjs";

export const metadata: Metadata = {
  title: `Leaderboard | ${env.NEXT_PUBLIC_PAGE_TITLE}`,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="border-t border-secondary-300 bg-background text-foreground dark:border-secondary-700">
      <div className="mx-auto max-w-7xl">
        <div className="mx-4 border-secondary-600 xl:mx-0">{children}</div>
      </div>
    </section>
  );
}
