import { Metadata } from "next";
import { env } from "@/env.mjs";
import { notFound } from "next/navigation";
import { featureIsEnabled } from "@/lib/utils";
import FilterDiscussions from "../../components/discussions/FilterDiscussions";
import { categories } from "../../lib/discussion";
import DiscussionLeaderboard from "../../components/discussions/DiscussionLeaderboard";

export const metadata: Metadata = {
  title: `Disucssions | ${env.NEXT_PUBLIC_PAGE_TITLE}`,
};

export default function DiscussionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!featureIsEnabled("Discussions")) return notFound();

  return (
    <div className="mx-auto max-w-6xl p-5">
      <div className="items-center gap-5 pb-8 lg:mt-10 lg:flex">
        <h1 className="text-3xl sm:text-4xl">Disucssions</h1>
        <FilterDiscussions categories={categories} />
      </div>
      <div className="flex w-full flex-col-reverse gap-3 lg:flex lg:flex-row">
        {children}
        <DiscussionLeaderboard />
      </div>
    </div>
  );
}
