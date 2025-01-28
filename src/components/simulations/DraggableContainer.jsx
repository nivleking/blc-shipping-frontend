import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const DraggableContainer = ({ id, text, style, isDragging, color }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const defaultStyle = {
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 1000 : "auto",
    position: isDragging ? "fixed" : "relative",
    backgroundColor:
      color === "yellow"
        ? "#F59E0B" // yellow-500
        : color === "blue"
        ? "#3B82F6" // blue-500
        : color === "green"
        ? "#22C55E" // green-500
        : color === "red"
        ? "#EF4444" // red-500
        : color === "purple"
        ? "#8B5CF6" // purple-500
        : color === "pink"
        ? "#EC4899" // pink-500
        : "#6B7280", // gray-500 default
    color: color === "yellow" ? "black" : "white",
    width: "80px",
    height: "60px",
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...defaultStyle, ...style }}
      {...listeners}
      {...attributes}
      className={`
        flex items-center justify-center
        text-white font-semibold
        rounded-lg border-2 border-white/20
        cursor-move
        ${isDragging ? "scale-105 shadow-xl opacity-90" : "shadow-md opacity-100 transition-all duration-200 hover:shadow-lg hover:brightness-110"}
      `}
    >
      <div className="relative w-full h-full p-2">
        <span className="absolute top-1 left-1 text-xs opacity-80">#{text}</span>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 0.5px, black 1px, black 1px)",
          }}
        />
      </div>
    </div>
  );
};

export default DraggableContainer;
