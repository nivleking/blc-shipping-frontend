import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import "./DraggableContainer.css";
import { useState } from "react";

const DraggableContainer = ({
  id,
  text,
  style,
  isDragging,
  color,
  type = "dry",
  isHistoryView,
  isTarget,
  isOptionalTarget,
  isDockWarehouse,
  dockWarehouseWeeks,
  isRestowageProblem,
  isBlocking,
  isRestowed,
  tooltipContent,
  destination, //
  onHover,
  isHighlighted = false,
  cardGroup = null,
  isUnfulfilled = false,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled: isHistoryView,
  });

  const [showTooltip, setShowTooltip] = useState(false);

  const defaultStyle = {
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 9999 : "auto",
    opacity: isDragging ? 0 : 1,
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
    width: "100%",
    height: "100%",
    maxWidth: "45px",
    maxHeight: "25px",
  };

  const containerClasses = `
    flex flex-col items-center justify-center
    rounded-md border-1
    ${type.toLowerCase() === "reefer" ? "border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.3)]" : "border-gray-400"}
    ${!isHistoryView ? "cursor-move" : "cursor-default"}
    relative transition-all
    ${isTarget ? "ring-2 ring-yellow-400" : ""}
    ${isOptionalTarget ? "ring-1 ring-green-400 border-dashed" : ""}
    ${isRestowageProblem && isBlocking ? "ring-1 ring-red-500" : ""}
    ${isRestowageProblem && !isBlocking ? "ring-1 ring-orange-400" : ""}
    ${isDockWarehouse ? "border border-red-500" : ""}
    ${isRestowed ? "border border-red-500 border-dashed" : ""}
    ${isHighlighted ? "ring-1 ring-red-500 scale-105 shadow-lg" : ""}
    ${isUnfulfilled ? "outline outline-1 outline-orange-400" : ""}
    w-full h-full max-w-[45px] max-h-[25px] mx-auto
  `;

  // Handle hover events
  const handleMouseEnter = () => {
    if (onHover) onHover(id, true);
    if (tooltipContent) setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    if (onHover) onHover(id, false);
    if (tooltipContent) setShowTooltip(false);
  };

  return (
    <div
      ref={setNodeRef}
      {...(isHistoryView ? {} : { ...listeners, ...attributes })}
      style={{ ...defaultStyle, ...style }}
      className={containerClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave} //
    >
      <div className="relative w-full h-full p-1.5">
        <span className="absolute top-0.5 left-0.5 text-[6px] font-medium text-white drop-shadow-md">#{text}</span>

        {/* Card group indicator - new */}
        {/* {cardGroup && <div className="absolute -top-3 -left-3 w-5 h-5 rounded-full bg-green-600 text-white text-[10px] flex items-center justify-center font-bold ring-1 ring-white">{cardGroup.toString().slice(-2)}</div>} */}

        <div
          className={`
          absolute -top-2.5 -right-1 px-1 py-0.5 rounded-full text-[6px] font-bold
          ${type.toLowerCase() === "reefer" ? "bg-blue-500 text-white ring-1 ring-blue-200" : "bg-gray-600 text-white"}
        `}
        >
          {type.toUpperCase()}
        </div>

        {/* Destination Display with Restowage Display */}
        {destination && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <span className="text-[6px] font-bold bg-black bg-opacity-50 text-white px-1 py-0.5 rounded whitespace-nowrap">
              {destination}
              {isRestowed && <span className="ml-0.5 inline-flex items-center justify-center w-2 h-2 bg-red-900 text-white text-[6px] font-bold rounded-full">↓</span>}
            </span>
          </div>
        )}

        {/* Keep the FREE LOAD indicator but remove the centered arrow */}
        {isRestowed && <div className="absolute -bottom-0 right-0 left-0 bg-green-600 text-white px-1 py-0.5 text-[7px] rounded-full font-bold whitespace-nowrap">1x FREE LOAD</div>}

        {/* Add discharge indicator for target containers */}
        {isTarget && <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-1 py-0.5 text-[5px] rounded-full font-bold whitespace-nowrap">DISCHARGE</div>}

        {/* Dock warehouse badge */}
        {isDockWarehouse && <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-rose-950 text-white px-1 py-0.5 text-[5px] rounded-full font-bold whitespace-nowrap">LATE {dockWarehouseWeeks}w</div>}

        {/* Update tooltip to show restowed info */}
        {/* {showTooltip && tooltipContent && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[9px] rounded py-0.5 px-1.5 z-50 w-max max-w-[120px]">
            {isRestowed ? `Restowed: ${tooltipContent}` : tooltipContent}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-gray-900"></div>
          </div>
        )} */}

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
                backgroundSize: "8px 8px",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DraggableContainer;
