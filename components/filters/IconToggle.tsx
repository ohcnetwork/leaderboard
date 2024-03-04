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
      className="cursor-pointer rounded border border-secondary-600 p-2 shadow-sm dark:border-secondary-300"
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
