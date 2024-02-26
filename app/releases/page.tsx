import Releases from "./Releases";

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl p-10">
      <h1 className="text-4xl pb-10">Recent Releases</h1>
      <Releases className="flex flex-col gap-10" />
    </div>
  );
}
