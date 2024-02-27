import Releases from "./Releases";
import { Suspense } from "react";
import LoadingText from "@/components/LoadingText";

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl p-10">
      <h1 className="text-4xl pb-10">Recent Releases</h1>
      <Suspense
        fallback={
          <>
            <LoadingText text="Fetching latest releases" />
          </>
        }
      >
        <Releases className="flex flex-col gap-10" />
      </Suspense>
    </div>
  );
}
