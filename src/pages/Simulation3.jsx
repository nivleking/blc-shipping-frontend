import { useState } from "react";
import { DndContext, useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DraggableBox = ({ id, text }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "8px",
    margin: "4px",
    backgroundColor: "lightblue",
    cursor: "move",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {text}
    </div>
  );
};

const DroppableCell = ({ id, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  const style = {
    height: "60px",
    width: "60px",
    border: "1px solid black",
    backgroundColor: isOver ? "lightgreen" : "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};

const SimulationWithDragMe = () => {
  const [droppedItem, setDroppedItem] = useState("box1");
  const [droppedArea, setDroppedArea] = useState("start-0");

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== droppedArea) {
      setDroppedItem(active.id);
      setDroppedArea(over.id);
      console.log(`Box moved to ${over.id}`);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <SortableContext items={[droppedItem]}>
          <div style={{ display: "flex", gap: "20px" }}>
            {/* Start Area */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
              {Array.from({ length: 9 }).map((_, index) => (
                <DroppableCell key={`start-${index}`} id={`start-${index}`}>
                  {droppedArea === `start-${index}` && <DraggableBox id="box1" text="Drag me" />}
                </DroppableCell>
              ))}
            </div>

            {/* Droppable Area */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}>
              {Array.from({ length: 9 }).map((_, index) => (
                <DroppableCell key={`droppable1-${index}`} id={`droppable1-${index}`}>
                  {droppedArea === `droppable1-${index}` && <DraggableBox id="box1" text="Drag me" />}
                </DroppableCell>
              ))}
            </div>

            {/* Linear Area */}
            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <DroppableCell key={`linear-${index}`} id={`linear-${index}`}>
                  {droppedArea === `linear-${index}` && <DraggableBox id="box1" text="Drag me" />}
                </DroppableCell>
              ))}
            </div>
          </div>
        </SortableContext>
      </div>
    </DndContext>
  );
};

export default SimulationWithDragMe;
