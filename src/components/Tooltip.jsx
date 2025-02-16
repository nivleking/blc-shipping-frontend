import { AiOutlineInfoCircle } from "react-icons/ai";

const Tooltip = ({ children }) => {
  return (
    <div className="group relative inline-block ml-2">
      <AiOutlineInfoCircle className="text-gray-400 hover:text-gray-600 h-5 w-5" />
      <div className="opacity-0 bg-black text-white text-sm rounded-lg py-2 px-3 absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 group-hover:opacity-100 transition-opacity duration-300">
        {children}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-2">
          <div className="border-8 border-solid border-transparent border-t-black"></div>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
