import { useState, useEffect } from "react";
import { api } from "../../../axios/axios";
import { Tab, TabList, TabPanel, TabPanels, TabGroup } from "@headlessui/react";
import { FiAlertCircle, FiEdit } from "react-icons/fi";
import { Link } from "react-router-dom";

// Format number as IDR currency
const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const DeckPreviewModal = ({ isOpen, onClose, deckId, token }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterOrigin, setFilterOrigin] = useState("all");
  const [deckName, setDeckName] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredCards, setFilteredCards] = useState([]);
  const cardsPerPage = 6;

  useEffect(() => {
    if (isOpen && deckId) {
      fetchDeckCards();
    }
  }, [isOpen, deckId]);

  // Filter cards when dependencies change
  useEffect(() => {
    if (cards.length > 0) {
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
    }
  }, [cards, filterType, filterOrigin]);

  const fetchDeckCards = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/decks/${deckId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        if (response.data.cards) {
          setCards(response.data.cards);
          setFilteredCards(response.data.cards);
        } else {
          setCards([]);
          setFilteredCards([]);
        }
        // Store deck name for the edit link
        setDeckName(response.data.name || "Unnamed Deck");
      }
    } catch (err) {
      console.error("Error fetching deck cards:", err);
      setError("Failed to load deck cards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get unique origins for filter options
  const uniqueOrigins = [...new Set(cards.map((card) => card.origin))].sort();

  // Calculate pagination values
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  // Pagination handler with stopPropagation to prevent form interference
  const paginate = (e, pageNumber) => {
    // Stop event from propagating to parent elements
    e.preventDefault();
    e.stopPropagation();

    setCurrentPage(pageNumber);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">Deck Cards Preview</h3>
            <span className="text-sm text-gray-500">{deckName}</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Edit button that links to AdminDecks page */}
            <Link to="/admin-decks" onClick={(e) => e.stopPropagation()} className="flex items-center text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <FiEdit className="mr-2" />
              Manage Decks
            </Link>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading deck cards...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-500">
              <FiAlertCircle className="h-12 w-12 mb-4" />
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Filter section */}
              <div className="bg-white border-b mb-4 pb-4 space-y-3">
                {/* Priority Filters */}
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-gray-500">Priorities:</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFilterType("all");
                    }}
                    className={`px-4 py-1.5 text-xs rounded-full transition-colors
                    ${filterType === "all" ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                  >
                    All Priorities
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFilterType("committed");
                    }}
                    className={`px-4 py-1.5 text-xs rounded-full transition-colors
                    ${filterType === "committed" ? "bg-green-500 text-white" : "bg-green-100 hover:bg-green-200 text-green-700"}`}
                  >
                    Committed
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFilterType("non-committed");
                    }}
                    className={`px-4 py-1.5 text-xs rounded-full transition-colors
                    ${filterType === "non-committed" ? "bg-yellow-500 text-white" : "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"}`}
                  >
                    Non-Committed
                  </button>
                </div>

                {/* Origin Filters */}
                {uniqueOrigins.length > 0 && (
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-xs text-gray-500">Origins:</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFilterOrigin("all");
                      }}
                      className={`px-3 py-1 text-xs rounded-full transition-colors
                      ${filterOrigin === "all" ? "bg-purple-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                    >
                      All Ports
                    </button>
                    {uniqueOrigins.map((origin) => (
                      <button
                        key={origin}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFilterOrigin(origin);
                        }}
                        className={`px-3 py-1 text-xs rounded-full transition-colors
                        ${filterOrigin === origin ? "bg-purple-500 text-white" : "bg-purple-100 hover:bg-purple-200 text-purple-700"}`}
                      >
                        {origin}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cards Grid or Empty State */}
              <div className="overflow-y-auto max-h-[60vh]">
                {currentCards.length > 0 ? (
                  <TabGroup>
                    <TabList className="flex space-x-2 border-b mb-4">
                      <Tab
                        className={({ selected }) =>
                          `py-2 px-4 text-sm font-medium border-b-2 transition-colors focus:outline-none ${selected ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`
                        }
                        onClick={(e) => e.stopPropagation()}
                      >
                        Grid View
                      </Tab>
                      <Tab
                        className={({ selected }) =>
                          `py-2 px-4 text-sm font-medium border-b-2 transition-colors focus:outline-none ${selected ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`
                        }
                        onClick={(e) => e.stopPropagation()}
                      >
                        Table View
                      </Tab>
                    </TabList>

                    <TabPanels>
                      <TabPanel>
                        {/* Grid View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {currentCards.map((card) => (
                            <div
                              key={card.id}
                              className={`bg-white rounded-lg border shadow hover:shadow-md transition-shadow
                                      ${card.priority === "Committed" ? "border-l-4 border-green-500" : "border-l-4 border-yellow-500"}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="p-4">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-semibold text-base">
                                    ({card.id}) {card.origin} → {card.destination}
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs
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
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabPanel>

                      <TabPanel>
                        {/* Table View */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Route
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Priority
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Quantity
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Revenue
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {currentCards.map((card) => (
                                <tr key={card.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.id}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {card.origin} → {card.destination}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{card.type}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                              ${card.priority === "Committed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                                    >
                                      {card.priority}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{card.quantity}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatIDR(card.revenue)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TabPanel>
                    </TabPanels>
                  </TabGroup>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
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
                    <p className="text-gray-500 text-lg">No cards available in this deck</p>
                    <p className="text-gray-400 text-sm mt-1">This deck is empty or has no cards matching your filters</p>
                    <Link to={`/admin-cards/${deckId}`} onClick={(e) => e.stopPropagation()} className="mt-4 text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-500 px-4 py-2 rounded-lg transition-colors">
                      Create Cards for this Deck
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination with stopPropagation */}
              {filteredCards.length > 0 && (
                <div className="mt-4 border-t pt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Showing {indexOfFirstCard + 1} to {Math.min(indexOfLastCard, filteredCards.length)} of {filteredCards.length} cards
                  </span>
                  <div className="flex gap-2">
                    {currentPage > 1 && (
                      <button onClick={(e) => paginate(e, currentPage - 1)} className="px-3 py-1.5 rounded text-sm bg-gray-100 hover:bg-gray-200">
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
                            onClick={(e) => paginate(e, i)}
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
                      <button onClick={(e) => paginate(e, currentPage + 1)} className="px-3 py-1.5 rounded text-sm bg-gray-100 hover:bg-gray-200">
                        Next
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t p-4 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeckPreviewModal;
