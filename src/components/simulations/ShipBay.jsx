import ContainerBay from "./ContainerBay";
import DroppableCell from "./DroppableCell";
import DraggableContainer from "./DraggableContainer";

const ShipBay = ({ bayCount, baySize, droppedItems, draggingItem }) => {
  return (
    <div className="p-5" style={{ height: "100%", backgroundColor: "#f0f0f0", overflowX: "auto" }}>
      <div className="flex" style={{ width: "max-content" }}>
        {Array.from({ length: bayCount }).map((_, bayIndex) => (
          <div key={`bay-${bayIndex}`}>
            <h5 className="text-center text-md font-medium mb-2">Bay {bayIndex + 1}</h5>
            <ContainerBay id={`bay-${bayIndex}`} rows={baySize.rows} columns={baySize.columns}>
              {Array.from({ length: baySize.rows * baySize.columns }).map((_, cellIndex) => {
                const rowIndex = Math.floor(cellIndex / baySize.columns);
                const colIndex = cellIndex % baySize.columns;
                const coordinates = `${bayIndex + 1}${rowIndex}${colIndex}`;
                return (
                  <DroppableCell key={`bay-${bayIndex}-${cellIndex}`} id={`bay-${bayIndex}-${cellIndex}`} coordinates={coordinates}>
                    {droppedItems.find((item) => item.area === `bay-${bayIndex}-${cellIndex}`) && (
                      <DraggableContainer
                        id={droppedItems.find((item) => item.area === `bay-${bayIndex}-${cellIndex}`).id}
                        text={droppedItems.find((item) => item.area === `bay-${bayIndex}-${cellIndex}`).id}
                        isDragging={draggingItem === droppedItems.find((item) => item.area === `bay-${bayIndex}-${cellIndex}`).id}
                        color={droppedItems.find((item) => item.area === `bay-${bayIndex}-${cellIndex}`).color}
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
