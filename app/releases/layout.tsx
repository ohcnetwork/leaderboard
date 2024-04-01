import { Metadata } from "next";
import { env } from "@/env.mjs";
import { notFound } from "next/navigation";
import { featureIsEnabled } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Releases | ${env.NEXT_PUBLIC_PAGE_TITLE}`,
};

export default function ReleasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!featureIsEnabled("Releases")) return notFound();
  return (
    <div className="mx-auto max-w-4xl p-5 sm:p-10">
      <h1 className="pb-10 text-3xl sm:text-4xl">Recent Releases</h1>
      {children}
    </div>
  );
}
