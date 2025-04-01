import ContainerBay from "./ContainerBay";
import DroppableCell from "./DroppableCell";
import DraggableContainer from "./DraggableContainer"

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

const ShipBay = ({ bayCount, baySize, droppedItems, draggingItem, bayTypes, containers, isHistoryView = false, targetContainers = [], currentPort = "" }) => {
  // Normalize port code for consistency
  const normalizedCurrentPort = currentPort ? currentPort.trim().toUpperCase() : "";

  return (
    <div className="p-5" style={{ height: "100%", backgroundColor: "#f0f0f0", overflowX: "auto" }}>
      <div className="flex" style={{ width: "max-content" }}>
        {Array.from({ length: bayCount }).map((_, bayIndex) => (
          <div
            key={`bay-${bayIndex}`}
            className={`
              mb-4 mx-2 rounded-lg overflow-hidden
              ${bayTypes?.[bayIndex] === "reefer" ? "bg-gradient-to-b from-blue-50 to-white border-2 border-blue-300" : "bg-gradient-to-b from-gray-50 to-white border-2 border-gray-200"}
            `}
          >
            {/* Bay Header */}
            <div className={`text-center p-3 border-b-2 ${bayTypes?.[bayIndex] === "reefer" ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"}`}>
              <h5 className="text-lg font-bold mb-1">Bay {bayIndex + 1}</h5>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${bayTypes?.[bayIndex] === "reefer" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                {bayTypes?.[bayIndex]?.toLowerCase() || "dry"}
              </span>
            </div>
            <ContainerBay id={`bay-${bayIndex}`} rows={baySize.rows} columns={baySize.columns}>
              {Array.from({ length: baySize.rows * baySize.columns }).map((_, cellIndex) => {
                const cellId = `bay-${bayIndex}-${cellIndex}`;
                const isValid = isHistoryView ? true : isValidPlacement(droppedItems, baySize, cellId);
                const rowIndex = Math.floor(cellIndex / baySize.columns);
                const colIndex = cellIndex % baySize.columns;
                const coordinates = `${bayIndex + 1}${rowIndex}${colIndex}`;
                const item = droppedItems.find((item) => item.area === cellId);

                const isTarget = targetContainers.some((target) => target.id === item?.id);
                // const container = containers?.find((c) => c.id === item?.id);
                // const containerDestination = container?.destination?.trim().toUpperCase();

                const isOptionalTarget = !isTarget;

                return (
                  <DroppableCell key={cellId} id={cellId} coordinates={coordinates} isValid={isValid} isHistoryView={isHistoryView}>
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
                      />
                    )}
                  </DroppableCell>
                );
              })}
            </ContainerBay>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShipBay;
