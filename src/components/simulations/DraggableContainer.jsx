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
    backgroundColor: color,
    color: color === "yellow" ? "black" : "white",
    width: "100px",
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
            backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 2px, transparent 2px, transparent 8px)",
          }}
        />
      </div>
    </div>
  );
};

export default DraggableContainer;
