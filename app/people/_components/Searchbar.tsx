"use client";
import { usePathname, useRouter } from "next/navigation";
import Search from "@/components/filters/Search";
import { LeaderboardPageProps } from "@/lib/types";
import { useDebouncedCallback } from "use-debounce";

export default function Searchbar({ searchParams }: LeaderboardPageProps) {
  const router = useRouter();
  const pathname = usePathname();

  const updateSearchParam = (key: string, value?: string) => {
    const current = new URLSearchParams(searchParams as Record<string, string>);
    if (!value) {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  };

  const handleSearch = useDebouncedCallback((value: string) => {
    if (value) {
      updateSearchParam("search", value);
    } else {
      updateSearchParam("search");
    }
  }, 300);

  return (
    <div className="mx-4 mt-4 w-full rounded-lg border border-primary-500 p-4 md:mx-0">
      <div className="flex flex-col flex-wrap gap-4 md:flex-row">
        <Search
          defaultValue={searchParams.search}
          handleOnChange={(e) => handleSearch(e.target.value)}
          className="grow"
        />
      </div>
    </div>
  );
}
