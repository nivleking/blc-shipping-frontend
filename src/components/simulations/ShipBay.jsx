import ContainerBay from "./ContainerBay";
import DroppableCell from "./DroppableCell";
import DraggableContainer from "./DraggableContainer";

// Add this helper function
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

const ShipBay = ({ bayCount, baySize, droppedItems, draggingItem, bayTypes, containers }) => {
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
            <div
              className={`
    text-center p-3 border-b-2
    ${bayTypes?.[bayIndex] === "reefer" ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"}
  `}
            >
              <h5 className="text-lg font-bold mb-1">Bay {bayIndex + 1}</h5>
              <span
                className={`
      inline-block px-3 py-1 rounded-full text-xs font-semibold
      ${bayTypes?.[bayIndex] === "reefer" ? "bg-blue-100 text-blue-700 ring-2 ring-blue-200" : "bg-gray-100 text-gray-600"}
    `}
              >
                {bayTypes?.[bayIndex]?.toLowerCase() || "dry"}
              </span>
            </div>
            <ContainerBay id={`bay-${bayIndex}`} rows={baySize.rows} columns={baySize.columns}>
              {Array.from({ length: baySize.rows * baySize.columns }).map((_, cellIndex) => {
                const cellId = `bay-${bayIndex}-${cellIndex}`;
                const isValid = isValidPlacement(droppedItems, baySize, cellId);
                const rowIndex = Math.floor(cellIndex / baySize.columns);
                const colIndex = cellIndex % baySize.columns;
                const coordinates = `${bayIndex + 1}${rowIndex}${colIndex}`;
                return (
                  <DroppableCell key={cellId} id={cellId} coordinates={coordinates} isValid={isValid}>
                    {droppedItems.find((item) => item.area === cellId) && (
                      <DraggableContainer
                        id={droppedItems.find((item) => item.area === cellId).id}
                        text={droppedItems.find((item) => item.area === cellId).id}
                        isDragging={draggingItem === droppedItems.find((item) => item.area === cellId).id}
                        color={droppedItems.find((item) => item.area === cellId).color}
                        type={containers.find((c) => c.id === droppedItems.find((item) => item.area === cellId).id)?.type?.toLowerCase() || "dry"}
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
