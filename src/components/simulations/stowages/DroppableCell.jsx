import { useDroppable } from "@dnd-kit/core";

const DroppableCell = ({ id, children, coordinates, isValid, isHistoryView, isDropTarget, isNewPage, isHighlighted = false, draggingItem = null }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled: isHistoryView,
  });

  const isEmptyCell = !children;
  const isEmptyCellWithDragOver = isEmptyCell && isOver && draggingItem !== null;

  return (
    <div
      ref={setNodeRef}
      className={`
        relative
        w-full aspect-square h-[50px]
        rounded-md
        border
        flex items-center justify-center
        ${!isHistoryView ? "transition-colors duration-200" : ""}
        ${
          isEmptyCellWithDragOver && isValid
            ? "border-blue-500 bg-blue-100 ring-1 ring-blue-300"
            : !isHistoryView && isOver
            ? "border-blue-400 bg-blue-50"
            : isDropTarget
            ? "border-yellow-400 bg-yellow-50"
            : isHighlighted
            ? "border-orange-400 bg-yellow-400"
            : "border-gray-200"
        }
        ${isValid ? (isEmptyCellWithDragOver ? "" : "bg-white") : "bg-red-50"}
      `}
    >
      <span className="absolute top-0.5 left-0.5 text-[6px] text-gray-400 font-mono">{coordinates}</span>
      {children}

      {/* Hanya tampilkan "DROP HERE" untuk drop targets yang sudah ditentukan */}
      {(isNewPage || isDropTarget) && !children && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-yellow-600 animate-bounce flex flex-col items-center">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-[7px] font-bold">DROP HERE</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DroppableCell;
