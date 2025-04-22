import { useDroppable } from "@dnd-kit/core";

const DroppableCell = ({
  id,
  children,
  coordinates,
  isValid,
  isHistoryView,
  isDropTarget,
  isNewPage,
  isHighlighted = false, //
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled: isHistoryView,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative
        w-full aspect-square sm:h-[80px] md:h-[90px] lg:h-[100px]
        rounded-lg
        border-2
        flex items-center justify-center
        ${!isHistoryView ? "transition-colors duration-200" : ""}
        ${!isHistoryView && isOver ? "border-blue-400 bg-blue-50" : isDropTarget ? "border-yellow-400 bg-yellow-50" : isHighlighted ? "border-orange-400 bg-yellow-400" : "border-gray-200"}
        ${isValid ? "bg-white" : "bg-red-50"}
      `}
    >
      <span className="absolute top-1 left-1 text-[8px] sm:text-[10px] text-gray-400 font-mono">{coordinates}</span>
      {children}

      {(isNewPage || isDropTarget) && !children && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-yellow-600 animate-bounce flex flex-col items-center">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-[10px] sm:text-xs font-bold">DROP HERE</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DroppableCell;
