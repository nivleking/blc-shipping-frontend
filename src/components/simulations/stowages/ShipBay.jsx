import ContainerBay from "./ContainerBay";
import DroppableCell from "./DroppableCell";
import DraggableContainer from "./DraggableContainer";
import { useMemo } from "react";

const isValidPlacement = (droppedItems, baySize, cellId) => {
  const [type, bayIndex, cellIndex] = cellId.split("-");
  const row = Math.floor(cellIndex / baySize.columns);
  const col = cellIndex % baySize.columns;

  // If not bottom row, must have container below
  if (row < baySize.rows - 1) {
    const belowCellId = `bay-${bayIndex}-${(row + 1) * baySize.columns + col}`;
    const containerBelow = droppedItems.find((item) => item.area === belowCellId);
    if (!containerBelow) return false;
  }

  return true;
};

const ShipBay = ({
  bayCount,
  baySize,
  droppedItems,
  draggingItem,
  bayTypes,
  containers,
  isHistoryView = false,
  targetContainers = [],
  currentPort = "",
  restowageContainers = [],
  containerDestinationsCache,
  hoveredCardId = null, //
  onContainerHover, //
}) => {
  // Normalize port code for consistency
  const normalizedCurrentPort = currentPort ? currentPort.trim().toUpperCase() : "";

  // Create map for efficient lookup of restowage containers
  const restowageMap = useMemo(() => {
    const map = {};
    if (restowageContainers && restowageContainers.length) {
      restowageContainers.forEach((container) => {
        map[container.container_id] = container;
        map[container.blocking_container_id] = {
          ...container,
          is_blocking: true,
        };
      });
    }
    return map;
  }, [restowageContainers]);

  // Calculate which bays have restowage issues
  const baysWithRestowageIssues = useMemo(() => {
    const affectedBays = {};

    droppedItems.forEach((item) => {
      if (restowageMap[item.id] && item.area) {
        const [type, bayIndex] = item.area.split("-");
        affectedBays[bayIndex] = true;
      }
    });

    return affectedBays;
  }, [droppedItems, restowageMap]);

  const shouldHighlightContainer = (containerId) => {
    if (!hoveredCardId) return false;

    const container = containers.find((c) => c.id.toString() === containerId.toString());
    return container && container.card_id === hoveredCardId;
  };

  // Function to get card group for visual feedback
  const getContainerCardGroup = (containerId) => {
    const container = containers.find((c) => c.id.toString() === containerId.toString());
    return container && container.card_id ? container.card_id : null;
  };

  const shouldHighlightCell = (cellId) => {
    if (!hoveredCardId) return false;

    const containerInCell = droppedItems.find((item) => item.area === cellId);
    if (!containerInCell) return false;

    const container = containers.find((c) => c.id.toString() === containerInCell.id.toString());
    return container && container.card_id === hoveredCardId;
  };

  return (
    <div className="p-1" style={{ height: "100%", backgroundColor: "#f0f0f0", overflowX: "auto" }}>
      <div className="flex" style={{ width: "max-content" }}>
        {Array.from({ length: bayCount }).map((_, bayIndex) => {
          const hasRestowageIssue = baysWithRestowageIssues[bayIndex];

          return (
            <div
              key={`bay-${bayIndex}`}
              className={`
                mx-2 rounded-md overflow-hidden shadow-sm
                ${bayTypes?.[bayIndex] === "reefer" ? "bg-gradient-to-b from-blue-50 to-white border border-blue-300" : "bg-gradient-to-b from-gray-50 to-white border border-gray-200"}
                ${hasRestowageIssue ? "relative ring-1 ring-red-500 shadow-lg shadow-red-200" : ""}
              `}
            >
              {/* Bay Header */}
              <div
                className={`
                text-center p-1 border-b
                ${bayTypes?.[bayIndex] === "reefer" ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"}
                ${hasRestowageIssue ? "bg-red-50 border-red-200" : ""}
              `}
              >
                <h5 className={`text-[9px] font-semibold ${hasRestowageIssue ? "text-red-700" : ""}`}>Bay {bayIndex + 1}</h5>
                <div className="flex justify-center items-center">
                  <span
                    className={`
                      text-[9px] inline-block px-1.5 py-0.5 rounded-full font-medium
                    ${bayTypes?.[bayIndex] === "reefer" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}
                  `}
                  >
                    {bayTypes?.[bayIndex]?.toUpperCase() || "DEFAULT"}
                  </span>
                  {hasRestowageIssue && <span className="text-[9px] inline-block px-1 py-0.5 rounded-full font-medium bg-red-100 text-red-700">RESTOWAGE ISSUE</span>}
                </div>
              </div>

              <ContainerBay
                id={`bay-${bayIndex}`}
                rows={baySize.rows}
                columns={baySize.columns}
                hasRestowageIssue={hasRestowageIssue} //
              >
                {Array.from({ length: baySize.rows * baySize.columns }).map((_, cellIndex) => {
                  const cellId = `bay-${bayIndex}-${cellIndex}`;
                  const isValid = isHistoryView ? true : isValidPlacement(droppedItems, baySize, cellId);
                  const rowIndex = Math.floor(cellIndex / baySize.columns);
                  const colIndex = cellIndex % baySize.columns;
                  const coordinates = `${bayIndex + 1}${rowIndex}${colIndex}`;
                  const item = droppedItems.find((item) => item.area === cellId);

                  const isTarget = targetContainers.some((target) => target.id === item?.id);
                  const isOptionalTarget = !isTarget;

                  const isRestowageProblem = item && restowageMap[item.id];
                  const isBlocking = isRestowageProblem && restowageMap[item.id]?.is_blocking;
                  const isHighlighted = shouldHighlightCell(cellId);

                  return (
                    <DroppableCell
                      key={cellId}
                      id={cellId}
                      coordinates={coordinates}
                      isValid={isValid}
                      isHistoryView={isHistoryView}
                      isHighlighted={isHighlighted} //
                    >
                      {item && (
                        <DraggableContainer
                          id={item.id}
                          text={item.id}
                          isDragging={!isHistoryView && draggingItem === item.id}
                          color={item.color}
                          type={containers !== undefined ? containers.find((c) => c.id === item.id)?.type?.toLowerCase() || "dry" : item.type}
                          isHistoryView={isHistoryView}
                          isTarget={isTarget}
                          isOptionalTarget={isOptionalTarget}
                          isRestowageProblem={isRestowageProblem}
                          isBlocking={isBlocking}
                          tooltipContent={
                            isRestowageProblem ? (isBlocking ? `Blocking container: Will need to be moved at ${restowageMap[item.id].destination}` : `Restowage issue: Will need early handling at ${restowageMap[item.id].destination}`) : ""
                          }
                          destination={containerDestinationsCache[item.id]}
                          isHighlighted={shouldHighlightContainer(item.id)}
                          cardGroup={getContainerCardGroup(item.id)}
                          onHover={onContainerHover} //
                        />
                      )}
                    </DroppableCell>
                  );
                })}
              </ContainerBay>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShipBay;
