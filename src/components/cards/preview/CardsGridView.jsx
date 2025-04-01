import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const CardsGridView = ({ cards, containers, formatIDR, onEditCard, onDeleteCard }) => {
  // Filter states
  const [filterType, setFilterType] = useState("all");
  const [filterOrigin, setFilterOrigin] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredCards, setFilteredCards] = useState([]);
  const cardsPerPage = 6;

  // Get unique origins for filter options
  const uniqueOrigins = [...new Set(cards.map((card) => card.origin))].sort();

  // Filter cards when dependencies change
  useEffect(() => {
    let filtered = [...cards];

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((card) => card.priority === (filterType === "committed" ? "Committed" : "Non-Committed"));
    }

    // Apply origin filter
    if (filterOrigin !== "all") {
      filtered = filtered.filter((card) => card.origin === filterOrigin);
    }

    setFilteredCards(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [cards, filterType, filterOrigin]);

  // Calculate pagination values
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  // Pagination handler
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      {/* Filter section */}
      <div className="p-4 border-b sticky top-0 bg-white z-10 space-y-3">
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
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs text-gray-500">Origins:</span>
          <button
            onClick={() => setFilterOrigin("all")}
            className={`px-3 py-1 text-xs rounded-full transition-colors
            ${filterOrigin === "all" ? "bg-purple-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
          >
            All Ports
          </button>
          {uniqueOrigins.map((origin) => (
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

      {/* Cards Grid or Empty State */}
      <div className="p-4 overflow-y-auto h-[calc(100vh-18rem)]">
        {currentCards.length > 0 ? (
          <div className="grid grid-cols-3 grid-rows-2 gap-4">
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
                {/* Card Header with Edit Button */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-base">
                      ({card.id}) {card.origin} → {card.destination}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => onEditCard(card)} className="p-1 hover:bg-gray-100 rounded-full transition-colors" title="Edit card">
                        <FiEdit className="text-blue-600" />
                      </button>
                      <button onClick={() => onDeleteCard(card)} className="p-1 hover:bg-gray-100 rounded-full transition-colors" title="Delete card">
                        <FiTrash2 className="text-red-600" />
                      </button>
                      <span
                        className={`px-3 py-1 rounded-full text-sm
                                 ${card.priority === "Committed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {card.priority}
                      </span>
                    </div>
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
                        ?.filter((c) => c.card_id === card.id)
                        .map((container) => (
                          <div key={container.id} style={{ backgroundColor: container.color }} className="h-6 rounded" title={`Container ${container.id}`}>
                            <p className={`text-center text-sm ${container.color === "yellow" ? "text-black" : "text-white"} leading-6`}>{container.id}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-gray-400 mb-3">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No cards available</p>
            <p className="text-gray-400 text-sm mt-1">Generate cards or adjust your filters to see cards</p>
          </div>
        )}
      </div>

      {/* Improved Pagination - Only show if we have cards */}
      {filteredCards.length > 0 && (
        <div className="p-4 border-t sticky bottom-0 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {indexOfFirstCard + 1} to {Math.min(indexOfLastCard, filteredCards.length)} of {filteredCards.length} cards
            </span>
            <div className="flex gap-2">
              {totalPages > 1 && (
                <button
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded text-sm ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                >
                  First
                </button>
              )}

              {currentPage > 1 && (
                <button onClick={() => paginate(currentPage - 1)} className="px-3 py-1.5 rounded text-sm bg-gray-100 hover:bg-gray-200">
                  Prev
                </button>
              )}

              {/* Page Numbers - Show a maximum of 5 page numbers */}
              {(() => {
                let pageNumbers = [];
                let startPage = Math.max(1, currentPage - 2);
                let endPage = Math.min(totalPages, startPage + 4);

                if (endPage - startPage < 4 && totalPages > 5) {
                  startPage = Math.max(1, endPage - 4);
                }

                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(
                    <button
                      key={i}
                      onClick={() => paginate(i)}
                      className={`px-3 py-1.5 rounded text-sm 
                      ${currentPage === i ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                    >
                      {i}
                    </button>
                  );
                }
                return pageNumbers;
              })()}

              {currentPage < totalPages && (
                <button onClick={() => paginate(currentPage + 1)} className="px-3 py-1.5 rounded text-sm bg-gray-100 hover:bg-gray-200">
                  Next
                </button>
              )}

              {totalPages > 1 && (
                <button
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded text-sm ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                >
                  Last
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardsGridView;
