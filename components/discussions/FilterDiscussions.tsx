"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DateRangePicker from "@/components/DateRangePicker";
import { parseDateRangeSearchParam } from "@/lib/utils";
import { format } from "date-fns";

interface Props {
  categories: {
    name: string;
    emoji: string;
  }[];
}

const FilterDiscussions = ({ categories }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentCategory = searchParams.get("category") || "";
  const [start, end] = parseDateRangeSearchParam(searchParams.get("between"));

  const updateSearchParam = (key: string, value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    if (!value) {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  };

  return (
    <div className="mt-2 min-w-max gap-5 space-y-2 rounded-md text-secondary-700 lg:flex lg:space-y-0">
      <div className="flex w-full rounded-md shadow-sm">
        <select
          value={currentCategory}
          onChange={(e) => updateSearchParam("category", e.target.value)}
          className="flex w-full items-center rounded-md border border-secondary-600 bg-background px-4 py-2 text-sm font-medium text-foreground outline-none hover:cursor-pointer dark:border-secondary-300 lg:min-w-[200px]"
        >
          <option value="">All discussions</option>
          {categories.map((category, index) => (
            <option key={index} value={category.name}>
              {category.emoji} {category.name}
            </option>
          ))}
        </select>
      </div>
      <DateRangePicker
        className="my-auto flex"
        value={{ start, end }}
        onChange={(value) => {
          updateSearchParam(
            "between",
            `${format(value.start, "yyyy-MM-dd")}...${format(
              value.end,
              "yyyy-MM-dd",
            )}`,
          );
        }}
      />
    </div>
  );
};

export default FilterDiscussions;
