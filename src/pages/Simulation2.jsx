import React, { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

const Draggable = ({ id, style }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const draggableStyle = {
    ...style,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    position: isDragging ? "fixed" : "relative", // Gunakan fixed saat dragging
    zIndex: isDragging ? 1000 : "auto", // Pastikan elemen berada di atas lainnya
  };

  return (
    <div ref={setNodeRef} style={draggableStyle} {...listeners} {...attributes}>
      Drag me
    </div>
  );
};

const Droppable = ({ id, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const style = {
    width: "80px",
    height: "80px",
    backgroundColor: isOver ? "lightgreen" : "lightgrey",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "5px",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};

const Grid = ({ idPrefix, items }) => {
  const cells = [];
  for (let i = 0; i < 9; i++) {
    cells.push(
      <Droppable key={i} id={`${idPrefix}-${i}`}>
        {items[`${idPrefix}-${i}`] && <Draggable id={`${idPrefix}-${i}`} style={items[`${idPrefix}-${i}`].style} />}
      </Droppable>
    );
  }

  return <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px", border: "1px solid black" }}>{cells}</div>;
};

const Simulation2 = () => {
  const [items, setItems] = useState({
    "grid1-0": { style: { width: "80px", height: "80px", backgroundColor: "lightblue", display: "flex", alignItems: "center", justifyContent: "center" } },
  });

  const handleDragStart = () => {
    document.body.style.overflow = "hidden";
  };

  const handleDragEnd = (event) => {
    document.body.style.overflow = "auto";
    const { active, over } = event;
    if (over) {
      setItems((prevItems) => {
        const newItems = { ...prevItems };
        newItems[over.id] = newItems[active.id];
        delete newItems[active.id];
        return newItems;
      });
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <h1 className="text-2xl text-center">Ship Bays</h1>
      <div
        className="gap-4 p-4"
        style={{
          display: "flex",
          justifyContent: "space-around",
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        <Grid idPrefix="grid1" items={items} />
        <Grid idPrefix="grid2" items={items} />
        <Grid idPrefix="grid3" items={items} />
        <Grid idPrefix="grid4" items={items} />
        <Grid idPrefix="grid5" items={items} />
        <Grid idPrefix="grid6" items={items} />
      </div>

      <div className="flex flex-col justify-center items-center gap-4">
        <h1 className="text-2xl">Docks</h1>
        <div className="flex flex-col items-center justify-center">
          <Grid idPrefix="grid99" items={items} />
        </div>
      </div>
    </DndContext>
  );
};

export default Simulation2;
