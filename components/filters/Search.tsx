import { BsSearch } from "react-icons/bs";

const Search = ({
  value = "",
  handleOnChange,
  className = "",
}: {
  value?: string;
  handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) => {
  return (
    <div className={"relative rounded-md shadow-sm " + className}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <BsSearch className="text-foreground" />
      </div>
      <input
        type="text"
        name="search"
        id="search"
        value={value}
        onChange={handleOnChange}
        className="block w-full pl-10 p-2 sm:text-sm rounded-md border border-gray-600 dark:border-gray-300 bg-transparent text-foreground"
        placeholder="Start typing to search..."
      />
    </div>
  );
};

export default Search;
