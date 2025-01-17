import { useDroppable } from "@dnd-kit/core";

const DroppableCell = ({ id, children, coordinates }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const style = {
    backgroundColor: isOver ? "lightgreen" : "white",
    position: "relative",
    width: "100px",
    height: "100px",
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-gray-300 flex items-center justify-center rounded shadow-sm">
      <span style={{ position: "absolute", top: "2px", left: "2px", fontSize: "10px", color: "gray" }}>{coordinates}</span>
      {children}
    </div>
  );
};

export default DroppableCell;
