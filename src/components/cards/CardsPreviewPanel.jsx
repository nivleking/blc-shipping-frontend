import { useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import PortLegendCards from "./PortLegendCards";
import EditCardModal from "./EditCardModal";
import CardsTableView from "./CardsTableView";
import CardsGridView from "./CardsGridView";
import CardStatsDashboard from "./CardStatsDashboard";

const CardsPreviewPanel = ({ cards, containers, formatIDR, onCardUpdated }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Get unique origins for filters
  const uniqueOrigins = [...new Set(cards.map((card) => card.origin))].sort();

  const handleEditClick = (card) => {
    setSelectedCard(card);
    setEditModalOpen(true);
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
            <CardsGridView cards={cards} containers={containers} formatIDR={formatIDR} onEditCard={handleEditClick} />
          </TabPanel>

          {/* Table View Panel */}
          <TabPanel>
            <CardsTableView cards={cards} formatIDR={formatIDR} onEditCard={handleEditClick} uniqueOrigins={uniqueOrigins} />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Edit Card Modal */}
      <EditCardModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} card={selectedCard} formatIDR={formatIDR} onCardUpdated={onCardUpdated} />
    </div>
  );
};

export default CardsPreviewPanel;
