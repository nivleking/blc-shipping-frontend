import ContainerDock from "./ContainerDock";
import DroppableCell from "./DroppableCell";
import DraggableContainer from "./DraggableContainer";

const ShipDock = ({ dockSize, paginatedItems, draggingItem, containers, section, draggingTargetContainer }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <ContainerDock id="docks" rows={dockSize.rows} columns={dockSize.columns}>
        {Array.from({ length: dockSize.rows * dockSize.columns }).map((_, cellIndex) => {
          const rowIndex = Math.floor(cellIndex / dockSize.columns);
          const colIndex = cellIndex % dockSize.columns;
          const coordinates = `docks-${rowIndex}${colIndex}`;
          const isValid = true;
          const cellId = `docks-${cellIndex}`;
          const item = paginatedItems.find((item) => item.area === cellId);

          // Highlight empty dock cells as drop targets when dragging a target container in section 1
          const isDropTarget = section === 1 && draggingTargetContainer && !item; // only empty cells

          return (
            <DroppableCell key={cellId} id={cellId} coordinates={coordinates} isValid={isValid} isDropTarget={isDropTarget}>
              {item && <DraggableContainer id={item.id} text={item.id} isDragging={draggingItem === item.id} color={item.color} type={containers.find((c) => c.id === item.id)?.type?.toLowerCase() || "dry"} />}
            </DroppableCell>
          );
        })}
      </ContainerDock>
    </div>
  );
};

export default ShipDock;
