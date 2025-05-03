import React, { useState, useEffect, useContext } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import ShipBay from "./ShipBay";
import ShipDock from "./ShipDock";
import SalesCallCard from "./SalesCallCard";
import DraggableContainer from "./DraggableContainer";
import PortLegendSimulation from "./PortLegendSimulation";
import BayStatisticsTable from "./BayStatisticsTable";
import RestowageAlert from "./RestowageAlert";
import PortOrderAlert from "./PortOrderAlert";
import ContainerLegend from "./ContainerLegend";
import FinancialSummaryModal from "./FinancialSummaryModal";
import { FiLifeBuoy } from "react-icons/fi";
import GuideModal from "../../../pages/Admin/GuideModal";
import "./Stowage.css";
import LoadingSpinner from "../LoadingSpinner";

const Stowage = ({
  revenue,
  bayCount,
  baySize,
  bayTypes,
  droppedItems,
  draggingItem,
  dockSize,
  salesCallCards,
  currentCardIndex,
  containers,
  formatIDR,
  handleAcceptCard,
  handleRejectCard,
  handleDragStart,
  handleDragEnd,
  section,
  onNextSection,
  targetContainers,
  isProcessingCard,
  isLimitExceeded,
  isCardVisible,
  currentRound,
  totalRounds,
  processedCards,
  mustProcessCards,
  cardsLimit,
  port,
  restowageContainers = [],
  restowagePenalty = 0,
  restowageMoves = 0,
  bayMoves = {},
  bayPairs = [],
  totalMoves = 0,
  selectedHistoricalWeek,
  setSelectedHistoricalWeek,
  historicalStats,
  showHistorical,
  setShowHistorical,
  onRefreshCards,
  dockWarehouseContainers = [],
  containerDestinationsCache,
  unfulfilledContainers = [],
  hoveredCardId,
  onContainerHover,
  toggleFinancialModal,
  isBayFull,
  // idealCraneSplit = 2,
  // longCraneMoves = 0,
  // extraMovesOnLongCrane = 0,
}) => {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const draggingTargetContainer = targetContainers.some((target) => target.id === draggingItem);
  const [isSectionTransitioning, setIsSectionTransitioning] = useState(false);

  const handleFinancialButtonClick = () => {
    toggleFinancialModal();
  };

  const handleGuideButtonClick = () => {
    setShowGuideModal(true);
  };

  // Wrap the onNextSection with our own function to show loading state
  const handleNextSection = () => {
    if (targetContainers.length > 0 || currentRound > totalRounds) {
      return; // Button should be disabled in this case anyway
    }

    setIsSectionTransitioning(true); // Show loading spinner

    onNextSection().finally(() => {
      // Hide spinner when done (whether successful or not)
      setTimeout(() => {
        setIsSectionTransitioning(false);
      }, 2000); // Small delay to prevent flashing if the operation is very fast
    });
  };

  // console.log(containerDestinationsCache);
  return (
    <>
      {/* <PortLegendSimulation /> */}

      {/* Add loading overlay when transitioning */}
      {isSectionTransitioning && <LoadingSpinner />}

      {/* Section Header */}
      <div className="flex justify-between items-center mb-1 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-1">
          <h2 className="text-xs font-semibold text-gray-800 flex items-center gap-2">
            <span>Section {section === 1 ? "Discharge" : "Sales Calls"}</span>
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              Week {currentRound} of {totalRounds}
            </span>
            {currentRound > totalRounds && section === 1 && <span className="ml-2 text-xs text-red-600 font-medium">(Final Discharge Phase)</span>}
          </h2>
        </div>
        {section === 1 && (
          <div className="flex items-center gap-2">
            <div className="text-xs text-red-600 font-medium">
              Remaining {port} containers to discharge: {targetContainers && targetContainers.length}
            </div>
            <button
              onClick={handleNextSection}
              disabled={targetContainers.length > 0 || currentRound > totalRounds || isSectionTransitioning}
              className={`text-xs font-bold px-3 py-1.5 transition-all duration-300 ${
                targetContainers.length === 0 && currentRound <= totalRounds ? "relative shadow-md hover:scale-105 border-animated-button" : "bg-gray-300 text-gray-600 cursor-not-allowed rounded-lg"
              }`}
            >
              {currentRound > totalRounds ? (
                "Final Discharge Phase"
              ) : targetContainers.length > 0 ? (
                `Discharge ${targetContainers.length} ${port} Container${targetContainers.length !== 1 ? "s" : ""} First`
              ) : (
                <span className="rainbow-text">Proceed to Sales Calls</span>
              )}
            </button>
          </div>
        )}
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-2">
          <div className="w-full bg-white rounded-xl shadow-lg p-2 border border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <svg className="w-3.5 h-3.5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                <h3 className="text-xs font-semibold text-gray-800">Ship Bay</h3>

                {section === 1 && targetContainers.length > 0 && (
                  // <span className="ml-2 text-xs text-yellow-600 font-medium">
                  <span className="ml-2 text-[10px] text-red-600 font-medium rounded-full bg-red-50 px-2 py-1">
                    {targetContainers.length} {port} containers need discharging!
                  </span>
                )}
              </div>

              <button onClick={handleFinancialButtonClick} className="inline-flex items-center px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded shadow-sm transition-colors">
                <svg className="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.5v1A1.5 1.5 0 0114 6.5H7A1.5 1.5 0 015.5 5V4H4z" clipRule="evenodd" />
                </svg>
                Review Current State
              </button>

              <button onClick={handleGuideButtonClick} className="flex items-center bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
                <FiLifeBuoy className="mr-1" />
                Ship Bay Guide
              </button>
            </div>

            {/* Alert container - flex row to place alerts side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-1">
              <PortOrderAlert currentPort={port} />
              <RestowageAlert
                restowageContainers={restowageContainers}
                restowagePenalty={restowagePenalty}
                restowageMoves={restowageMoves}
                formatIDR={formatIDR} //
              />
            </div>

            {/* <ContainerLegend /> */}

            <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
              <ShipBay
                bayCount={bayCount}
                baySize={baySize}
                bayTypes={bayTypes}
                droppedItems={droppedItems}
                draggingItem={draggingItem}
                containers={containers}
                targetContainers={targetContainers}
                currentPort={port}
                restowageContainers={restowageContainers}
                containerDestinationsCache={containerDestinationsCache}
                hoveredCardId={hoveredCardId}
                onContainerHover={onContainerHover}
              />
            </div>
          </div>

          {/* Three Column Layout: Sales Calls (Left) + Ship Dock (Middle) + Bay Stats (Right) */}
          <div className="grid md:grid-cols-10 gap-2">
            {/* Sales Call Section - Left Column (3/10) */}
            <div className="md:col-span-4 bg-white rounded-lg shadow-md p-2 border border-gray-200 overflow-hidden">
              <h3 className="text-xs font-semibold mb-2 text-gray-800 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Sales Calls
              </h3>

              <div>
                <PortLegendSimulation compact={true} port={port} />
              </div>

              {/* Sales Calls content */}
              {section === 2 ? (
                <div className="overflow-y-auto" style={{ maxHeight: "450px" }}>
                  {isLimitExceeded ? (
                    <div className="text-[9px] text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">You have reached the maximum number of cards for this round.</p>
                    </div>
                  ) : salesCallCards.length > 0 ? (
                    <div className={`transition-opacity duration-300 ${isCardVisible ? "opacity-100" : "opacity-0"}`}>
                      <SalesCallCard
                        salesCallCards={salesCallCards}
                        currentCardIndex={currentCardIndex}
                        containers={containers}
                        formatIDR={formatIDR}
                        handleAcceptCard={handleAcceptCard}
                        handleRejectCard={handleRejectCard}
                        isProcessingCard={isProcessingCard}
                        processedCards={processedCards}
                        mustProcessCards={mustProcessCards}
                        cardsLimit={cardsLimit}
                        onRefreshCards={onRefreshCards}
                        port={port}
                        unfulfilledContainers={unfulfilledContainers}
                        isBayFull={isBayFull}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 mb-2">No sales call cards available</p>
                      <button onClick={onRefreshCards} className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center text-xs">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Sales Cards
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[8px] flex flex-col items-center justify-center p-4 bg-gray-50 rounded-md">
                  <p className=" text-gray-600 mb-2">Complete discharging port containers first</p>
                  <p className=" text-gray-500">Sales calls will be available in Section Sales Calls</p>
                </div>
              )}
            </div>

            {/* Right Column (7/10) - Contains Ship Dock and Bay Stats stacked vertically */}
            <div className="md:col-span-6 flex flex-col gap-2">
              {/* Ship Dock Section - Full width of right column */}
              <div className="bg-white rounded-lg shadow-md p-2 border border-gray-200 overflow-hidden">
                <h3 className="text-xs space-x-2 font-semibold text-gray-800 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                  </svg>
                  Ship Dock
                  {section === 1 && targetContainers.length > 0 && draggingTargetContainer && <span className="ml-2 text-xs text-yellow-600 font-semibold">Drop container here</span>}
                </h3>
                {section === 1 && (
                  <div className="text-[10px] text-red-600 font-medium">
                    Remaining {port} containers to discharge: {targetContainers && targetContainers.length}
                  </div>
                )}

                <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 mt-2" style={{ maxHeight: "350px" }}>
                  <ShipDock
                    dockSize={dockSize}
                    allItems={droppedItems}
                    draggingItem={draggingItem}
                    containers={containers}
                    section={section}
                    dockWarehouseContainers={dockWarehouseContainers}
                    draggingTargetContainer={draggingTargetContainer}
                    containerDestinationsCache={containerDestinationsCache}
                    onContainerHover={onContainerHover}
                    hoveredCardId={hoveredCardId}
                    unfulfilledContainers={unfulfilledContainers}
                  />
                </div>
              </div>

              {/* Bay Statistics - Below Ship Dock */}
              <div className="bg-white rounded-lg shadow-md p-2 border border-gray-200">
                <h3 className="text-xs font-semibold mb-2 text-gray-800 flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Bay Stats
                </h3>

                <div className="bg-gray-50 p-1 rounded-lg border border-gray-200 overflow-auto text-xs" style={{ maxHeight: "200px" }}>
                  <BayStatisticsTable
                    bayCount={bayCount}
                    bayMoves={bayMoves}
                    bayPairs={bayPairs}
                    totalMoves={totalMoves}
                    currentRound={currentRound}
                    selectedWeek={selectedHistoricalWeek}
                    setSelectedWeek={setSelectedHistoricalWeek}
                    historicalStats={historicalStats}
                    showHistorical={showHistorical}
                    setShowHistorical={setShowHistorical}
                    onRefreshCards={onRefreshCards}
                    restowageMoves={restowageMoves}
                    restowagePenalty={restowagePenalty}
                    restowageContainerCount={restowageContainers.length}
                    formatIDR={formatIDR}
                  />
                </div>
              </div>
            </div>
          </div>

          {showGuideModal && <GuideModal onClose={() => setShowGuideModal(false)} isSimulationMode={true} />}
        </div>

        <DragOverlay>
          {draggingItem && (
            <div className="rounded-lg" style={{ width: "60px", height: "60px" }}>
              <DraggableContainer
                id={draggingItem}
                text={draggingItem}
                style={{
                  zIndex: 9999,
                  transform: "scale(1.05)",
                  // opacity: 0.9,
                }}
                type={containers.find((c) => c.id === draggingItem)?.type?.toLowerCase() || "dry"}
                destination={containerDestinationsCache[draggingItem] || ""}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default Stowage;
