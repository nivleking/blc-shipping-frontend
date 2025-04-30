import { useState } from "react";
import { Link } from "react-router-dom";
import { AiFillDelete, AiFillFolderOpen } from "react-icons/ai";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";

const DecksTableView = ({ decks, currentPageData, handleDeleteClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" });
  const [searchTerm, setSearchTerm] = useState("");

  // Request a sort
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    // Sort the decks here or in a parent component
  };

  // Filter the decks based on search term
  const filteredDecks = currentPageData.filter((deck) => deck.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="mb-4 relative">
        <div className="relative">
          <input
            type="text"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Search decks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Decks Table */}
      <div className="overflow-x-auto max-h-[calc(100vh-22rem)]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center cursor-pointer" onClick={() => requestSort("name")}>
                  Deck Name
                  {sortConfig.key === "name" && (sortConfig.direction === "ascending" ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />)}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cards
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ports
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Card Types
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDecks.map((deck, index) => {
              const stats = calculateDeckStats(deck.cards);
              return (
                <tr key={deck.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{deck.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{stats.totalCards}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{stats.totalPorts}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Dry: {stats.dryContainers}</span>
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Reefer: {stats.reeferContainers}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(deck.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/admin-create-sales-call-cards/${deck.id}`} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50">
                        <AiFillFolderOpen className="w-5 h-5" />
                      </Link>
                      <button onClick={() => handleDeleteClick(deck.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50">
                        <AiFillDelete className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state when no decks match filter criteria */}
      {filteredDecks.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500">No decks found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate stats
function calculateDeckStats(cards) {
  if (!cards) {
    return {
      totalPorts: 0,
      totalCards: 0,
      dryContainers: 0,
      reeferContainers: 0,
      commitedCards: 0,
      nonCommitedCards: 0,
    };
  }

  const totalPorts = new Set(cards.map((card) => card.origin)).size;
  const totalCards = cards.length;
  const dryContainers = cards.filter((card) => card.type.toLowerCase() === "dry").length;
  const reeferContainers = cards.filter((card) => card.type.toLowerCase() === "reefer").length;
  const commitedCards = cards.filter((card) => card.priority === "Committed").length;
  const nonCommitedCards = cards.filter((card) => card.priority === "Non-Committed").length;

  return {
    totalPorts,
    totalCards,
    dryContainers,
    reeferContainers,
    commitedCards,
    nonCommitedCards,
  };
}

export default DecksTableView;
