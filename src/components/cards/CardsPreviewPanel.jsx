import { useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { toast } from "react-toastify";
import { api } from "../../axios/axios";
import PortLegendCards from "./PortLegendCards";
import EditCardModal from "./EditCardModal";
import CardsTableView from "./CardsTableView";
import CardsGridView from "./CardsGridView";
import CardStatsDashboard from "./CardStatsDashboard";
import ConfirmationModal from "../ConfirmationModal";

const CardsPreviewPanel = ({ cards, containers, formatIDR, onCardUpdated, deckId }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  // Get unique origins for filters
  const uniqueOrigins = [...new Set(cards.map((card) => card.origin))].sort();

  const handleEditClick = (card) => {
    setSelectedCard(card);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (card) => {
    setCardToDelete(card);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/decks/${deckId}/remove-card/${cardToDelete.id}`);
      toast.success(`Card ${cardToDelete.id} deleted successfully`);
      onCardUpdated(); // Refresh the cards list
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error(error.response?.data?.message || "Failed to delete card");
    }
  };

  return (
    <div className="col-span-4 bg-white shadow-md rounded-lg overflow-hidden text-sm">
      {/* Statistics Dashboard */}
      {/* <CardStatsDashboard cards={cards} containers={containers} formatIDR={formatIDR} /> */}

      <PortLegendCards />

      {/* Tabs for Card View and Table View */}
      <TabGroup>
        <TabList className="flex space-x-1 border-b border-gray-200 px-4 bg-white">
          <Tab
            className={({ selected }) =>
              `py-3 px-5 text-sm font-medium border-b-2 focus:outline-none
            ${selected ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`
            }
          >
            Grid View
          </Tab>
          <Tab
            className={({ selected }) =>
              `py-3 px-5 text-sm font-medium border-b-2 focus:outline-none
            ${selected ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`
            }
          >
            Table View
          </Tab>
        </TabList>

        <TabPanels>
          {/* Card View Panel */}
          <TabPanel>
            <CardsGridView cards={cards} containers={containers} formatIDR={formatIDR} onEditCard={handleEditClick} onDeleteCard={handleDeleteClick} />
          </TabPanel>

          {/* Table View Panel */}
          <TabPanel>
            <CardsTableView cards={cards} formatIDR={formatIDR} onEditCard={handleEditClick} onDeleteCard={handleDeleteClick} uniqueOrigins={uniqueOrigins} />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Edit Card Modal */}
      <EditCardModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} card={selectedCard} formatIDR={formatIDR} onCardUpdated={onCardUpdated} />

      {/* Delete Card Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Card"
        message={cardToDelete ? `Are you sure you want to delete card ${cardToDelete.id}? This action cannot be undone.` : ""}
      />
    </div>
  );
};

export default CardsPreviewPanel;
