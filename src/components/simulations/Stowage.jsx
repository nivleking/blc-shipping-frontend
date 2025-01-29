import { DndContext, DragOverlay } from "@dnd-kit/core";
import ShipBay from "./ShipBay";
import ShipDock from "./ShipDock";
import SalesCallCard from "./SalesCallCard";
import DraggableContainer from "./DraggableContainer";
import PortLegend from "../cards/PortLegend";

const Stowage = ({ bayCount, baySize, droppedItems, draggingItem, dockSize, paginatedItems, salesCallCards, currentCardIndex, containers, formatIDR, handleAcceptCard, handleRejectCard, handleDragStart, handleDragEnd }) => {
  return (
    <>
      <PortLegend />
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-6">
          {/* Ship Bay Section - Full Width */}
          <div className="w-full bg-white rounded-xl shadow-xl p-6 border border-gray-200">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
              <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Ship Bay
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <ShipBay bayCount={bayCount} baySize={baySize} droppedItems={droppedItems} draggingItem={draggingItem} />
            </div>
          </div>

          {/* Bottom Grid - Ship Dock and Sales Call Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ship Dock Section */}
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                Ship Dock
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <ShipDock dockSize={dockSize} paginatedItems={paginatedItems} draggingItem={draggingItem} />
              </div>
            </div>

            {/* Sales Call Cards Section */}
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Sales Calls
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <SalesCallCard salesCallCards={salesCallCards} currentCardIndex={currentCardIndex} containers={containers} formatIDR={formatIDR} handleAcceptCard={handleAcceptCard} handleRejectCard={handleRejectCard} />
              </div>
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
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default Stowage;
