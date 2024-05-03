import { BsSearch } from "react-icons/bs";

const Search = ({
  value,
  handleOnChange,
  className = "",
  defaultValue = "",
  suggestions = [],
}: {
  handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  className?: string;
  defaultValue?: string;
  suggestions?: string[];
}) => {
  const showSuggestions = suggestions.length > 0;

  return (
    <div className={"relative rounded-md shadow-sm " + className}>
      <div className="pointer-events-none absolute top-3 flex items-center pl-3">
        <BsSearch className="text-foreground" />
      </div>
      <input
        type="text"
        name="search"
        id="search"
        autoComplete="off"
        onChange={handleOnChange}
        value={value}
        defaultValue={defaultValue}
        className="block w-full rounded-md border border-secondary-600 bg-transparent p-2 pl-10 text-sm text-foreground dark:border-secondary-300"
        placeholder="Start typing to search..."
      />
    </div>
  );
};

export default Search;
