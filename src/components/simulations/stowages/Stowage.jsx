import { DndContext, DragOverlay } from "@dnd-kit/core";
import ShipBay from "./ShipBay";
import ShipDock from "./ShipDock";
import SalesCallCard from "./SalesCallCard";
import DraggableContainer from "./DraggableContainer";
import PortLegendSimulation from "./PortLegendSimulation";
import BayStatisticsTable from "./BayStatisticsTable";

const Stowage = ({
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
  bayMoves = {},
  bayPairs = [],
  totalMoves = 0,
  idealCraneSplit = 2,
  longCraneMoves = 0,
  extraMovesOnLongCrane = 0,
  selectedHistoricalWeek,
  setSelectedHistoricalWeek,
  historicalStats,
  showHistorical,
  setShowHistorical,
  onRefreshCards,
}) => {
  const draggingTargetContainer = targetContainers.some((target) => target.id === draggingItem);

  return (
    <>
      <PortLegendSimulation currentRound={currentRound} totalRounds={totalRounds} />

      {/* Section Header */}
      <div className="flex justify-between items-center mb-4 mt-4 bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">
            Section {section}: {section === 1 ? "Unload Port Containers" : "Handle Sales Calls"}
            {currentRound > totalRounds && section === 1 && <span className="ml-2 text-sm text-red-600 font-medium">(Final Unloading Phase)</span>}
          </h2>
        </div>
        {section === 1 && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">Remaining containers to unload: {targetContainers && targetContainers.length}</div>
            <button
              onClick={onNextSection}
              disabled={currentRound > totalRounds}
              className={`px-4 py-2 rounded-lg transition-colors ${currentRound > totalRounds ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
              {currentRound > totalRounds ? "Final Unloading Phase" : "Proceed to Section 2"}
            </button>
          </div>
        )}
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-6">
          {/* Ship Bay Section - Full Width */}
          <div className="w-full bg-white rounded-xl shadow-xl p-6 border border-gray-200">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
              <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Ship Bay
              {section === 1 && targetContainers.length > 0 && <span className="ml-4 text-sm text-yellow-600 font-semibold animate-pulse">{targetContainers.length} containers need unloading</span>}
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <ShipBay bayCount={bayCount} baySize={baySize} bayTypes={bayTypes} droppedItems={droppedItems} draggingItem={draggingItem} containers={containers} targetContainers={targetContainers} currentPort={port} />
            </div>
          </div>

          {/* Two Column Layout: Ship Dock (Left) and Right Side Content (Bay Stats + Sales Calls) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ship Dock Section - Left Column */}
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200 overflow-hidden">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                Ship Dock
                {section === 1 && targetContainers.length > 0 && draggingTargetContainer && <span className="ml-4 text-sm text-yellow-600 font-semibold">Drop container here</span>}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto">
                <ShipDock dockSize={dockSize} allItems={droppedItems} draggingItem={draggingItem} containers={containers} section={section} draggingTargetContainer={draggingTargetContainer} />
              </div>
            </div>

            {/* Right Column - Split into Two Sections */}
            <div className="flex flex-col gap-6">
              {/* Top Right - Bay Statistics */}
              <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                  <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Bay Statistics
                </h3>
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 overflow-x-auto max-h-[300px]">
                  <BayStatisticsTable
                    bayCount={bayCount}
                    bayMoves={bayMoves}
                    bayPairs={bayPairs}
                    totalMoves={totalMoves}
                    idealCraneSplit={idealCraneSplit}
                    longCraneMoves={longCraneMoves}
                    extraMovesOnLongCrane={extraMovesOnLongCrane}
                    currentRound={currentRound}
                    selectedWeek={selectedHistoricalWeek}
                    setSelectedWeek={setSelectedHistoricalWeek}
                    historicalStats={historicalStats}
                    showHistorical={showHistorical}
                    setShowHistorical={setShowHistorical}
                    onRefreshCards={onRefreshCards}
                  />
                </div>
              </div>

              {/* Sales Call section - bottom right */}
              {section === 2 ? (
                <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
                      <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      Sales Calls
                    </h3>
                    {/* <button onClick={onRefreshCards} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh Sales Cards
                    </button> */}
                  </div>
                  {isLimitExceeded ? (
                    <div className="text-center p-8 bg-gray-50 rounded-lg">
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
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 mb-4">No sales call cards available</p>
                      <button onClick={onRefreshCards} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Sales Cards
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Keep the existing code for section 1
                <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                    <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Sales Calls
                  </h3>
                  <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-2">Complete unloading port containers first</p>
                    <p className="text-sm text-gray-500">Sales calls will be available in Section 2</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DragOverlay>
          {draggingItem && (
            <div className="rounded-lg" style={{ width: "100px", height: "60px" }}>
              <DraggableContainer
                id={draggingItem}
                text={draggingItem}
                style={{
                  zIndex: 9999,
                  transform: "scale(1.05)",
                  opacity: 0.9,
                }}
                type={containers.find((c) => c.id === draggingItem)?.type?.toLowerCase() || "dry"}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default Stowage;
