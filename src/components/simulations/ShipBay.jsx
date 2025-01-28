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

const ShipBay = ({ bayCount, baySize, droppedItems, draggingItem }) => {
  return (
    <div className="p-5" style={{ height: "100%", backgroundColor: "#f0f0f0", overflowX: "auto" }}>
      <div className="flex" style={{ width: "max-content" }}>
        {Array.from({ length: bayCount }).map((_, bayIndex) => (
          <div key={`bay-${bayIndex}`}>
            <h5 className="text-center text-md font-medium mb-2">Bay {bayIndex + 1}</h5>
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
