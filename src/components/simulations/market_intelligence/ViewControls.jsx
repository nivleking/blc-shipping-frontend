const ViewControls = ({ viewMode, setViewMode, filterType, setFilterType }) => {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-600">View:</span>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            className={`px-3 py-1 text-xs font-medium rounded-l-lg border ${viewMode === "matrix" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
            onClick={() => setViewMode("matrix")}
          >
            Matrix
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium rounded-r-lg border-t border-r border-b ${viewMode === "list" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-600">Type:</span>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            className={`px-3 py-1 text-xs font-medium rounded-l-lg border ${filterType === "all" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
            onClick={() => setFilterType("all")}
          >
            All
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium border-t border-b ${filterType === "dry" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
            onClick={() => setFilterType("dry")}
          >
            Dry
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium rounded-r-lg border-t border-r border-b ${filterType === "reefer" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
            onClick={() => setFilterType("reefer")}
          >
            Reefer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewControls;
