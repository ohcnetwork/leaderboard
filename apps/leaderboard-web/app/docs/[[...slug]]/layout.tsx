import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="lb-docs-page">
      <DocsLayout
        tree={source.pageTree}
        nav={{
          enabled: false, // Disable Fumadocs nav since we have our own header
        }}
        githubUrl="https://github.com/ohcnetwork/leaderboard"
      >
        {children}
      </DocsLayout>
    </div>
  );
}
