import ActiveProjects from "@/app/projects/ActiveProjects";

const page = async () => {
  const refUrl = `https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/encouraging-helpful-contributions-to-your-project-with-labels`;
  return (
    <div className="mx-auto max-w-5xl p-10">
      <h1 className="pb-10 text-4xl">Good First Issues</h1>
      <ActiveProjects
        labels={{
          "good first issue": {
            className: "text-green-500",
            name: "Good First Issue",
            ref: refUrl,
          },
        }}
        className="flex flex-col gap-10"
      />
    </div>
  );
};

export default page;
