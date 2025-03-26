import { useState, useEffect } from "react";
import ContainerDock from "./ContainerDock";
import DroppableCell from "./DroppableCell";
import DraggableContainer from "./DraggableContainer";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BiErrorCircle } from "react-icons/bi";
import Tooltip from "../Tooltip";

const ShipDock = ({ dockSize, allItems, draggingItem, containers, section, draggingTargetContainer }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 36; // 6x6 grid (sesuaikan dengan row*column)

  // Count dock items
  const dockItems = allItems.filter((item) => item.area && item.area.startsWith("docks-"));

  // Calculate total pages based on actual containers, not fixed grid size
  const totalPages = Math.max(1, Math.ceil(dockItems.length / itemsPerPage));

  // Get visible items for current page
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
    if (currentPage > 0 && !hasContainersOnPage && dockItems.length > 0) {
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
  }, [allItems, currentPage, totalPages, hasContainersOnPage, dockItems.length]);

  // Visible dimensions always 6x6
  const visibleSize = {
    rows: 6,
    columns: 6,
  };

  // Calculate current page capacity stats (for UI feedback only)
  const currentPageItems = visibleItems.length;
  const currentPageCapacity = itemsPerPage;
  const currentPagePercentage = (currentPageItems / currentPageCapacity) * 100;

  // Define thresholds for current page only
  const isCurrentPageNearCapacity = currentPagePercentage >= 70;
  const isCurrentPageFull = currentPagePercentage >= 90;

  // Total stats for informational purposes
  const totalContainers = dockItems.length;
  const visibleGridCapacity = visibleSize.rows * visibleSize.columns;

  return (
    <div className="flex flex-col w-full">
      {/* Summary information */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">Ship Dock</h3>
          <Tooltip>Containers waiting to be loaded onto the ship bays. You can drag containers from here to the ship bays.</Tooltip>
        </div>

        <div className="text-sm text-gray-600">
          Total containers: {totalContainers}
          {totalPages > 1 && ` (showing ${currentPageItems} on page ${currentPage + 1} of ${totalPages})`}
        </div>
      </div>

      {/* Current page capacity indicator */}
      {/* <div className={`mb-4 ${isCurrentPageFull ? "animate-pulse" : ""}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Current Page Capacity</span>
          <span className={`text-sm font-medium ${isCurrentPageFull ? "text-red-600" : isCurrentPageNearCapacity ? "text-amber-500" : "text-green-600"}`}>
            {currentPageItems} / {currentPageCapacity} slots
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${isCurrentPageFull ? "bg-red-600" : isCurrentPageNearCapacity ? "bg-amber-500" : "bg-green-500"}`}
            style={{ width: `${Math.min(100, currentPagePercentage)}%` }}
          ></div>
        </div>

        {isCurrentPageFull && (
          <div className="mt-2 flex items-center p-2 rounded-lg bg-blue-50 border border-blue-200">
            <BiErrorCircle className="mr-2 text-lg text-blue-500" />
            <p className="text-sm text-blue-700">Current page is full. Use pagination controls to navigate to the next page for more space.</p>
          </div>
        )}
      </div> */}

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

      {/* Container Grid */}
      <div className={`relative ${!hasContainersOnPage && totalContainers > 0 ? "min-h-[300px] flex items-center justify-center" : ""}`}>
        <div className={`rounded-xl overflow-hidden transition-all duration-300 ${isCurrentPageFull ? "ring-4 ring-blue-400 shadow-lg shadow-blue-200" : isCurrentPageNearCapacity ? "ring-4 ring-amber-400 shadow-lg shadow-amber-200" : ""}`}>
          <ContainerDock id="docks" rows={visibleSize.rows} columns={visibleSize.columns} capacityStatus={isCurrentPageFull ? "critical" : isCurrentPageNearCapacity ? "warning" : "normal"}>
            {Array.from({ length: itemsPerPage }).map((_, index) => {
              const cellIndex = currentPage * itemsPerPage + index;
              const cellId = `docks-${cellIndex}`;
              const rowIndex = Math.floor(index / visibleSize.columns);
              const colIndex = index % visibleSize.columns;
              const coordinates = `${rowIndex}${colIndex}`;

              const item = allItems.find((item) => item.area === cellId);
              const isDropTarget = section === 1 && draggingTargetContainer && !item;

              return (
                <DroppableCell
                  key={cellId}
                  id={cellId}
                  coordinates={coordinates}
                  isValid={true} // Always allow dropping - we're not limited by grid size anymore
                  isDropTarget={isDropTarget}
                >
                  {item && <DraggableContainer id={item.id} text={item.id} isDragging={draggingItem === item.id} color={item.color} type={containers.find((c) => c.id === item.id)?.type?.toLowerCase() || "dry"} />}
                </DroppableCell>
              );
            })}
          </ContainerDock>
        </div>

        {/* Empty state message */}
        {!hasContainersOnPage && totalContainers > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <div className="text-center p-6">
              <BiErrorCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No containers on this page</h3>
              <p className="mt-1 text-sm text-gray-500">Try navigating to another page to see your containers.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination explanation if needed */}
      {totalPages > 1 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Storage capacity is unlimited.</span> You're viewing page {currentPage + 1} of {totalPages}. Use the pagination controls to navigate between pages of containers.
          </p>
        </div>
      )}
    </div>
  );
};

export default ShipDock;
