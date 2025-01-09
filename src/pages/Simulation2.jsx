import { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

const DraggableBox = ({ id, text, style }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const defaultStyle = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    padding: "8px",
    margin: "4px",
    backgroundColor: "lightblue",
    cursor: "move",
  };

  return (
    <div ref={setNodeRef} style={{ ...defaultStyle, ...style }} {...listeners} {...attributes}>
      {text}
    </div>
  );
};

const DroppableArea = ({ id, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const style = {
    height: "200px",
    width: "200px",
    border: "1px solid black",
    backgroundColor: isOver ? "lightgreen" : "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "10px",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};

const Simulation = () => {
  const [droppedItem, setDroppedItem] = useState(null);
  const [droppedArea, setDroppedArea] = useState(null);

  const handleDragEnd = (event) => {
    const { over } = event;
    if (over) {
      setDroppedItem(event.active.id);
      setDroppedArea(over.id);
      console.log(`Dropped item: ${event.active.id} into ${over.id}`);
    } else {
      setDroppedItem(null);
      setDroppedArea(null);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <h2>Drag and Drop Simulation</h2>
        <div style={{ display: "flex", gap: "20px" }}>
          <DroppableArea id="droppable1">{droppedArea === "droppable1" && <DraggableBox id="box1" text="Drag me" style={{ height: "100%", width: "100%", margin: 0 }} />}</DroppableArea>
          <DroppableArea id="droppable2">{droppedArea === "droppable2" && <DraggableBox id="box1" text="Drag me" style={{ height: "100%", width: "100%", margin: 0 }} />}</DroppableArea>
        </div>
        {!droppedItem && <DraggableBox id="box1" text="Drag me" />}
      </div>
    </DndContext>
  );
};

export default Simulation;
