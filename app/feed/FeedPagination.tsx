import Link from "next/link";
import {
  MdLastPage,
  MdFirstPage,
  MdNavigateBefore,
  MdNavigateNext,
} from "react-icons/md";

type Props = {
  navLinks: Record<"first" | "prev" | "next" | "last", string | undefined>;
};

export default function FeedPagination({ navLinks }: Props) {
  return (
    <nav className="flex flex-row font-medium text-gray-600 dark:text-gray-400 rounded overflow-hidden border border-current divide-x divide-current">
      <Link
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800"
        href={navLinks?.first ?? "/feed"}
        title="First page"
      >
        <MdFirstPage size={24} />
      </Link>
      <Link
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800"
        href={navLinks?.prev ?? "/feed"}
        title="Previous page"
      >
        <MdNavigateBefore size={24} />
      </Link>
      <Link
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800"
        href={navLinks?.next ?? "/feed"}
        title="Next page"
      >
        <MdNavigateNext size={24} />
      </Link>
      <Link
        className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800"
        href={navLinks?.last ?? "/feed"}
        title="Last page"
      >
        <MdLastPage size={24} />
      </Link>
    </nav>
  );
}
