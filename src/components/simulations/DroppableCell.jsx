// src/components/simulations/DroppableCell.jsx
import { useDroppable } from "@dnd-kit/core";

const DroppableCell = ({ id, children, coordinates }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative
        w-full h-[100px]
        rounded-lg
        border-2
        flex items-center justify-center
        transition-colors duration-200
        ${isOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"}
      `}
    >
      {/* Coordinate Label */}
      <span className="absolute top-1 left-1 text-[10px] text-gray-400 font-mono">{coordinates}</span>

      {children}
    </div>
  );
};

export default DroppableCell;
