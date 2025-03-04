import { useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import PortLegendCards from "./PortLegendCards";
import EditCardModal from "./EditCardModal";
import CardsTableView from "./CardsTableView";
import CardsGridView from "./CardsGridView";

const CardsPreviewPanel = ({
  currentCards,
  containers,
  formatIDR,
  filterType,
  setFilterType,
  filterOrigin,
  setFilterOrigin,
  uniqueOrigins,
  indexOfFirstCard,
  indexOfLastCard,
  filteredCards,
  totalPages,
  currentPage,
  paginate,
  onCardUpdated,
  cards,
}) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleEditClick = (card) => {
    setSelectedCard(card);
    setEditModalOpen(true);
  };

  return (
    <div className="col-span-4 bg-white shadow-md rounded-lg overflow-hidden text-sm">
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
            <CardsGridView
              currentCards={currentCards}
              containers={containers}
              formatIDR={formatIDR}
              filterType={filterType}
              setFilterType={setFilterType}
              filterOrigin={filterOrigin}
              setFilterOrigin={setFilterOrigin}
              uniqueOrigins={uniqueOrigins}
              indexOfFirstCard={indexOfFirstCard}
              indexOfLastCard={indexOfLastCard}
              filteredCards={filteredCards}
              totalPages={totalPages}
              currentPage={currentPage}
              paginate={paginate}
              onEditCard={handleEditClick}
            />
          </TabPanel>

          {/* Table View Panel */}
          <TabPanel>
            <CardsTableView cards={cards} formatIDR={formatIDR} uniqueOrigins={uniqueOrigins} onEditCard={handleEditClick} />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Edit Card Modal */}
      <EditCardModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} card={selectedCard} formatIDR={formatIDR} onCardUpdated={onCardUpdated} />
    </div>
  );
};

export default CardsPreviewPanel;
