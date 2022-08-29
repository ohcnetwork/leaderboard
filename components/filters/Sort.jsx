import { HiSortAscending, HiSortDescending } from "react-icons/hi";

const Sort = ({
  sortByOptions = [],
  sortBy = "",
  sortDescending = true,
  handleSortOrderChange,
  handleSortByChange,
  className = "",
}) => {
  return (
    <div className={className}>
      <span className="w-full relative z-0 inline-flex shadow-sm rounded-md">
        <span
          onClick={handleSortOrderChange}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 cursor-pointer"
        >
          {sortDescending ? (
            <HiSortAscending className="text-white" size={20} />
          ) : (
            <HiSortDescending className="text-white" size={20} />
          )}
        </span>
        <select
          id="message-type"
          name="message-type"
          className="-ml-px block w-full pl-2 rounded-l-none rounded-r-md border border-gray-300 text-sm font-medium focus:z-10 focus:outline-none bg-transparent text-white"
          onChange={handleSortByChange}
        >
          {sortByOptions.map((option) => (
            <option
              selected={option.value === sortBy}
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
