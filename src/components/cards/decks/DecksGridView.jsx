import { Link } from "react-router-dom";
import { AiFillDelete, AiFillFolderOpen } from "react-icons/ai";
import { IoCardOutline, IoFileTrayStackedOutline, IoLocationOutline, IoTimeOutline } from "react-icons/io5";

const DecksGridView = ({ decks, currentPageData, offset, handleDeleteClick, deleteMutationPending }) => {
  return (
    <div className="space-y-2 text-sm">
      {currentPageData.map((deck, index) => {
        const stats = deck.stats || {
          totalPorts: 0,
          totalCards: 0,
          dryContainers: 0,
          reeferContainers: 0,
          commitedCards: 0,
          nonCommitedCards: 0,
        };

        return (
          <div key={deck.id} className="text-xs bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="p-6">
              {/* Header Section */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <IoCardOutline className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 font-medium">#{offset + index + 1}</span>
                    <h3 className="text-1xl font-bold text-gray-900">{deck.name}</h3>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link to={`/admin-create-sales-call-cards/${deck.id}`} className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                    <AiFillFolderOpen className="mr-2" /> View
                  </Link>
                  <button onClick={() => handleDeleteClick(deck.id)} className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors" disabled={deleteMutationPending}>
                    <AiFillDelete className="mr-2" /> Delete
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Card Statistics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                    <IoFileTrayStackedOutline className="mr-2" />
                    Card Statistics
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cards:</span>
                      <span className="font-semibold">{stats.totalCards}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dry Sales Calls:</span>
                      <span className="font-semibold text-amber-600">{stats.dryContainers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reefer Sales Calls:</span>
                      <span className="font-semibold text-blue-600">{stats.reeferContainers}</span>
                    </div>
                  </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                    <IoTimeOutline className="mr-2" />
                    Priority Distribution
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Committed:</span>
                      <span className="font-semibold text-green-600">{stats.commitedCards}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Non-Committed:</span>
                      <span className="font-semibold text-yellow-600">{stats.nonCommitedCards}</span>
                    </div>
                  </div>
                </div>

                {/* Port Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                    <IoLocationOutline className="mr-2" />
                    Port Coverage
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Ports:</span>
                      <span className="font-semibold text-purple-600">{stats.totalPorts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-600">
                        {new Date(deck.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DecksGridView;
