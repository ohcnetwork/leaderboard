import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 md:px-4 md:py-2">
      <Link href="/leaderboard">
        <p className="cursor-pointer p-1 text-sm hover:text-primary-500 hover:underline md:p-2 md:text-base">
          Leaderboard
        </p>
      </Link>
      <Link href="/people">
        <p className="cursor-pointer p-1 text-sm hover:text-primary-500 hover:underline md:p-2 md:text-base">
          Contributors
        </p>
      </Link>
      <Link href="/projects">
        <p className="cursor-pointer p-1 text-sm hover:text-primary-500 hover:underline md:p-2 md:text-base">
          Projects
        </p>
      </Link>
      <Link href="/feed">
        <p className="cursor-pointer p-1 text-sm hover:text-primary-500 hover:underline md:p-2 md:text-base">
          Feed
        </p>
      </Link>
      <Link href="/releases">
        <p className="cursor-pointer p-1 text-sm hover:text-primary-500 hover:underline md:p-2 md:text-base">
          Releases
        </p>
      </Link>
    </div>
  );
};

export default Sidebar;
