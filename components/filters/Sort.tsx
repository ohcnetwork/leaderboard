import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import { Select, SelectOption } from "@/components/Select";

const Sort = ({
  sortByOptions = [],
  value,
  sortDescending = true,
  handleSortOrderChange,
  onChange,
  className = "",
}: {
  sortByOptions?: SelectOption[];
  value?: SelectOption;
  sortDescending?: boolean;
  handleSortOrderChange: () => void;
  onChange: (value: SelectOption | undefined) => void;
  className?: string;
}) => {
  return (
    <div className={className}>
      <span className="relative inline-flex w-full rounded-md shadow-sm ">
        <span
          onClick={handleSortOrderChange}
          className="relative inline-flex cursor-pointer items-center rounded-l-md border border-secondary-600 px-2 py-2 dark:border-secondary-300"
        >
          {sortDescending ? (
            <HiSortAscending className="text-foreground" size={20} />
          ) : (
            <HiSortDescending className="text-foreground" size={20} />
          )}
        </span>
        <Select
          options={sortByOptions}
          value={value}
          onChange={(value) => onChange(value as SelectOption)}
        />
      </span>
    </div>
  );
};

export default Sort;
