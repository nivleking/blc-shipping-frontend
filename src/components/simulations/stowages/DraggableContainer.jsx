import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import "./DraggableContainer.css";
import { useState } from "react";

const DraggableContainer = ({ id, text, style, isDragging, color, type = "dry", isHistoryView, isTarget, isOptionalTarget, isDockWarehouse, dockWarehouseWeeks, isRestowageProblem, isBlocking, isRestowed, tooltipContent, destination }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled: isHistoryView,
  });

  const [showTooltip, setShowTooltip] = useState(false);

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
        : color === "black"
        ? "#000000"
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
    width: "100%", // Responsive width
    height: "100%", // Responsive height
    maxWidth: "80px", // Maximum width
    maxHeight: "60px", // Maximum height
  };

  const containerClasses = `
    flex flex-col items-center justify-center
    rounded-lg border-2
    ${type.toLowerCase() === "reefer" ? "border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.3)]" : "border-gray-400"}
    ${!isHistoryView ? "cursor-move" : "cursor-default"}
    relative transition-all
    ${isDragging && !isHistoryView ? "scale-105 shadow-xl" : "shadow-md"}
    ${isTarget ? "ring-4 ring-yellow-400" : ""}
    ${isOptionalTarget ? "ring-1 ring-green-400 border-dashed" : ""}
    ${isRestowageProblem && isBlocking ? "ring-2 ring-red-500" : ""}
    ${isRestowageProblem && !isBlocking ? "ring-2 ring-orange-400" : ""}
    ${isDockWarehouse ? "border-2 border-red-500" : ""}
    w-full h-full max-w-[80px] max-h-[60px] mx-auto
    ${isRestowed ? "border-2 border-red-500 border-dashed" : ""}
    w-full h-full max-w-[80px] max-h-[60px] mx-auto
  `;

  // console.log("Destination", destination);

  return (
    <div
      ref={setNodeRef}
      {...(isHistoryView ? {} : { ...listeners, ...attributes })}
      style={{ ...defaultStyle, ...style }}
      className={containerClasses}
      onMouseEnter={() => tooltipContent && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative w-full h-full p-2">
        <span className="absolute top-1 left-1 text-[10px] sm:text-xs font-medium text-white drop-shadow-md">#{text}</span>

        <div
          className={`
          absolute -top-3 -right-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[8px] font-bold
          ${type.toLowerCase() === "reefer" ? "bg-blue-500 text-white ring-1 sm:ring-2 ring-blue-200" : "bg-gray-600 text-white"}
        `}
        >
          {type.toUpperCase()}
        </div>

        {/* Destination Display with Restowage Display */}
        {destination && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <span className="text-xs font-bold bg-black bg-opacity-50 text-white px-2 py-0.5 rounded whitespace-nowrap">
              {destination}
              {isRestowed && <span className="ml-1 inline-flex items-center justify-center w-4 h-4 bg-red-900 text-white text-xs font-bold rounded-full shadow-sm">↓</span>}
            </span>
          </div>
        )}

        {/* Keep the FREE LOAD indicator but remove the centered arrow */}
        {isRestowed && <div className="absolute -bottom-0 right-0 left-0 bg-green-600 text-white px-1.5 py-0.5 text-[8px] rounded-full font-bold whitespace-nowrap">1x FREE LOAD</div>}

        {/* Add unload indicator for target containers */}
        {isTarget && <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[9px] rounded-full font-bold whitespace-nowrap">UNLOAD</div>}

        {/* Dock warehouse badge */}
        {isDockWarehouse && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-rose-950 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-[9px] rounded-full font-bold whitespace-nowrap">LATE {dockWarehouseWeeks}w</div>
        )}

        {/* Update tooltip to show restowed info */}
        {showTooltip && tooltipContent && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 z-50 w-max max-w-[180px]">
            {isRestowed ? `Restowed: ${tooltipContent}` : tooltipContent}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
          </div>
        )}

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
