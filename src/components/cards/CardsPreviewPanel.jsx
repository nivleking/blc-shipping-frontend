import { motion } from "framer-motion";
import PortLegend from "./PortLegend";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const CardsPreviewPanel = ({ currentCards, containers, formatIDR, filterType, setFilterType, filterOrigin, setFilterOrigin, getAllOrigins, indexOfFirstCard, indexOfLastCard, filteredCards, totalPages, currentPage, paginate }) => {
  return (
    <div className="col-span-4 bg-white shadow-md rounded-lg overflow-hidden text-sm">
      <PortLegend />
      {/* Update CardsPreview component filter section */}
      <div className="p-4 border-b sticky top-0 bg-white z-10 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Generated Cards</h2>
        </div>

        {/* Priority Filters */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-500">Priorities:</span>
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-1.5 text-xs rounded-full transition-colors
    ${filterType === "all" ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
          >
            All Priorities
          </button>
          <button
            onClick={() => setFilterType("committed")}
            className={`px-4 py-1.5 text-xs rounded-full transition-colors
    ${filterType === "committed" ? "bg-green-500 text-white" : "bg-green-100 hover:bg-green-200 text-green-700"}`}
          >
            Committed
          </button>
          <button
            onClick={() => setFilterType("non-committed")}
            className={`px-4 py-1.5 text-xs rounded-full transition-colors
    ${filterType === "non-committed" ? "bg-yellow-500 text-white" : "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"}`}
          >
            Non-Committed
          </button>
        </div>

        {/* Origin Filters */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-500">Origins:</span>
          <button
            onClick={() => setFilterOrigin("all")}
            className={`px-3 py-1 text-xs rounded-full transition-colors
    ${filterOrigin === "all" ? "bg-purple-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
          >
            All Ports
          </button>
          {getAllOrigins(currentCards).map((origin) => (
            <button
              key={origin}
              onClick={() => setFilterOrigin(origin)}
              className={`px-3 py-1 text-xs rounded-full transition-colors
      ${filterOrigin === origin ? "bg-purple-500 text-white" : "bg-purple-100 hover:bg-purple-200 text-purple-700"}`}
            >
              {origin}
            </button>
          ))}
        </div>
      </div>
      {/* Cards Grid */}
      <div className="p-4 grid grid-cols-3 grid-rows-2 gap-4 overflow-y-auto h-[calc(100vh-14rem)]">
        {currentCards.map((card, index) => (
          <motion.div
            key={card.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-lg border shadow hover:shadow-md transition-shadow
                      ${card.priority === "Committed" ? "border-l-4 border-green-500" : "border-l-4 border-yellow-500"}`}
          >
            {/* Card Content */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-base">
                  ({card.id}) {card.origin} → {card.destination}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm
                           ${card.priority === "Committed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  {card.priority}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type</span>
                  <p className="font-medium mt-1">{card.type}</p>
                </div>
                <div>
                  <span className="text-gray-500">Quantity</span>
                  <p className="font-medium mt-1">{card.quantity}</p>
                </div>
                <div>
                  <span className="text-gray-500">Revenue/Container</span>
                  <p className="font-medium mt-1">{formatIDR(card.revenue / card.quantity)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total Revenue</span>
                  <p className="font-medium mt-1">{formatIDR(card.revenue)}</p>
                </div>
              </div>

              {/* Container Preview */}
              <div className="mt-4">
                <h4 className="text-sm text-gray-500 mb-2">Containers</h4>
                <div className="grid grid-cols-5 gap-2">
                  {containers
                    .filter((c) => c.card_id === card.id)
                    .map((container) => (
                      <div key={container.id} className={`h-6 rounded bg-${container.color}-500`} title={`Container ${container.id}`}>
                        <p className="text-center text-sm text-white leading-6">{container.id}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Pagination */}
      <div className="p-4 border-t sticky bottom-0 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {indexOfFirstCard + 1} to {Math.min(indexOfLastCard, filteredCards.length)} of {filteredCards.length} cards
          </span>
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1.5 rounded text-sm 
              ${currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardsPreviewPanel;
