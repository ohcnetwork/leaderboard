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
      <span className="relative flex w-full rounded-md shadow-sm">
        <span className="relative inline-flex items-center rounded-l-md border border-secondary-600 px-2 py-2 dark:border-secondary-300 ">
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
