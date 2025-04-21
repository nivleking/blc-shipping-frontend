import { useState, useEffect, useMemo } from "react";
import ContainerDock from "./ContainerDock";
import DroppableCell from "./DroppableCell";
import DraggableContainer from "./DraggableContainer";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BiErrorCircle } from "react-icons/bi";
import Tooltip from "../../Tooltip";

const ShipDock = ({
  dockSize,
  allItems,
  draggingItem,
  containers,
  section,
  dockWarehouseContainers = [],
  draggingTargetContainer,
  containerDestinationsCache,
  hoveredCardId,
  onContainerHover,
  unfulfilledContainers = {}, //
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [temporaryNextPage, setTemporaryNextPage] = useState(null);
  const itemsPerPage = dockSize.rows * dockSize.columns;

  // Count dock items
  const dockItems = allItems.filter((item) => item.area && item.area.startsWith("docks-"));

  // Calculate pages based on container positions, not just count
  const containerPositions = useMemo(() => {
    return dockItems.map((item) => {
      const positionMatch = item.area.match(/docks-(\d+)/);
      return positionMatch ? parseInt(positionMatch[1]) : 0;
    });
  }, [dockItems]);

  // Get the highest position to determine the max page needed
  const maxPosition = Math.max(...containerPositions, 0);
  const maxPage = Math.max(Math.floor(maxPosition / itemsPerPage), 0);

  // Calculate total pages needed based on the maximum position
  const totalPages = Math.max(1, maxPage + 1);

  // Check if we have containers on pages beyond page 0
  const hasContainersOnLaterPages = containerPositions.some((pos) => pos >= itemsPerPage);

  // Calculate container counts per page
  const containersByPage = useMemo(() => {
    const pages = {};

    dockItems.forEach((item) => {
      const positionMatch = item.area.match(/docks-(\d+)/);
      if (positionMatch) {
        const position = parseInt(positionMatch[1]);
        const pageNum = Math.floor(position / itemsPerPage);
        pages[pageNum] = (pages[pageNum] || 0) + 1;
      }
    });

    return pages;
  }, [dockItems, itemsPerPage]);

  const displayPage = temporaryNextPage !== null ? temporaryNextPage : currentPage;

  // Get visible items for current page
  const getVisibleItems = () => {
    const startIndex = displayPage * itemsPerPage;
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
  const hasContainersOnPage = visibleItems.length > 0 || temporaryNextPage !== null;

  const visibleSize = {
    rows: 8,
    columns: 6,
  };

  // Calculate current page capacity stats (for UI feedback only)
  const currentPageItems = visibleItems.length;
  const currentPageCapacity = itemsPerPage;
  const currentPagePercentage = (currentPageItems / currentPageCapacity) * 100;

  // Define thresholds for current page only
  const isCurrentPageNearCapacity = currentPagePercentage >= 70;
  const isCurrentPageFull = currentPagePercentage >= 100;

  // Total stats for informational purposes
  const totalContainers = dockItems.length;
  const visibleGridCapacity = visibleSize.rows * visibleSize.columns;

  // Auto-navigate to first page with containers if current page is empty
  useEffect(() => {
    if (currentPage > 0 && !hasContainersOnPage && dockItems.length > 0) {
      // Find first page with containers
      const pagesWithContainers = Object.keys(containersByPage)
        .map(Number)
        .sort((a, b) => a - b);
      if (pagesWithContainers.length > 0) {
        setCurrentPage(pagesWithContainers[0]);
      } else {
        setCurrentPage(0);
      }
    }
  }, [allItems, currentPage, hasContainersOnPage, dockItems.length, containersByPage]);

  useEffect(() => {
    // If dragging from ship bay (draggingItem exists but not in docks)
    const isDraggingFromBay = draggingItem && !dockItems.some((item) => item.id === draggingItem) && containers.some((c) => c.id === draggingItem);

    // Auto-create next page when current is full and dragging from bay
    if (isDraggingFromBay && isCurrentPageFull) {
      setTemporaryNextPage(currentPage + 1);
    } else if (!draggingItem) {
      // Reset temporary page when drag ends
      setTemporaryNextPage(null);
    }
  }, [draggingItem, isCurrentPageFull, dockItems, currentPage, containers]);

  // Determine if we should show pagination controls
  // Show if we have multiple pages OR if we have containers on later pages
  const showPaginationControls = totalPages > 1 || hasContainersOnLaterPages;

  const getDockWarehouseInfo = (containerId) => {
    if (!dockWarehouseContainers || !dockWarehouseContainers.length) return null;

    return dockWarehouseContainers.find((container) => container.container_id === containerId);
  };

  const shouldHighlightContainer = (containerId) => {
    if (!hoveredCardId) return false;

    const container = containers.find((c) => c.id.toString() === containerId.toString());
    return container && container.card_id === hoveredCardId;
  };

  // Function to get card group for visual feedback
  const getContainerCardGroup = (containerId) => {
    const container = containers.find((c) => c.id.toString() === containerId.toString());
    return container && container.card_id ? container.card_id : null;
  };

  const shouldHighlightCell = (cellId) => {
    if (!hoveredCardId) return false;

    const containerInCell = allItems.find((item) => item.area === cellId);
    if (!containerInCell) return false;

    const container = containers.find((c) => c.id.toString() === containerInCell.id.toString());
    return container && container.card_id === hoveredCardId;
  };

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
          {showPaginationControls && ` (showing ${currentPageItems} on page ${currentPage + 1} of ${totalPages})`}
        </div>
      </div>

      {/* Pagination UI - Always show when we have containers beyond page 0 */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-500">
          <span className="font-medium">
            Page {displayPage + 1} of {totalPages}
            {temporaryNextPage !== null && <span className="ml-2 text-blue-600">(New page)</span>}
          </span>
          <span className="ml-2 text-gray-400">({hasContainersOnPage ? `${visibleItems.length} containers` : `No containers`})</span>
        </div>

        {showPaginationControls && (
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

                // Highlight pages that have containers
                const hasContainers = containersByPage[pageNum] > 0;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center
                      ${currentPage === pageNum ? "bg-blue-600 text-white font-medium" : "hover:bg-gray-100"}
                      ${hasContainers && currentPage !== pageNum ? "border-2 border-green-400" : ""}`}
                  >
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
          <ContainerDock id="docks" rows={visibleSize.rows} columns={visibleSize.columns} capacityStatus={temporaryNextPage !== null ? "new" : isCurrentPageFull ? "critical" : isCurrentPageNearCapacity ? "warning" : "normal"}>
            {Array.from({ length: itemsPerPage }).map((_, index) => {
              const cellIndex = displayPage * itemsPerPage + index;
              const cellId = `docks-${cellIndex}`;
              const rowIndex = Math.floor(index / visibleSize.columns);
              const colIndex = index % visibleSize.columns;
              const coordinates = `${rowIndex}${colIndex}`;

              const isHighlighted = shouldHighlightCell(cellId);
              const item = allItems.find((item) => item.area === cellId);
              const isDropTarget = section === 1 && draggingTargetContainer && !item;
              const isTemporaryNewCell = temporaryNextPage !== null && displayPage !== currentPage;

              const dockWarehouseInfo = item ? getDockWarehouseInfo(item.id) : null;
              const isDockWarehouse = !!dockWarehouseInfo;

              return (
                <DroppableCell
                  key={cellId}
                  id={cellId}
                  coordinates={coordinates}
                  isValid={true}
                  isDropTarget={isDropTarget}
                  isNewPage={isTemporaryNewCell}
                  isHighlighted={isHighlighted} //
                >
                  {item && (
                    <DraggableContainer
                      id={item.id}
                      text={item.id}
                      isDragging={draggingItem === item.id}
                      color={item.color}
                      type={containers.find((c) => c.id === item.id)?.type?.toLowerCase() || "dry"}
                      isDockWarehouse={isDockWarehouse}
                      dockWarehouseWeeks={dockWarehouseInfo ? dockWarehouseInfo.weeks_pending : 0}
                      isRestowed={item.is_restowed}
                      tooltipContent={item.is_restowed ? "Container moved due to restowage issue" : ""}
                      destination={containerDestinationsCache[item.id]}
                      onHover={onContainerHover}
                      isHighlighted={shouldHighlightContainer(item.id)}
                      cardGroup={getContainerCardGroup(item.id)}
                      isUnfulfilled={unfulfilledContainers[item.id]}
                    />
                  )}
                </DroppableCell>
              );
            })}
          </ContainerDock>
        </div>
        {!hasContainersOnPage && totalContainers > 0 && temporaryNextPage === null && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <div className="text-center p-6">
              <BiErrorCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No containers on this page</h3>
              <p className="mt-1 text-sm text-gray-500">Try navigating to another page to see your containers.</p>
            </div>
          </div>
        )}
      </div>

      {/* Visual indicator of pages with containers */}
      {showPaginationControls && (
        <div className="flex justify-center mt-2 space-x-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={`page-indicator-${index}`}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full cursor-pointer transition-all
                ${currentPage === index ? "bg-blue-600 scale-125" : containersByPage[index] ? "bg-green-400" : "bg-gray-300"}`}
              title={`Page ${index + 1}${containersByPage[index] ? ` (${containersByPage[index]} containers)` : " (empty)"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShipDock;
