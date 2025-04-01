import { useState } from "react";
import { api } from "../../axios/axios";
import ReactPaginate from "react-paginate";
import LoadingOverlay from "../../components/LoadingOverlay";
import ConfirmationModal from "../../components/ConfirmationModal";
import DecksTableView from "../../components/cards/decks/DecksTableView";
import DecksGridView from "../../components/cards/decks/DecksGridView";
import useToast from "../../toast/useToast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const AdminDecks = () => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({ name: "" });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [deleteLoadingMessageIndex, setDeleteLoadingMessageIndex] = useState(0);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    deckId: null,
  });
  const [viewMode, setViewMode] = useState("grid");

  const queryClient = useQueryClient();

  const {
    data: decks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["decks"],
    queryFn: async () => {
      const response = await api.get("/decks");
      return response.data;
    },
  });

  const createDeckMutation = useMutation({
    mutationFn: async (newDeck) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return api.post("/decks", newDeck);
    },
    onMutate: () => {
      setLoadingMessageIndex(0);
      return { loadingMessages: ["Creating your deck..."] };
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries(["decks"]);
      queryClient.invalidateQueries(["rooms"]);
      setFormData({ name: "" });
      showSuccess("Deck created successfully!");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Failed to create deck";
      showError(errorMessage);
    },
  });

  const deleteDeckMutation = useMutation({
    mutationFn: async (deckId) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return api.delete(`/decks/${deckId}`);
    },
    onMutate: () => {
      setDeleteLoadingMessageIndex(0);

      return { deleteLoadingMessages: ["Deleting the deck...", "Removing associated cards..."] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["decks"]);
      queryClient.invalidateQueries(["rooms"]);

      showSuccess("Deck deleted successfully!");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Failed to delete deck";
      showError(errorMessage);
    },
  });

  const handleDeleteClick = (deckId) => {
    setConfirmModal({
      isOpen: true,
      deckId,
    });
  };

  const handleConfirmDelete = async () => {
    // Close modal first
    setConfirmModal({ isOpen: false, deckId: null });

    deleteDeckMutation.mutate(confirmModal.deckId);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name.trim()) {
      showError("Deck name is required");
      return;
    }

    createDeckMutation.mutate(formData);
  }

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = decks.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(decks.length / itemsPerPage);

  return (
    <div className="container mx-auto p-4">
      {createDeckMutation.isPending && <LoadingOverlay messages={["Creating your deck..."]} currentMessageIndex={loadingMessageIndex} title="Creating New Deck" />}

      {deleteDeckMutation.isPending && <LoadingOverlay messages={["Deleting the deck...", "Removing associated cards..."]} currentMessageIndex={deleteLoadingMessageIndex} title="Deleting Deck" />}

      <div className="mb-4">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
          <div className="w-full">
            <h3 className="text-1xl font-bold text-gray-900">Create New Deck</h3>
          </div>
          <div className="flex flex-col">
            <label className="block text-gray-700 font-semibold">Deck Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter Deck Name" />
            {createDeckMutation.error?.response?.data?.errors?.name && <p className="text-red-500 text-sm">{createDeckMutation.error.response.data.errors.name}</p>}
          </div>
          <button type="submit" className="p-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300" disabled={createDeckMutation.isPending}>
            {createDeckMutation.isPending ? "Creating..." : "Create Deck"}
          </button>
        </form>
      </div>

      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-1xl font-bold text-gray-800 mb-4">All Decks</h3>
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button className={`p-1.5 rounded-md flex items-center ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setViewMode("grid")} title="Grid view">
              Grid
            </button>
            <button className={`p-1.5 rounded-md flex items-center ${viewMode === "table" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setViewMode("table")} title="Table view">
              Table
            </button>
          </div>

          {decks.length > 0 && (
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
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>Error loading decks: {error.message}</p>
            <button onClick={() => queryClient.invalidateQueries(["decks"])} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Retry
            </button>
          </div>
        ) : decks.length === 0 ? (
          <p className="text-center text-gray-600">There are no decks! Let's create one!</p>
        ) : viewMode === "table" ? (
          <DecksTableView decks={decks} currentPageData={currentPageData} handleDeleteClick={handleDeleteClick} />
        ) : (
          <DecksGridView decks={decks} currentPageData={currentPageData} offset={offset} handleDeleteClick={handleDeleteClick} deleteMutationPending={deleteDeckMutation.isPending} />
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
