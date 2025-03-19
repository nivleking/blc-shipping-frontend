import { useState, useEffect } from "react";
import { FiEdit, FiFilter, FiTrash2 } from "react-icons/fi";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";

const CardsTableView = ({ cards, formatIDR, uniqueOrigins, onEditCard, onDeleteCard }) => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredCards, setFilteredCards] = useState([]);
  const [displayCards, setDisplayCards] = useState([]);

  // Handle sorting when column header is clicked
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon for column headers
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === "asc" ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />;
  };

  // Filter and sort cards when dependencies change
  useEffect(() => {
    let result = [...cards];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter((card) => card.id.toString().includes(search) || card.origin.toLowerCase().includes(search) || card.destination.toLowerCase().includes(search));
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((card) => card.priority === priorityFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((card) => card.type === typeFilter);
    }

    // Apply origin filter
    if (originFilter !== "all") {
      result = result.filter((card) => card.origin === originFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];

      // Handle string vs number comparison
      if (typeof valueA === "string" && typeof valueB === "string") {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredCards(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [cards, searchTerm, sortField, sortDirection, priorityFilter, typeFilter, originFilter]);

  // Update displayed cards based on pagination
  useEffect(() => {
    if (rowsPerPage === "all") {
      setDisplayCards(filteredCards);
    } else {
      const startIndex = (currentPage - 1) * Number(rowsPerPage);
      const endIndex = startIndex + Number(rowsPerPage);
      setDisplayCards(filteredCards.slice(startIndex, endIndex));
    }
  }, [filteredCards, currentPage, rowsPerPage]);

  // Calculate total number of pages
  const totalPages = rowsPerPage === "all" ? 1 : Math.ceil(filteredCards.length / Number(rowsPerPage));

  return (
    <div className="w-full">
      {/* Search and Filters */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search Box */}
          <div className="relative w-64">
            <input type="text" placeholder="Search cards..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <BsSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-500" />
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Priorities</option>
              <option value="Committed">Committed</option>
              <option value="Non-Committed">Non-Committed</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-500" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Types</option>
              <option value="dry">Dry</option>
              <option value="reefer">Reefer</option>
            </select>
          </div>

          {/* Origin Filter */}
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-500" />
            <select value={originFilter} onChange={(e) => setOriginFilter(e.target.value)} className="border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Origins</option>
              {uniqueOrigins.map((origin) => (
                <option key={origin} value={origin}>
                  {origin}
                </option>
              ))}
            </select>
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select value={rowsPerPage} onChange={(e) => setRowsPerPage(e.target.value)} className="border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Table */}
      <div className="overflow-x-auto max-h-[calc(100vh-22rem)]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("id")}>
                <div className="flex items-center space-x-1">
                  <span>Card ID</span>
                  {getSortIcon("id")}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("type")}>
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  {getSortIcon("type")}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("origin")}>
                <div className="flex items-center space-x-1">
                  <span>Origin</span>
                  {getSortIcon("origin")}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("destination")}>
                <div className="flex items-center space-x-1">
                  <span>Destination</span>
                  {getSortIcon("destination")}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("priority")}>
                <div className="flex items-center space-x-1">
                  <span>Priority</span>
                  {getSortIcon("priority")}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("quantity")}>
                <div className="flex items-center space-x-1">
                  <span>Quantity</span>
                  {getSortIcon("quantity")}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("revenue")}>
                <div className="flex items-center space-x-1">
                  <span>Revenue</span>
                  {getSortIcon("revenue")}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span>Revenue/Container</span>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayCards.map((card, index) => (
              <tr key={card.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{card.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${card.type === "reefer" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                  >
                    {card.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{card.origin}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{card.destination}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${card.priority === "Committed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                  >
                    {card.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{card.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIDR(card.revenue)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIDR(card.revenue / card.quantity)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => onEditCard(card)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50" title="Edit card">
                      <FiEdit />
                    </button>
                    <button onClick={() => onDeleteCard(card)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50" title="Delete card">
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {filteredCards.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No cards match your search criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {rowsPerPage !== "all" && (
        <div className="p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {filteredCards.length > 0 ? (currentPage - 1) * Number(rowsPerPage) + 1 : 0} to {Math.min(currentPage * Number(rowsPerPage), filteredCards.length)} of {filteredCards.length} cards
            </span>
            <div className="flex gap-2">
              {totalPages > 1 && (
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded text-sm ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                >
                  First
                </button>
              )}

              {currentPage > 1 && (
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className="px-3 py-1.5 rounded text-sm bg-gray-100 hover:bg-gray-200 text-gray-700">
                  Prev
                </button>
              )}

              {/* Page numbers - Fixed logic to ensure page numbers don't disappear */}
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
                      onClick={() => setCurrentPage(i)}
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
                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} className="px-3 py-1.5 rounded text-sm bg-gray-100 hover:bg-gray-200 text-gray-700">
                  Next
                </button>
              )}

              {totalPages > 1 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
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
    </div>
  );
};

export default CardsTableView;
