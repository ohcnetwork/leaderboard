"use state";

import { useRef, useState } from "react";
import { RxCrossCircled } from "react-icons/rx";
import { RxCross2 } from "react-icons/rx";
import { RiArrowDropDownLine } from "react-icons/ri";

export type SelectOption = {
  value: string;
  text: string;
};

type SelectProps = {
  options: SelectOption[];
  showSelectionsAs?: "tags" | "text" | undefined;
} & (
  | {
      multiple: true;
      value?: SelectOption[];
      onChange: (value: SelectOption[] | SelectOption) => void;
    }
  | {
      multiple?: false;
      value?: SelectOption;
      onChange: (value: SelectOption[] | SelectOption) => void;
    }
);

export function Select({
  multiple = false,
  value = multiple ? [] : undefined,
  onChange,
  options,
  showSelectionsAs = "tags",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function selectOption(option: SelectOption) {
    if (multiple && Array.isArray(value)) {
      const updatedValue = value?.some((a) => a.value === option.value)
        ? value?.filter((o) => o.value !== option.value)
        : [...value, option];
      onChange(updatedValue);
      setIsOpen(false);
    } else {
      onChange(option);
    }
  }

  function isOptionSelected(option: SelectOption) {
    return multiple
      ? Array.isArray(value) && value?.some((a) => a.value === option.value)
      : option.value === (value as SelectOption)?.value;
  }

  return (
    <div
      ref={containerRef}
      onBlur={() => setIsOpen(false)}
      onClick={() => setIsOpen((prev) => !prev)}
      tabIndex={0}
      className="relative flex items-center border-gray-600 dark:border-gray-300 bg-background p-1 border rounded-l-none rounded-r-md w-full font-medium text-foreground text-sm hover:cursor-pointer outline-none"
    >
      <span className="relative flex gap-1 grow">
        {multiple ? (
          <>
            {showSelectionsAs ? (
              showSelectionsAs == "tags" ? (
                <div className="top-9 left-[-2.5rem] flex flex-wrap gap-0.5 w-full">
                  {Array.isArray(value) && value?.length > 0 ? (
                    value.map((v) => (
                      <button
                        key={v.value}
                        onClick={() => {
                          selectOption(v);
                        }}
                        className="flex items-center border-[#777] border-[0.05em] px-[0.25em] hover:border-red-600 border-solid rounded-md cursor-pointer outline-none"
                      >
                        {v.text}
                        <RxCross2 className="hover:bg-white ml-1 rounded-full text-slate-600 hover:text-red-600" />
                      </button>
                    ))
                  ) : (
                    <span className="pl-2 text-white">All</span>
                  )}
                </div>
              ) : (
                <div className="top-9 left-[-2.5rem] flex gap-0.5">
                  {Array.isArray(value) && value.length > 0 ? (
                    <span className="px-[0.25em] hover:border-red-600 rounded-md cursor-pointer outline-none">
                      {value?.map((v) => v.text).join(",")}
                    </span>
                  ) : (
                    <span className="pl-2 text-white">All</span>
                  )}
                </div>
              )
            ) : (
              <span className="pl-2 text-ellipsis text-sm whitespace-nowrap overflow-hidden">
                {Array.isArray(value) && value.length > 0
                  ? `${value.length} Selected`
                  : "All"}
              </span>
            )}
          </>
        ) : (
          <span className="pl-2 overflow-hidden">
            {Array.isArray(value) ? value[0]?.text : value?.text}
          </span>
        )}
      </span>
      {showSelectionsAs == "tags" &&
        multiple &&
        Array.isArray(value) &&
        value?.length > 0 && (
          <button
            onClick={() => {
              onChange([]);
            }}
            className="border-[none] bg-none p-0 text-[1.25em] text-white cursor-pointer outline-none"
          >
            <RxCrossCircled />
          </button>
        )}
      <RiArrowDropDownLine size={30} />
      <ul
        className={`absolute bg-background border border-gray-600 cursor-pointer dark:border-gray-300 font-medium max-h-48 mt-1 overflow-y-auto py-1 rounded-md text-foreground text-sm top-full w-full z-10 ${
          isOpen ? "" : "hidden"
        }`}
      >
        {options.map((option) => (
          <li
            onClick={() => {
              selectOption(option);
            }}
            key={option.value}
            className={` ${
              isOptionSelected(option) ? "bg-[hsl(240,46%,46%)] text-white" : ""
            } hover:bg-[#7474e1] m-1 px-1 rounded-md overflow-x-hidden whitespace-nowrap	`}
          >
            {option.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
