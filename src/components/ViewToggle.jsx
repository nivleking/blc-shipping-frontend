import { BsGrid3X3Gap, BsTable } from "react-icons/bs";

const ViewToggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="bg-gray-100 rounded-lg p-1 flex">
      <button className={`p-1.5 rounded-md flex items-center space-x-1 ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setViewMode("grid")} title="Grid view">
        <BsGrid3X3Gap className="w-4 h-4" />
        <span className="text-xs font-medium">Grid</span>
      </button>
      <button className={`p-1.5 rounded-md flex items-center space-x-1 ${viewMode === "table" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setViewMode("table")} title="Table view">
        <BsTable className="w-4 h-4" />
        <span className="text-xs font-medium">Table</span>
      </button>
    </div>
  );
};

export default ViewToggle;
