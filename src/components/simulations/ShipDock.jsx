import { useState, useEffect } from "react";
import ContainerDock from "./ContainerDock";
import DroppableCell from "./DroppableCell";
import DraggableContainer from "./DraggableContainer";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BiErrorCircle } from "react-icons/bi";

// Ganti paginatedItems dengan allItems dan sesuaikan itemsPerPage
const ShipDock = ({ dockSize, allItems, draggingItem, containers, section, draggingTargetContainer }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 36; // 6x6 grid (sesuaikan dengan row*column)

  const totalCells = dockSize.rows * dockSize.columns;
  const totalPages = Math.max(1, Math.ceil(totalCells / itemsPerPage));

  // Count dock items and calculate capacity
  const dockItems = allItems.filter((item) => item.area && item.area.startsWith("docks-"));
  const usedCapacity = dockItems.length;
  const maxCapacity = totalCells;
  const capacityPercentage = (usedCapacity / maxCapacity) * 100;

  // Define capacity thresholds
  const isNearCapacity = capacityPercentage >= 70;
  const isAtCapacity = capacityPercentage >= 90;
  const remainingCapacity = maxCapacity - usedCapacity;

  const getVisibleItems = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return allItems.filter((item) => {
      if (!item.area || !item.area.startsWith("docks-")) return false;

      // Extract the cell index more safely
      const cellIndexMatch = item.area.match(/docks-(\d+)/);
      if (!cellIndexMatch) return false;

      const cellIndex = parseInt(cellIndexMatch[1]);
      return cellIndex >= startIndex && cellIndex < endIndex;
    });
  };

  const visibleItems = getVisibleItems();
  const hasContainersOnPage = visibleItems.length > 0;

  // Auto-navigate to first page with containers if current page is empty
  useEffect(() => {
    if (currentPage > 0 && !hasContainersOnPage && allItems.length > 0) {
      // Find first page with containers
      for (let i = 0; i < totalPages; i++) {
        const testItems = allItems.filter((item) => {
          if (!item.area || !item.area.startsWith("docks-")) return false;
          const cellIndexMatch = item.area.match(/docks-(\d+)/);
          if (!cellIndexMatch) return false;
          const cellIndex = parseInt(cellIndexMatch[1]);
          return cellIndex >= i * itemsPerPage && cellIndex < (i + 1) * itemsPerPage;
        });

        if (testItems.length > 0) {
          setCurrentPage(i);
          break;
        }
      }
    }
  }, [allItems, currentPage, totalPages, hasContainersOnPage]);

  // Visible dimensions always 6x6
  const visibleSize = {
    rows: 6,
    columns: 6,
  };

  return (
    <div className="flex flex-col w-full">
      {/* Capacity Indicator */}
      <div className={`mb-4 ${isAtCapacity ? "animate-pulse" : ""}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Dock Capacity</span>
          <span className={`text-sm font-medium ${isAtCapacity ? "text-red-600" : isNearCapacity ? "text-amber-500" : "text-green-600"}`}>
            {usedCapacity} / {maxCapacity} containers
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full transition-all duration-500 ${isAtCapacity ? "bg-red-600" : isNearCapacity ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${Math.min(100, capacityPercentage)}%` }}></div>
        </div>

        {isNearCapacity && (
          <div className={`mt-2 flex items-center p-2 rounded-lg ${isAtCapacity ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
            <BiErrorCircle className={`mr-2 text-lg ${isAtCapacity ? "text-red-500" : "text-amber-500"}`} />
            <p className={`text-sm ${isAtCapacity ? "text-red-700" : "text-amber-700"}`}>
              {isAtCapacity ? `Warning: Only ${remainingCapacity} spots remaining! Containers beyond capacity may not be saved.` : "Dock is nearing capacity. Consider rearranging containers."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination UI */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-500">
          <span className="font-medium">
            Page {currentPage + 1} of {totalPages}
          </span>
          <span className="ml-2 text-gray-400">({hasContainersOnPage ? `${visibleItems.length} containers` : `No containers`})</span>
        </div>

        {totalPages > 1 && (
          <div className="flex space-x-2 items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${currentPage === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
            >
              <FiChevronLeft className="mr-1" /> Prev
            </button>

            <div className="hidden sm:flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 2) {
                  pageNum = i;
                } else if (currentPage > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-8 h-8 rounded-md ${currentPage === pageNum ? "bg-blue-600 text-white font-medium" : "hover:bg-gray-100"}`}>
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${currentPage === totalPages - 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
            >
              Next <FiChevronRight className="ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Container Grid dengan Border yang berubah warna ketika mendekati kapasitas */}
      <div className={`relative ${!hasContainersOnPage && totalCells > 0 ? "min-h-[300px] flex items-center justify-center" : ""}`}>
        <div className={`rounded-xl overflow-hidden transition-all duration-300 ${isAtCapacity ? "ring-4 ring-red-400 shadow-lg shadow-red-200" : isNearCapacity ? "ring-4 ring-amber-400 shadow-lg shadow-amber-200" : ""}`}>
          <ContainerDock id="docks" rows={visibleSize.rows} columns={visibleSize.columns} capacityStatus={isAtCapacity ? "critical" : isNearCapacity ? "warning" : "normal"}>
            {Array.from({ length: itemsPerPage }).map((_, index) => {
              const cellIndex = currentPage * itemsPerPage + index;
              const cellId = `docks-${cellIndex}`;
              const rowIndex = Math.floor(index / visibleSize.columns);
              const colIndex = index % visibleSize.columns;
              const coordinates = `${rowIndex}${colIndex}`;

              const item = allItems.find((item) => item.area === cellId);
              const isDropTarget = section === 1 && draggingTargetContainer && !item;

              return (
                <DroppableCell key={cellId} id={cellId} coordinates={coordinates} isValid={remainingCapacity > 0} isDropTarget={isDropTarget}>
                  {item && <DraggableContainer id={item.id} text={item.id} isDragging={draggingItem === item.id} color={item.color} type={containers.find((c) => c.id === item.id)?.type?.toLowerCase() || "dry"} />}
                </DroppableCell>
              );
            })}
          </ContainerDock>
        </div>
      </div>
    </div>
  );
};

export default ShipDock;
