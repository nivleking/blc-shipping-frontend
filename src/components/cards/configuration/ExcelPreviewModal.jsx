import { useState, useEffect } from "react";
import { FiAlertTriangle, FiFilter } from "react-icons/fi";
import { BsTable, BsGraphUp, BsSearch } from "react-icons/bs";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const ExcelPreviewModal = ({ isOpen, onClose, onConfirm, data, formatIDR }) => {
  const [currentTab, setCurrentTab] = useState("preview");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sorting and filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Stats state
  const [stats, setStats] = useState({
    totalCards: 0,
    totalRevenue: 0,
    totalContainers: 0,
    byPort: {},
    byType: { dry: 0, reefer: 0 },
    byPriority: { committed: 0, nonCommitted: 0 },
  });

  useEffect(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter((item) => item.id?.toString().toLowerCase().includes(search) || item.origin?.toLowerCase().includes(search) || item.destination?.toLowerCase().includes(search));
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((item) => item.priority === priorityFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((item) => item.type === typeFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      // Extract first digit for primary sorting
      const aFirstDigit = a.id?.toString().charAt(0) || "0";
      const bFirstDigit = b.id?.toString().charAt(0) || "0";

      // Compare first digits
      if (aFirstDigit !== bFirstDigit) {
        return sortDirection === "asc" ? aFirstDigit.localeCompare(bFirstDigit) : bFirstDigit.localeCompare(aFirstDigit);
      }

      // If first digits are the same, sort by the rest of the ID numerically
      if (sortField === "id") {
        const aRest = parseInt(a.id?.toString().substring(1) || "0", 10);
        const bRest = parseInt(b.id?.toString().substring(1) || "0", 10);
        return sortDirection === "asc" ? aRest - bRest : bRest - aRest;
      }

      // Sort by other fields if needed
      let valueA = a[sortField];
      let valueB = b[sortField];

      // Handle string comparison
      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }

      // Handle number comparison
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    });

    setFilteredData(result);
  }, [data, searchTerm, sortField, sortDirection, priorityFilter, typeFilter]);

  // Calculate statistics when data changes
  useEffect(() => {
    if (!data || !data.length) return;

    const newStats = {
      totalCards: data.length,
      totalRevenue: 0,
      totalContainers: 0,
      byPort: {},
      byType: { dry: 0, reefer: 0 },
      byPriority: { committed: 0, nonCommitted: 0 },
    };

    data.forEach((card) => {
      const revenue = card.revenue_per_container * card.quantity;
      newStats.totalRevenue += revenue;
      newStats.totalContainers += card.quantity;

      // Stats by origin port
      if (!newStats.byPort[card.origin]) {
        newStats.byPort[card.origin] = {
          cards: 0,
          revenue: 0,
          containers: 0,
        };
      }
      newStats.byPort[card.origin].cards += 1;
      newStats.byPort[card.origin].revenue += revenue;
      newStats.byPort[card.origin].containers += card.quantity;

      // Stats by type
      const type = (card.container_type || "").toLowerCase();
      if (type === "dry" || type === "reefer") {
        newStats.byType[type] += card.quantity;
      }

      // Stats by priority
      const priority = (card.priority || "").toLowerCase();
      if (priority.includes("committed")) {
        if (priority.includes("non")) {
          newStats.byPriority.nonCommitted += card.quantity;
        } else {
          newStats.byPriority.committed += card.quantity;
        }
      }
    });

    setStats(newStats);
  }, [data]);

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

  if (!isOpen) return null;

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-11/12 max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="text-amber-500 text-1xl" />
            <h2 className="text-lg font-bold text-gray-800">Import Preview</h2>
          </div>
          <div>
            <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{data.length} Sales Call Cards</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button className={`px-6 py-2 font-medium text-sm ${currentTab === "preview" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`} onClick={() => setCurrentTab("preview")}>
            <div className="flex items-center gap-2">
              <BsTable />
              <span>Data Preview</span>
            </div>
          </button>
          <button className={`px-6 py-3 font-medium text-sm ${currentTab === "stats" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`} onClick={() => setCurrentTab("stats")}>
            <div className="flex items-center gap-2">
              <BsGraphUp />
              <span>Statistics</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-2">
          {currentTab === "preview" ? (
            <div className="space-y-2">
              {/* Search and filters */}
              <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-3 rounded-lg">
                {/* Search Box */}
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <BsSearch className="absolute left-3 top-2.5 text-gray-400" />
                </div>

                {/* Priority Filter */}
                <div className="flex items-center space-x-2">
                  <FiFilter className="text-gray-500" />
                  <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="border text-xs rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Priorities</option>
                    <option value="committed">Committed</option>
                    <option value="non-committed">Non-Committed</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div className="flex items-center space-x-2">
                  <FiFilter className="text-gray-500" />
                  <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border text-xs rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Types</option>
                    <option value="dry">Dry</option>
                    <option value="reefer">Reefer</option>
                  </select>
                </div>

                {/* Rows per page */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-gray-500">Rows per page:</span>
                  <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))} className="border rounded p-2 text-xs">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>

              {/* Data table */}
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("id")}>
                        <div className="flex items-center gap-1">
                          <span>ID</span>
                          {getSortIcon("id")}
                        </div>
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("origin")}>
                        <div className="flex items-center gap-1">
                          <span>Origin</span>
                          {getSortIcon("origin")}
                        </div>
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("destination")}>
                        <div className="flex items-center gap-1">
                          <span>Destination</span>
                          {getSortIcon("destination")}
                        </div>
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("priority")}>
                        <div className="flex items-center gap-1">
                          <span>Priority</span>
                          {getSortIcon("priority")}
                        </div>
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("container_type")}>
                        <div className="flex items-center gap-1">
                          <span>Type</span>
                          {getSortIcon("container_type")}
                        </div>
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("quantity")}>
                        <div className="flex items-center gap-1">
                          <span>Qty</span>
                          {getSortIcon("quantity")}
                        </div>
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("revenue_per_container")}>
                        <div className="flex items-center gap-1">
                          <span>Revenue/Container</span>
                          {getSortIcon("revenue_per_container")}
                        </div>
                      </th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-xs">
                    {currentRows.map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-2 whitespace-nowrap font-medium text-gray-900">{row.id}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-gray-900">{row.origin}</td>
                        <td className="px-6 py-2 whitespace-nowrap text-gray-900">{row.destination}</td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${row.priority?.toLowerCase().includes("committed") && !row.priority?.toLowerCase().includes("non") ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {row.priority}
                          </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${row.container_type === "reefer" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                          >
                            {row.container_type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-2 whitespace-nowrap">{row.quantity}</td>
                        <td className="px-6 py-2 whitespace-nowrap">{formatIDR(row.revenue_per_container)}</td>
                        <td className="px-6 py-2 whitespace-nowrap">{formatIDR(row.revenue_per_container * row.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Empty state */}
                {filteredData.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No cards match your search criteria.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredData.length > rowsPerPage && (
                <div className="flex items-center justify-between border-t pt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredData.length)} of {filteredData.length} entries
                  </div>
                  <div className="flex gap-1 text-xs">
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1 bg-blue-500 text-white rounded">{currentPage}</span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded ${currentPage === totalPages ? "bg-gray-100 text-gray-400" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded ${currentPage === totalPages ? "bg-gray-100 text-gray-400" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="bg-blue-50 rounded-lg p-4 flex flex-wrap gap-2 justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Cards</p>
                  <p className="text-sm font-bold text-blue-700">{stats.totalCards}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-sm font-bold text-blue-700">{formatIDR(stats.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Containers</p>
                  <p className="text-sm font-bold text-blue-700">{stats.totalContainers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dry Containers</p>
                  <p className="text-sm font-bold text-blue-700">{stats.byType.dry}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reefer Containers</p>
                  <p className="text-sm font-bold text-blue-700">{stats.byType.reefer}</p>
                </div>
              </div>

              {/* By Port Statistics */}
              <div>
                <h3 className="text-sm font-semibold p-2">Port Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  {Object.entries(stats.byPort).map(([port, portStats]) => (
                    <div key={port} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-blue-700">{port}</span>
                        <span className="text-sm text-gray-500">{portStats.cards} cards</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Revenue:</span>
                          <span className="font-medium">{formatIDR(portStats.revenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Containers:</span>
                          <span className="font-medium">{portStats.containers}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Distribution */}
              <div>
                <h3 className="text-sm font-semibold p-2">Priority Distribution</h3>
                <div className="flex gap-4 text-sm">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200 flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-green-700">Committed</span>
                      <span className="bg-green-100 text-green-800 text-xs rounded-full px-2 py-1">{stats.totalContainers > 0 ? `${((stats.byPriority.committed / stats.totalContainers) * 100).toFixed(1)}%` : "0%"}</span>
                    </div>
                    <p className="text-sm font-bold text-green-700">{stats.byPriority.committed}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-yellow-700">Non-Committed</span>
                      <span className="bg-yellow-100 text-yellow-800 text-xs rounded-full px-2 py-1">{stats.totalContainers > 0 ? `${((stats.byPriority.nonCommitted / stats.totalContainers) * 100).toFixed(1)}%` : "0%"}</span>
                    </div>
                    <p className="text-sm font-bold text-yellow-700">{stats.byPriority.nonCommitted}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-4 text-sm">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Import Cards
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelPreviewModal;
