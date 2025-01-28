import ContainerDock from "./ContainerDock";
import DroppableCell from "./DroppableCell";
import DraggableContainer from "./DraggableContainer";

const ShipDock = ({ dockSize, paginatedItems, draggingItem }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <ContainerDock id="docks" rows={dockSize.rows} columns={dockSize.columns}>
        {Array.from({ length: dockSize.rows * dockSize.columns }).map((_, cellIndex) => {
          const rowIndex = Math.floor(cellIndex / dockSize.columns);
          const colIndex = cellIndex % dockSize.columns;
          const coordinates = `docks-${rowIndex}${colIndex}`;
          const isValid = true;
          return (
            <DroppableCell key={`docks-${cellIndex}`} id={`docks-${cellIndex}`} coordinates={coordinates} isValid={isValid}>
              {paginatedItems.find((item) => item.area === `docks-${cellIndex}`) && (
                <DraggableContainer
                  id={paginatedItems.find((item) => item.area === `docks-${cellIndex}`).id}
                  text={paginatedItems.find((item) => item.area === `docks-${cellIndex}`).id}
                  isDragging={draggingItem === paginatedItems.find((item) => item.area === `docks-${cellIndex}`).id}
                  color={paginatedItems.find((item) => item.area === `docks-${cellIndex}`).color}
                />
              )}
            </DroppableCell>
          );
        })}
      </ContainerDock>
    </div>
  );
};

export default ShipDock;
