import { source } from "@/lib/source";
import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        enabled: false, // Disable Fumadocs nav since we have our own header
      }}
      githubUrl="https://github.com/ohcnetwork/leaderboard"
    >
      {children}
    </DocsLayout>
  );
}
