import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import "./DraggableContainer.css";

const DraggableContainer = ({ id, text, style, isDragging, color, type = "dry", isHistoryView, isTarget }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled: isHistoryView,
  });

  const defaultStyle = {
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 9999 : "auto",
    backgroundColor:
      color === "yellow"
        ? "#F59E0B"
        : color === "blue"
        ? "#3B82F6"
        : color === "green"
        ? "#22C55E"
        : color === "red"
        ? "#EF4444"
        : color === "purple"
        ? "#8B5CF6"
        : color === "pink"
        ? "#EC4899"
        : color === "orange"
        ? "#F97316"
        : color === "brown"
        ? "#92400E"
        : color === "cyan"
        ? "#06B6D4"
        : color === "teal"
        ? "#059669"
        : "#6B7280",
    color: color === "yellow" ? "black" : "white",
    width: "80px",
    height: "60px",
  };

  return (
    <div
      ref={setNodeRef}
      {...(isHistoryView ? {} : { ...listeners, ...attributes })}
      style={{ ...defaultStyle, ...style }}
      className={`
        flex flex-col items-center justify-center
        rounded-lg border-2 
        ${type.toLowerCase() === "reefer" ? "border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.3)]" : "border-gray-400"}
        ${!isHistoryView ? "cursor-move" : "cursor-default"}
        relative transition-all
        ${isDragging && !isHistoryView ? "scale-105 shadow-xl" : "shadow-md"}
        ${isTarget ? "ring-4 ring-yellow-400 pulse" : ""}
      `}
    >
      <div className="relative w-full h-full p-2">
        <span className="absolute top-1 left-1 text-xs font-medium text-white drop-shadow-md">#{text}</span>

        <div
          className={`
          absolute -top-3 -right-3 px-2 py-1 rounded-full text-[10px] font-bold
          ${type.toLowerCase() === "reefer" ? "bg-blue-500 text-white ring-2 ring-blue-200" : "bg-gray-600 text-white"}
        `}
        >
          {type}
        </div>

        {/* Add unload indicator for target containers */}
        {isTarget && <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-2 py-1 text-[9px] rounded-full font-bold whitespace-nowrap">UNLOAD</div>}

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
