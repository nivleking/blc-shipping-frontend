const RenderShipBayLayout = ({ bayCount, baySize }) => {
  return (
    <div className="flex overflow-x-auto">
      {Array.from({ length: bayCount }).map((_, bayIndex) => (
        <div key={`bay-${bayIndex}`} className="mb-4">
          <h5 className="text-center text-md font-medium mb-2">Bay {bayIndex + 1}</h5>
          <div
            className="grid gap-1 m-2 border border-gray-400 rounded shadow-sm"
            style={{
              gridTemplateColumns: `repeat(${baySize.columns}, 1fr)`,
              gridTemplateRows: `repeat(${baySize.rows}, 1fr)`,
            }}
          >
            {Array.from({ length: baySize.rows * baySize.columns }).map((_, cellIndex) => (
              <div key={`bay-${bayIndex}-${cellIndex}`} className="h-16 w-16 border border-gray-300 flex items-center justify-center rounded shadow-sm">
                <span style={{ position: "absolute", top: "2px", left: "2px", fontSize: "10px", color: "gray" }}>
                  {bayIndex + 1}
                  {Math.floor(cellIndex / baySize.columns)}
                  {cellIndex % baySize.columns}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RenderShipBayLayout;
