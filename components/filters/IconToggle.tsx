import { IconType } from "react-icons";
const IconToggle = ({
  state = false,
  handleOnClick,
  TrueIcon,
  FalseIcon,
}: {
  state: boolean;
  handleOnClick: () => void;
  TrueIcon: IconType;
  FalseIcon: IconType;
}) => {
  return (
    <div
      onClick={handleOnClick}
      className="p-2 rounded border border-gray-600 dark:border-gray-300 shadow-sm cursor-pointer"
    >
      {state ? (
        <TrueIcon className="text-foreground" size={20} />
      ) : (
        <FalseIcon className="text-foreground" size={20} />
      )}
    </div>
  );
};

export default IconToggle;
