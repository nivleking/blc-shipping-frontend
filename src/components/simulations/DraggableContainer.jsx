import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const DraggableContainer = ({ id, text, style, isDragging, color, type = "dry" }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const defaultStyle = {
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 9999 : "auto",
    // position: isDragging ? "fixed" : "relative",
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
        flex flex-col items-center justify-center
        rounded-lg border-2 
        ${type === "reefer" ? "border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.3)]" : "border-gray-400"}
        cursor-move relative transition-all
        ${isDragging ? "scale-105 shadow-xl" : "shadow-md hover:shadow-lg"}
      `}
    >
      <div className="relative w-full h-full p-2">
        {/* Container ID */}
        <span className="absolute top-1 left-1 text-xs font-medium text-white drop-shadow-md">#{text}</span>

        {/* Type Badge */}
        <div
          className={`
          absolute -top-3 -right-3 px-2 py-1 rounded-full text-[10px] font-bold
          ${type === "reefer" ? "bg-blue-500 text-white ring-2 ring-blue-200" : "bg-gray-600 text-white"}
        `}
        >
          {type}
        </div>

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          {type === "reefer" && (
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                linear-gradient(45deg, 
                  rgba(255,255,255,0.1) 25%, 
                  transparent 25%, 
                  transparent 50%, 
                  rgba(255,255,255,0.1) 50%, 
                  rgba(255,255,255,0.1) 75%, 
                  transparent 75%, 
                  transparent
                )`,
                backgroundSize: "10px 10px",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DraggableContainer;
