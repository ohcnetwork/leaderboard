import { HiSortAscending, HiSortDescending } from "react-icons/hi";

const Sort = ({
  sortByOptions = [],
  sortBy,
  sortDescending = true,
  handleSortOrderChange,
  handleSortByChange,
  className = "",
}: {
  sortByOptions?: { value: string; text: string }[];
  sortBy?: string;
  sortDescending?: boolean;
  handleSortOrderChange: () => void;
  handleSortByChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}) => {
  return (
    <div className={className}>
      <span className="relative z-0 inline-flex w-full rounded-md shadow-sm">
        <span
          onClick={handleSortOrderChange}
          className="relative inline-flex cursor-pointer items-center rounded-l-md border border-gray-600 px-2 py-2 dark:border-gray-300"
        >
          {sortDescending ? (
            <HiSortAscending className="text-foreground" size={20} />
          ) : (
            <HiSortDescending className="text-foreground" size={20} />
          )}
        </span>
        <select
          id="message-type"
          name="message-type"
          className="-ml-px block w-full rounded-l-none rounded-r-md border border-gray-600 bg-transparent pl-2 text-sm font-medium text-foreground focus:z-10 focus:outline-none dark:border-gray-300"
          onChange={handleSortByChange}
          defaultValue={sortBy}
        >
          {sortByOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-gray-700"
            >
              {option.text}
            </option>
          ))}
        </select>
      </span>
    </div>
  );
};

export default Sort;
