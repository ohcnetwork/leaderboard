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
      <span className="inline-flex relative shadow-sm rounded-md w-full ">
        <span
          onClick={handleSortOrderChange}
          className="inline-flex relative items-center border-gray-600 dark:border-gray-300 px-2 py-2 border rounded-l-md cursor-pointer"
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
