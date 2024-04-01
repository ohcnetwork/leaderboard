import { env } from "@/env.mjs";
import ActiveProjects from "./ActiveProjects";
import { ACTIVE_PROJECT_LABELS } from "./constants";
import { notFound } from "next/navigation";

export const revalidate = 900; // revalidates atmost once every 15 mins

export default function Page() {
  if (!env.NEXT_PUBLIC_FEATURES?.split(",").includes("Projects"))
    return notFound();
  return (
    <div className="mx-auto max-w-4xl p-10">
      <h1 className="pb-10 text-4xl">Active Projects</h1>
      <ActiveProjects
        labels={ACTIVE_PROJECT_LABELS}
        className="flex flex-col gap-10"
      />
    </div>
  );
}
