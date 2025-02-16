import ActiveProjects from "@/app/projects/ActiveProjects";
import { ACTIVE_PROJECT_LABELS } from "@/app/projects/constants";
import { notFound } from "next/navigation";
import { featureIsEnabled } from "@/lib/utils";

export const revalidate = 900; // revalidates atmost once every 15 mins

export default function Page() {
  if (!featureIsEnabled("Projects")) return notFound();
  return (
    <div className="mx-auto max-w-4xl p-10">
      <h1 className="pb-10 text-4xl">Active Projects</h1>
      <ActiveProjects
        labels={ACTIVE_PROJECT_LABELS}
        className="flex flex-col gap-4"
      />
    </div>
  );
}
