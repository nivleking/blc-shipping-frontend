const RenderShipBayLayout = ({ bayCount, baySize, bayTypes, onBayTypeChange }) => {
  return (
    <div className="flex gap-6 overflow-x-auto p-4">
      {Array.from({ length: bayCount }).map((_, bayIndex) => (
        <div key={`bay-${bayIndex}`} className={`flex flex-col items-center ${bayTypes?.[bayIndex] === "reefer" ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-300"} border-2 rounded-lg p-4 min-w-[200px]`}>
          <div className="text-center mb-2">
            <h5 className="text-lg font-semibold">Bay {bayIndex + 1}</h5>
          </div>

          <div
            className="grid gap-1 mb-4"
            style={{
              gridTemplateColumns: `repeat(${baySize.columns}, minmax(32px, 1fr))`,
              gridTemplateRows: `repeat(${baySize.rows}, minmax(32px, 1fr))`,
            }}
          >
            {Array.from({ length: baySize.rows * baySize.columns }).map((_, cellIndex) => (
              <div
                key={`bay-${bayIndex}-${cellIndex}`}
                className={`aspect-square border rounded flex items-center justify-center relative
                  ${bayTypes?.[bayIndex] === "reefer" ? "border-blue-200 bg-blue-50/50" : "border-gray-200 bg-white"}`}
              >
                <span className="text-[10px] text-gray-400">{`${bayIndex + 1}${Math.floor(cellIndex / baySize.columns)}${cellIndex % baySize.columns}`}</span>
              </div>
            ))}
          </div>

          {/* Checkbox control */}
          <label
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
            ${bayTypes?.[bayIndex] === "reefer" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}
          `}
          >
            <input type="checkbox" checked={bayTypes?.[bayIndex] === "reefer"} onChange={(e) => onBayTypeChange(bayIndex, e.target.checked ? "reefer" : "dry")} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-medium">Reefer</span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default RenderShipBayLayout;
