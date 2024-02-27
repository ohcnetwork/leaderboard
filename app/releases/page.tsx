import Releases from "./Releases";
import { Suspense } from "react";
import LoadingText from "@/components/LoadingText";

export default function Page() {
  return (
    <Suspense
      fallback={
        <>
          <LoadingText text="Fetching latest releases" />
        </>
      }
    >
      <Releases className="flex flex-col gap-10" />
    </Suspense>
  );
}
