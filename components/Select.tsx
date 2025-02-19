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

/**
 * select component with customizable options.
 *
 * @component
 * @example
 * // Usage with single selection:
 * <Select
 *   options={[
 *     { value: "option1", text: "Option 1" },
 *     { value: "option2", text: "Option 2" },
 *     { value: "option3", text: "Option 3" },
 *   ]}
 *  value={{ value: "option1", text: "Option 1" }}
 *   onChange={(value) => console.log(value)}
 * />
 *
 * // Usage with multiple selection:
 * <Select
 *   multiple
 *   options={[
 *     { value: "option1", text: "Option 1" },
 *     { value: "option2", text: "Option 2" },
 *     { value: "option3", text: "Option 3" },
 *   ]}
 *   value={[
 *    { value: "option1", text: "Option 1" },
 *   { value: "option2", text: "Option 2" },
 *  ]}
 *   onChange={(value) => console.log(value)}
 * />
 *
 * @param {object} props - The component props.
 * @param {SelectOption[]} props.options - The available options for selection.
 * @param {string} [props.showSelectionsAs="tags"] - The style to display the selected options. Can be "tags" or "text".
 * @param {boolean} [props.multiple=false] - Whether multiple options can be selected.
 * @param {SelectOption | SelectOption[]} [props.value] - The currently selected option(s). You can pass default value(s) as well.
 * @param {(value: SelectOption | SelectOption[]) => void} props.onChange - The callback function triggered when the selection changes.
 *
 * @returns {JSX.Element} The rendered Select component.
 */

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
      className="relative flex w-full items-center rounded-l-none rounded-r-md border border-secondary-600 bg-background p-1 text-sm font-medium text-foreground outline-none hover:cursor-pointer dark:border-secondary-300"
    >
      <span className="relative flex grow gap-1">
        {multiple ? (
          <>
            {showSelectionsAs ? (
              showSelectionsAs == "tags" ? (
                <div className="-left-10 top-9 flex w-full flex-wrap gap-0.5">
                  {Array.isArray(value) &&
                  value?.length > 0 &&
                  value.length !== options.length ? (
                    value.map((v) => (
                      <button
                        key={v.value}
                        onClick={() => {
                          selectOption(v);
                        }}
                        className="flex cursor-pointer items-center rounded-md border-[0.05em] border-solid border-[#777] px-[0.25em] outline-none hover:border-red-600"
                      >
                        {v.text}
                        <RxCross2 className="ml-1 rounded-full text-slate-600 hover:bg-white hover:text-red-600" />
                      </button>
                    ))
                  ) : (
                    <span className="pl-2 text-black dark:text-white">All</span>
                  )}
                </div>
              ) : (
                <div className="-left-10 top-9 flex gap-0.5">
                  {Array.isArray(value) &&
                  value.length > 0 &&
                  value.length !== options.length ? (
                    <span className="cursor-pointer rounded-md px-[0.25em] outline-none hover:border-red-600">
                      {value?.map((v) => v.text).join(",")}
                    </span>
                  ) : (
                    <span className="pl-2 text-black dark:text-white">All</span>
                  )}
                </div>
              )
            ) : (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap pl-2 text-sm">
                {Array.isArray(value) && value.length > 0
                  ? `${value.length} Selected`
                  : "All"}
              </span>
            )}
          </>
        ) : (
          <span className="overflow-hidden pl-2">
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
            className="cursor-pointer border-[none] bg-none p-0 text-[1.25em] text-white outline-none"
          >
            <RxCrossCircled />
          </button>
        )}
      <RiArrowDropDownLine size={30} />
      <ul
        className={`absolute top-full z-10 mt-1 max-h-48 w-full cursor-pointer overflow-y-auto rounded-md border border-secondary-600 bg-background py-1 text-sm font-medium text-foreground dark:border-secondary-300 ${
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
            } m-1 overflow-x-hidden whitespace-nowrap rounded-md px-1 hover:bg-[#7474e1]	`}
          >
            {option.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
