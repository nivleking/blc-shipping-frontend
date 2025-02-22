import "./RenderShipBayLayout.css";

const RenderShipBayLayout = ({ bayCount, baySize, bayTypes, onBayTypeChange, readonly }) => {
  // Helper function untuk menghitung ukuran cell yang responsif
  const calculateCellSize = () => {
    const maxWidth = 32; // Ukuran maksimum cell
    const minWidth = 24; // Ukuran minimum cell

    // Hitung ukuran berdasarkan jumlah kolom
    const calculatedSize = Math.min(maxWidth, Math.max(minWidth, Math.floor(200 / baySize.columns)));

    return calculatedSize;
  };

  const cellSize = calculateCellSize();

  return (
    <div className="flex flex-nowrap gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {Array.from({ length: bayCount }).map((_, bayIndex) => (
        <div
          key={`bay-${bayIndex}`}
          className={`flex-shrink-0 flex flex-col items-center
            ${bayTypes?.[bayIndex] === "reefer" ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-300"} 
            border-2 rounded-lg p-3`}
          style={{
            width: `${Math.max(200, cellSize * baySize.columns + 32)}px`,
          }}
        >
          <div className="text-center mb-2">
            <h5 className="text-lg font-semibold">Bay {bayIndex + 1}</h5>
          </div>

          <div className="w-full overflow-y-auto max-h-[400px] custom-scrollbar">
            <div
              className="grid gap-1 mb-4 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${baySize.columns}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${baySize.rows}, ${cellSize}px)`,
                width: "fit-content",
              }}
            >
              {Array.from({ length: baySize.rows * baySize.columns }).map((_, cellIndex) => (
                <div
                  key={`bay-${bayIndex}-${cellIndex}`}
                  className={`flex items-center justify-center relative
                    ${bayTypes?.[bayIndex] === "reefer" ? "border-blue-200 bg-blue-50/50" : "border-gray-200 bg-white"}
                    border rounded hover:bg-gray-50 transition-colors`}
                >
                  <span className="text-[10px] text-gray-400">{`${bayIndex + 1}${Math.floor(cellIndex / baySize.columns)}${cellIndex % baySize.columns}`}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Only show the checkbox if not readonly */}
          {!readonly && onBayTypeChange && (
            <label
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors w-full justify-center
                ${bayTypes?.[bayIndex] === "reefer" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}
              `}
            >
              <input
                type="checkbox"
                checked={bayTypes?.[bayIndex] === "reefer"}
                onChange={(e) => onBayTypeChange(bayIndex, e.target.checked ? "reefer" : "dry")}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Reefer</span>
            </label>
          )}
        </div>
      ))}
    </div>
  );
};

export default RenderShipBayLayout;
