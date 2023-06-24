import { IconType } from 'react-icons';
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
      className="p-2 rounded border shadow-sm cursor-pointer"
    >
      {state ? (
        <TrueIcon className="text-white" size={20} />
      ) : (
        <FalseIcon className="text-white" size={20} />
      )}
    </div>
  );
};

export default IconToggle;
