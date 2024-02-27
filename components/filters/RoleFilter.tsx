"use state";

import { BsPersonFill } from "react-icons/bs";
import { Select, SelectOption } from "@/components/Select";

const RoleFilter = ({
  filterOptions = [],
  value,
  onChange,
  className = "",
}: {
  filterOptions?: SelectOption[];
  value: SelectOption[];
  onChange: (value: SelectOption[]) => void;
  className?: string;
}) => {
  return (
    <div className={className}>
      <span className="relative flex shadow-sm rounded-md w-full">
        <span className="inline-flex relative items-center border-gray-600 dark:border-gray-300 px-2 py-2 border rounded-l-md ">
          <BsPersonFill className="text-foreground" size={20} />
        </span>

        <Select
          multiple
          options={filterOptions}
          value={value}
          onChange={(value) => onChange(value as SelectOption[])}
          showSelectionsAs="text"
        />
      </span>
    </div>
  );
};

export default RoleFilter;
