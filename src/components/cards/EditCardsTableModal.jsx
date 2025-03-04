import { useState, useEffect, Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { FaSort, FaSortUp, FaSortDown, FaEye } from "react-icons/fa";
import { FiEdit, FiFilter } from "react-icons/fi";
import { BsSearch } from "react-icons/bs";
import EditCardModal from "./EditCardModal";

const EditCardsTableModal = ({ isOpen, onClose, cards, formatIDR, onCardUpdated }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filteredCards, setFilteredCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");

  // Calculate available origins from cards
  const availableOrigins = [...new Set(cards.map((card) => card.origin))].sort();

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Apply all filters and sorting
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
  }, [cards, searchTerm, sortField, sortDirection, priorityFilter, typeFilter, originFilter]);

  const handleEditClick = (card) => {
    setSelectedCard(card);
    setEditModalOpen(true);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === "asc" ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <DialogPanel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <DialogTitle as="h3" className="text-xl font-bold text-gray-800">
                    Edit Sales Call Cards
                  </DialogTitle>
                  <span className="text-sm text-gray-500">{filteredCards.length} cards</span>
                </div>

                {/* Search and Filters */}
                <div className="p-4 bg-white border-b border-gray-200">
                  <div className="flex flex-wrap gap-4 items-center">
                    {/* Search Box */}
                    <div className="relative w-64">
                      <input
                        type="text"
                        placeholder="Search cards..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
                        {availableOrigins.map((origin) => (
                          <option key={origin} value={origin}>
                            {origin}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cards Table */}
                <div className="overflow-x-auto max-h-[60vh]">
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
                      {filteredCards.map((card) => (
                        <tr key={card.id} className="hover:bg-gray-50">
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
                              <button onClick={() => handleEditClick(card)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50" title="Edit card">
                                <FiEdit />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* If no cards */}
                {filteredCards.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No cards match your search criteria.</p>
                  </div>
                )}

                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                  <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300">
                    Close
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>

        {/* Edit Card Modal */}
        <EditCardModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          card={selectedCard}
          formatIDR={formatIDR}
          onCardUpdated={() => {
            onCardUpdated();
            setEditModalOpen(false);
          }}
        />
      </Dialog>
    </Transition>
  );
};

export default EditCardsTableModal;
