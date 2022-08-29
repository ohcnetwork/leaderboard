import { useState } from "react";

const Tooltip = ({ children, tip = "", className = "", tipStyle = "" }) => {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className={"relative " + className}>
      {tip && showTip && (
        <div
          className={
            "absolute bg-gray-500 p-1 rounded text-center w-fit mb-2 z-10 " +
            tipStyle
          }
        >
          {tip}
        </div>
      )}
      <div
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        className="max-w-fit"
      >
        {children}
      </div>
    </div>
  );
};

export default Tooltip;
