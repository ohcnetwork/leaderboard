import ActiveProjects from "./ActiveProjects";
import { ACTIVE_PROJECT_LABELS } from "./constants";

export const revalidate = 900; // revalidates atmost once every 15 mins

export default function Page() {
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
