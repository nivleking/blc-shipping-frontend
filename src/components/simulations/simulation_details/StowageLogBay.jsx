import React, { useMemo } from "react";

const StowageLogBay = ({ arenaData, containers = [], bayTypes = [] }) => {
  // Create a container lookup map for quick access by ID
  const containerMap = useMemo(() => {
    return containers.reduce((map, container) => {
      map[container.id] = container;
      return map;
    }, {});
  }, [containers]);

  if (!arenaData) {
    return (
      <div className="flex items-center justify-center h-60 bg-gray-100 rounded border border-dashed border-gray-300">
        <p className="text-gray-500 text-sm">No bay data available</p>
      </div>
    );
  }

  // Handle various possible data formats
  let arena = {};
  try {
    // If string, parse it
    if (typeof arenaData === "string") {
      arena = JSON.parse(arenaData);
    }
    // If already parsed but still has stringified containers
    else if (typeof arenaData === "object" && arenaData !== null) {
      arena = arenaData;
      // Check if arena.containers is a string that needs parsing
      if (typeof arena.containers === "string") {
        arena.containers = JSON.parse(arena.containers);
      }
    }
  } catch (error) {
    console.error("Error parsing arena data:", error);
    return (
      <div className="flex items-center justify-center h-60 bg-red-50 rounded border border-dashed border-red-300">
        <p className="text-red-500 text-sm">Error parsing bay data</p>
      </div>
    );
  }

  // Get containers from arena data
  const arenaContainers = Array.isArray(arena.containers) ? arena.containers : [];

  // Find the maximum bay, row, and col to determine the grid size
  let maxBay = 0,
    maxRow = 0,
    maxCol = 0;
  arenaContainers.forEach((container) => {
    maxBay = Math.max(maxBay, container.bay || 0);
    maxRow = Math.max(maxRow, container.row || 0);
    maxCol = Math.max(maxCol, container.col || 0);
  });

  // Create grid structure - start with maxBay + 1 bays
  const bays = Array.from({ length: maxBay + 1 }, () => {
    // Each bay has maxRow + 1 rows
    return Array.from({ length: maxRow + 1 }, () => {
      // Each row has maxCol + 1 columns, all empty initially
      return Array(maxCol + 1).fill(null);
    });
  });

  // Place containers in the grid
  arenaContainers.forEach((container) => {
    const { bay, row, col } = container;
    if (bay !== undefined && row !== undefined && col !== undefined) {
      bays[bay][row][col] = container;
    }
  });

  // Function to get container color from container database
  const getContainerColor = (containerId) => {
    const containerInfo = containerMap[containerId];
    return containerInfo?.color || (containerInfo?.type === "reefer" ? "#3B82F6" : "#6B7280");
  };

  const getContainerType = (containerId) => {
    const containerInfo = containerMap[containerId];
    return containerInfo?.type || "dry";
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-2 pb-2">
        {bays.map((bay, bayIndex) => {
          // Check if this bay is a reefer bay
          const isReeferBay = bayTypes[bayIndex] === "reefer";

          return (
            <div key={bayIndex} className="flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium">Bay {bayIndex}</div>
                {isReeferBay && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md">Reefer</span>}
              </div>
              {/* Make both bay types have the same border, padding and size styling */}
              <div className={`p-1 rounded border ${isReeferBay ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${maxCol + 1}, 30px)`,
                    gridTemplateRows: `repeat(${maxRow + 1}, 30px)`,
                  }}
                >
                  {bay.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div key={`${rowIndex}-${colIndex}`} className="relative rounded border border-gray-200 bg-white flex items-center justify-center text-[8px] text-center">
                        {cell && (
                          <div
                            className="absolute inset-0 flex items-center justify-center rounded"
                            style={{
                              backgroundColor: getContainerColor(cell.id),
                              color: getContainerColor(cell.id) === "yellow" ? "black" : "white",
                            }}
                          >
                            {/* Container type badge */}
                            <div className="absolute top-0 right-0 p-0.5">
                              <span
                                className={`
                                  inline-block w-2 h-2 rounded-full
                                  ${getContainerType(cell.id) === "reefer" ? "bg-blue-500 ring-1 ring-blue-500" : "bg-gray-300 ring-1 ring-gray-500"}
                                `}
                                title={getContainerType(cell.id) === "reefer" ? "Reefer" : "Dry"}
                              />
                            </div>
                            <span className="select-none">{cell.id.toString()}</span>
                          </div>
                        )}
                        <span className="absolute top-0 left-0 text-[6px] text-gray-400">{`${bayIndex}${rowIndex}${colIndex}`}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StowageLogBay;
