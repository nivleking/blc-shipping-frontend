import React, { useMemo } from "react";

const StowageLogDock = ({ arenaData, containers = [] }) => {
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
        <p className="text-gray-500 text-sm">No dock data available</p>
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
        <p className="text-red-500 text-sm">Error parsing dock data</p>
      </div>
    );
  }

  // Get containers from arena data (ensure it's an array)
  const arenaContainers = Array.isArray(arena.containers) ? arena.containers : [];

  // Create a 5x10 grid with all positions
  const rows = 5;
  const cols = 10;
  const grid = Array(rows)
    .fill()
    .map(() => Array(cols).fill(null));

  // Map containers to their positions in the grid
  arenaContainers.forEach((container) => {
    // In dock data, containers usually have a position property
    // If the position is a simple index, convert it to row/col
    const position = container.position || container.index || 0;
    const row = Math.floor(position / cols);
    const col = position % cols;

    // Only place in grid if position is valid
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      grid[row][col] = container;
    }
  });

  // Function to get container color from container database
  const getContainerColor = (containerId) => {
    const containerInfo = containerMap[containerId];
    return containerInfo?.color || (containerInfo?.type === "reefer" ? "#3B82F6" : "#6B7280");
  };

  // Add function to get container type
  const getContainerType = (containerId) => {
    const containerInfo = containerMap[containerId];
    return containerInfo?.type || "dry"; // Default to dry if type not found
  };

  // Helper function to format position as 2-digit string
  const formatPosition = (position) => {
    return position.toString().padStart(2, "0");
  };

  return (
    <div className="overflow-x-auto">
      <div className="bg-gray-100 p-2 rounded">
        <div className="flex flex-col space-y-1">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex space-x-1">
              {row.map((container, colIndex) => (
                <div key={`${rowIndex}-${colIndex}`} className="relative w-12 h-12 rounded border border-gray-200 bg-white flex items-center justify-center text-xs text-center">
                  {container ? (
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded"
                      style={{
                        backgroundColor: getContainerColor(container.id),
                        color: getContainerColor(container.id) === "yellow" ? "black" : "white",
                      }}
                    >
                      {/* Container type badge - NEW */}
                      <div className="absolute top-0 right-0 p-0.5">
                        <span
                          className={`
                            inline-block w-2 h-2 rounded-full
                            ${getContainerType(container.id) === "reefer" ? "bg-blue-300 ring-1 ring-blue-500" : "bg-gray-300 ring-1 ring-gray-500"}
                          `}
                          title={getContainerType(container.id) === "reefer" ? "Reefer" : "Dry"}
                        />
                      </div>
                      <span className="select-none">{container.id.toString()}</span>
                    </div>
                  ) : null}
                  <span className="absolute top-0 left-0 text-[6px] text-gray-400">{formatPosition(rowIndex * cols + colIndex)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StowageLogDock;
