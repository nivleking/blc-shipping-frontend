import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { api } from "../../axios/axios";
import GenerateCardsNavbar from "../../components/cards/GenerateCardsNavbar";
import MarketIntelligencePanel from "../../components/cards/MarketIntelligencePanel";
import ConfigurationPanel from "../../components/cards/ConfigurationPanel";
import InfoModal from "../../components/cards/InfoModal";
import CardsPreviewPanel from "../../components/cards/CardsPreviewPanel";
import ConfirmationModal from "../../components/ConfirmationModal";
import LoadingOverlay from "../../components/LoadingOverlay";
import useToast from "../../toast/useToast";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

const ALL_PORTS = {
  2: ["SBY", "MKS"],
  3: ["SBY", "MKS", "MDN"],
  4: ["SBY", "MKS", "MDN", "JYP"],
  5: ["SBY", "MKS", "MDN", "JYP", "BPN"],
  6: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS"],
  7: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR"],
  8: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH"],
  9: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH", "AMQ"],
  10: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH", "AMQ", "SMR"],
};

const AdminCreateCards = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [generateFormData, setGenerateFormData] = useState({
    totalRevenueEachPort: 250_000_000,
    totalContainerQuantityEachPort: 15,
    salesCallCountEachPort: 8,
    ports: 4,
    quantityStandardDeviation: 1,
    revenueStandardDeviation: 500_000,
    useMarketIntelligence: false,
  });
  const [generateErrors, setGenerateErrors] = useState({});
  const [deck, setDeck] = useState({});
  const [salesCallCards, setSalesCallCards] = useState([]);
  const [containers, setContainers] = useState([]);
  const [portStats, setPortStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const loadingMessages = ["Generating sales call cards..."];

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    fetchDeck();
    fetchContainers();
  }, []);

  async function fetchDeck() {
    try {
      const res = await api.get(`/decks/${deckId}`);
      setDeck(res.data);
      setSalesCallCards(res.data.cards);
      calculateDeckStats(res.data.cards);
    } catch (error) {
      console.error("Error fetching deck:", error);
    }
  }

  async function fetchContainers() {
    try {
      const response = await api.get("/containers");
      console.log("Containers:", response.data);
      setContainers(response.data);
    } catch (error) {
      console.error("Error fetching containers:", error);
    }
  }

  const handleGenerateChange = (e) => {
    const { name, value } = e.target;
    if (name === "generateConfig") {
      const config = JSON.parse(value);
      setGenerateFormData({ ...generateFormData, ...config });
    } else {
      setGenerateFormData({ ...generateFormData, [name]: value });
    }
  };

  const handlePresetSelect = (config) => {
    try {
      setGenerateFormData((prevData) => ({
        ...prevData,
        ...config,
      }));
      showSuccess("Preset configuration applied");
    } catch (error) {
      showError("Failed to apply preset configuration");
    }
  };

  const handlePortSelect = (portCount) => {
    try {
      if (portCount >= 2 && portCount <= 10) {
        setGenerateFormData((prevData) => ({
          ...prevData,
          ports: portCount,
        }));
        showInfo(`Port count set to ${portCount}`);
      }
    } catch (error) {
      showError("Failed to set port count");
    }
  };

  const handleRevenueSelect = (revenue) => {
    try {
      setGenerateFormData((prevData) => ({
        ...prevData,
        totalRevenueEachPort: revenue,
      }));
      showInfo(`Revenue per port set to ${formatIDR(revenue)}`);
    } catch (error) {
      showError("Failed to set revenue");
    }
  };

  const handleQuantitySelect = (quantity) => {
    try {
      setGenerateFormData((prevData) => ({
        ...prevData,
        totalContainerQuantityEachPort: quantity,
      }));
      showInfo(`Container quantity per port set to ${quantity}`);
    } catch (error) {
      showError("Failed to set container quantity");
    }
  };

  const calculateDeckStats = (cards) => {
    const stats = cards.reduce((acc, card) => {
      if (!acc[card.origin]) {
        acc[card.origin] = {
          totalRevenue: 0,
          totalQuantity: 0,
          totalSalesCall: 0,
        };
      }
      acc[card.origin].totalRevenue += card.revenue;
      acc[card.origin].totalQuantity += card.quantity;
      acc[card.origin].totalSalesCall += 1;
      return acc;
    }, {});

    setPortStats(stats);
  };

  // const handleMarketIntelligenceUpload = (data) => {
  //   try {
  //     if (!data.ports || !Array.isArray(data.ports)) {
  //       throw new Error("Invalid market intelligence format");
  //     }

  //     setGenerateFormData((prevData) => ({
  //       ...prevData,
  //       ports: data.ports.length,
  //       totalRevenueEachPort: data.maxRevenue || prevData.totalRevenueEachPort,
  //       // Add other mappings as needed
  //     }));
  //   } catch (error) {
  //     showError(error.message);
  //   }
  // };

  const [showInfoModal, setShowInfoModal] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);

  const navBarTitle = `${deck.name}`;

  const handleDeleteAllCards = async () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/decks/${deckId}/cards`);
      await fetchDeck();
      await fetchContainers();
      showSuccess("All cards have been deleted successfully");
    } catch (error) {
      console.error("Error deleting cards:", error);
      showError("Failed to delete cards");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleGenerateButtonClick = (e) => {
    e.preventDefault();
    setShowGenerateConfirm(true);
  };

  const handleConfirmGenerate = async () => {
    setIsLoading(true);
    setLoadingMessageIndex(0);

    try {
      const response = await api.post(`/generate-cards/${deckId}`, generateFormData);
      setSalesCallCards(response.data.cards);
      await fetchContainers();
      calculateDeckStats(response.data.cards);

      showSuccess("Cards generated successfully!");

      setGenerateFormData({
        totalRevenueEachPort: 250_000_000,
        totalContainerQuantityEachPort: 15,
        salesCallCountEachPort: 8,
        ports: 4,
        quantityStandardDeviation: 1,
        revenueStandardDeviation: 500_000,
      });
    } catch (error) {
      setGenerateErrors(error.response?.data?.errors || {});
      setSalesCallCards([]);
      showError(error.response?.data?.message || "Failed to generate cards");
    } finally {
      setIsLoading(false);
      setShowGenerateConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading && <LoadingOverlay messages={loadingMessages} currentMessageIndex={loadingMessageIndex} title="Generating Cards" />}

      <div className="container mx-auto px-4 py-6">
        <GenerateCardsNavbar title={navBarTitle} onBack={() => navigate(-1)} onInfoClick={() => setShowInfoModal(true)} onDeleteAllCards={handleDeleteAllCards} />
        <TabGroup>
          <TabList className="flex space-x-1 rounded-xl bg-white shadow-sm p-1 mb-6 mt-4">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                ${selected ? "bg-blue-500 text-white shadow" : "text-blue-600 hover:bg-blue-50"}`
              }
            >
              Configuration
            </Tab>
            <Tab className={({ selected }) => `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? "bg-blue-500 text-white shadow" : "text-blue-600 hover:bg-blue-50"}`}>Market Intelligence</Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                ${selected ? "bg-blue-500 text-white shadow" : "text-blue-600 hover:bg-blue-50"}`
              }
            >
              Generated Cards
            </Tab>
          </TabList>

          <TabPanels>
            {/* Configuration Tab */}
            <TabPanel>
              <ConfigurationPanel
                portStats={portStats}
                generateFormData={generateFormData}
                generateErrors={generateErrors}
                handleGenerateChange={handleGenerateChange}
                handlePresetSelect={handlePresetSelect}
                handlePortSelect={handlePortSelect}
                handleRevenueSelect={handleRevenueSelect}
                handleQuantitySelect={handleQuantitySelect}
                formatIDR={formatIDR}
                deckId={deckId}
                refreshCards={fetchDeck}
                refreshContainers={fetchContainers}
                handleGenerateButtonClick={handleGenerateButtonClick}
              />
            </TabPanel>

            {/* Market Intelligence Tab */}
            <TabPanel>
              <MarketIntelligencePanel deckId={deckId} />
            </TabPanel>

            {/* Generated Cards Tab */}
            <TabPanel>
              <div className="bg-white rounded-lg shadow">
                <CardsPreviewPanel
                  cards={salesCallCards}
                  containers={containers}
                  formatIDR={formatIDR}
                  deckId={deckId}
                  onCardUpdated={async () => {
                    await fetchDeck();
                    await fetchContainers();
                  }}
                />
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>

        {/* Information Modal */}
        {showInfoModal && <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Delete All Cards"
          message="Are you sure you want to delete all cards in this deck? This action cannot be undone."
        />

        {/* Generate Confirmation Modal */}
        <ConfirmationModal
          isOpen={showGenerateConfirm}
          onClose={() => setShowGenerateConfirm(false)}
          onConfirm={handleConfirmGenerate}
          title="Generate Cards"
          message={`Are you sure you want to generate new sales call cards? This will create cards based on your current configuration.${salesCallCards.length > 0 ? " Existing cards will be removed!" : ""}`}
        />
      </div>
    </div>
  );
};

export default AdminCreateCards;
