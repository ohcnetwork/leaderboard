"use client";
import Search from "@/components/filters/Search";
import { useDebouncedCallback } from "use-debounce";
import { usePathname, useRouter } from "next/navigation";

export type SearchbarParams = {
  searchString: string | undefined;
  className?: string;
};

export default function TextSearchBar({
  searchString,
  className,
}: SearchbarParams) {
  const router = useRouter();
  const pathname = usePathname();

  const updateSearchParam = (key: string, value?: string) => {
    const current = new URLSearchParams(searchString);
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
    <Search
      defaultValue={searchString ?? ""}
      handleOnChange={(e) => handleSearch(e.target.value)}
      className={className}
    />
  );
}
