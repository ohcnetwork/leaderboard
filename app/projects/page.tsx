import ActiveProjects from "./ActiveProjects";
import { ACTIVE_PROJECT_LABELS } from "./constants";

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl p-10">
      <h1 className="text-4xl pb-10">Active Projects</h1>
      <ActiveProjects
        labels={ACTIVE_PROJECT_LABELS}
        className="flex flex-col gap-10"
      />
    </div>
  );
}
