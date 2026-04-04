import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        enabled: false, // Disable Fumadocs nav since we have our own header
      }}
      containerProps={{ className: "my-16" }}
      sidebar={{ className: "w-fit -my-16 pt-1 sticky h-[100vh]" }}
      githubUrl="https://github.com/ohcnetwork/leaderboard"
    >
      {children}
    </DocsLayout>
  );
}
