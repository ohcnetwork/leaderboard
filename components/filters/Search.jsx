import { BsSearch } from "react-icons/bs";

const Search = ({ value = "", handleOnChange, className = "" }) => {
  return (
    <div className={"relative rounded-md shadow-sm " + className}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <BsSearch className="text-white" />
      </div>
      <input
        type="text"
        name="search"
        id="search"
        value={value}
        onChange={handleOnChange}
        className="block w-full pl-10 p-2 sm:text-sm rounded-md border border-gray-300 bg-transparent text-white placeholder:text-gray-50"
        placeholder="Start typing to search..."
      />
    </div>
  );
};

export default Search;
