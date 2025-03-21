import { useEffect, useState } from "react";
import { api } from "../../axios/axios";
import { Link } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { AiFillDelete, AiFillFolderOpen } from "react-icons/ai";
import "./AdminHome.css";
import LoadingOverlay from "../../components/LoadingOverlay";
import ConfirmationModal from "../../components/ConfirmationModal";
import DecksTableView from "../../components/cards/DecksTableView";
import { IoCardOutline, IoFileTrayStackedOutline, IoLocationOutline, IoTimeOutline } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminDecks = () => {
  const [decks, setDecks] = useState([]);
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false); // New state for delete loading
  const loadingMessages = ["Creating your deck..."];
  const deleteLoadingMessages = ["Deleting the deck...", "Removing associated cards..."]; // New messages for delete
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [deleteLoadingMessageIndex, setDeleteLoadingMessageIndex] = useState(0); // New index for delete messages
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    deckId: null,
  });
  const [viewMode, setViewMode] = useState("grid");

  // Add effect for delete loading messages rotation
  useEffect(() => {
    let interval;
    if (isDeletingLoading) {
      interval = setInterval(() => {
        setDeleteLoadingMessageIndex((prev) => (prev === deleteLoadingMessages.length - 1 ? 0 : prev + 1));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isDeletingLoading]);

  const handleDeleteClick = (deckId) => {
    setConfirmModal({
      isOpen: true,
      deckId,
    });
  };

  const handleConfirmDelete = async () => {
    // Close modal first
    setConfirmModal({ isOpen: false, deckId: null });

    // Show loading overlay
    setIsDeletingLoading(true);
    setDeleteLoadingMessageIndex(0);

    // Add delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      await api.delete(`/decks/${confirmModal.deckId}`);
      setDecks(decks.filter((deck) => deck.id !== confirmModal.deckId));
      toast.success("Deck deleted successfully!");
    } catch (error) {
      setErrors(error.response.data.errors);
      console.error("Error deleting deck:", error);
      toast.error(error.response?.data?.message || "Failed to delete deck");
    } finally {
      setIsDeletingLoading(false);
    }
  };

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev === loadingMessages.length - 1 ? 0 : prev + 1));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    fetchDecks();
  }, []);

  async function fetchDecks() {
    try {
      const response = await api.get("/decks");
      const decksData = response.data;

      const decksWithCards = await Promise.all(
        decksData.map(async (deck) => {
          const cardsResponse = await api.get(`/decks/${deck.id}/cards`);
          return { ...deck, cards: cardsResponse.data.cards };
        })
      );

      setDecks(decksWithCards);
    } catch (error) {
      console.error("Error fetching decks:", error);
      toast.error("Failed to fetch decks");
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Deck name is required");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      const response = await api.post("/decks", formData);
      setDecks([...decks, response.data]);
      setFormData({ name: "" });
      toast.success("Deck created successfully!");
    } catch (error) {
      setErrors(error.response.data.errors);
      console.error("Error creating deck:", error);
      toast.error(error.response?.data?.message || "Failed to create deck");
    } finally {
      setIsLoading(false);
      setLoadingMessageIndex(0);
    }
  }

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

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = decks.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(decks.length / itemsPerPage);

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      {isLoading && <LoadingOverlay messages={loadingMessages} currentMessageIndex={loadingMessageIndex} title="Creating New Deck" />}
      {isDeletingLoading && <LoadingOverlay messages={deleteLoadingMessages} currentMessageIndex={deleteLoadingMessageIndex} title="Deleting Deck" />}

      <div className="mb-4">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <div className="w-full">
            <h3 className="text-1xl font-bold text-gray-900">Create New Deck</h3>
          </div>
          <div className="flex flex-col">
            <label className="block text-gray-700 font-semibold">Deck Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter Deck Name" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          <button type="submit" className="p-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300">
            Create Deck
          </button>
        </form>
      </div>

      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-1xl font-bold text-gray-800 mb-4">All Decks</h3>
          {/* View Toggle Buttons */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button className={`p-1.5 rounded-md flex items-center ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setViewMode("grid")} title="Grid view">
              Grid
            </button>
            <button className={`p-1.5 rounded-md flex items-center ${viewMode === "table" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setViewMode("table")} title="Table view">
              Table
            </button>
          </div>

          <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
            previousClassName={"page-item"}
            nextClassName={"page-item"}
            pageClassName={"page-item"}
            pageLinkClassName={"page-link"}
            previousLinkClassName={"page-link"}
            nextLinkClassName={"page-link"}
            breakLinkClassName={"page-link"}
          />
        </div>

        {decks.length === 0 ? (
          <p className="text-center text-gray-600">There are no decks! Let's create one!</p>
        ) : viewMode === "table" ? (
          <DecksTableView decks={decks} currentPageData={currentPageData} handleDeleteClick={handleDeleteClick} />
        ) : (
          <div className="space-y-4 text-sm">
            {currentPageData.map((deck, index) => {
              const stats = calculateDeckStats(deck.cards);
              return (
                <div key={deck.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="p-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <IoCardOutline className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 font-medium">#{offset + index + 1}</span>
                          <h3 className="text-xl font-bold text-gray-900">{deck.name}</h3>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/admin-create-sales-call-cards/${deck.id}`} className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                          <AiFillFolderOpen className="mr-2" /> View
                        </Link>
                        <button onClick={() => handleDeleteClick(deck.id)} className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
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
        )}
      </div>
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, deckId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Deck"
        message="Are you sure you want to delete this deck? This action cannot be undone and all cards within this deck will be deleted."
      />
    </div>
  );
};

export default AdminDecks;
