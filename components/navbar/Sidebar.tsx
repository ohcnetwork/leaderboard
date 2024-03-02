import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 md:px-4 md:py-2">
      <Link href="/leaderboard">
        <p className="cursor-pointer p-1 text-sm md:p-2 md:text-base hover:underline hover:text-primary-500">
          Leaderboard
        </p>
      </Link>
      <Link href="/people">
        <p className="cursor-pointer p-1 text-sm md:p-2 md:text-base hover:underline hover:text-primary-500">
          Contributors
        </p>
      </Link>
      <Link href="/projects">
        <p className="cursor-pointer p-1 text-sm md:p-2 md:text-base hover:underline hover:text-primary-500">
          Projects
        </p>
      </Link>
      <Link href="/feed">
        <p className="cursor-pointer p-1 text-sm md:p-2 md:text-base hover:underline hover:text-primary-500">
          Feed
        </p>
      </Link>
      <Link href="/releases">
        <p className="cursor-pointer p-1 text-sm md:p-2 md:text-base hover:underline hover:text-primary-500">
          Releases
        </p>
      </Link>
    </div>
  );
};

export default Sidebar;
