import { useState, useEffect, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { api } from "../../axios/axios";
import { AppContext } from "../../context/AppContext";
import GenerateCardsNavbar from "../../components/cards/GenerateCardsNavbar";
import MarketIntelligencePanel from "../../components/cards/market_intelligence/MarketIntelligencePanel";
import ConfigurationPanel from "../../components/cards/configuration/ConfigurationPanel";
import InfoModal from "../../components/cards/InfoModal";
import CardsPreviewPanel from "../../components/cards/preview/CardsPreviewPanel";
import ConfirmationModal from "../../components/ConfirmationModal";
import LoadingOverlay from "../../components/LoadingOverlay";
import useToast from "../../toast/useToast";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

const AdminCreateCards = () => {
  const { showSuccess, showError } = useToast();
  const { token } = useContext(AppContext);
  const queryClient = useQueryClient();
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [generateFormData, setGenerateFormData] = useState({
    totalRevenueEachPort: 500_000_000,
    totalContainerQuantityEachPort: 40,
    salesCallCountEachPort: 20,
    ports: 5,
    quantityStandardDeviation: 1,
    revenueStandardDeviation: 500_000,
    useMarketIntelligence: false,
  });
  const [generateErrors, setGenerateErrors] = useState({});
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);

  const loadingMessages = ["Generating sales call cards..."];

  // Use React Query to fetch deck with containers
  const {
    data,
    isLoading: isLoadingDeck,
    refetch: refetchDeckData,
  } = useQuery({
    queryKey: ["deckWithContainers", deckId],
    queryFn: async () => {
      const response = await api.get(`/decks/${deckId}`, {
        params: { include_containers: true },
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      return response.data;
    },
    onError: (error) => {
      console.error("Error fetching deck data:", error);
      showError("Failed to fetch deck data");
    },
  });

  // Extract data from the query result
  const deck = data?.deck || {};
  const salesCallCards = deck.cards || [];
  const containers = data?.containers || [];

  // Calculate port stats
  const portStats = salesCallCards.reduce((acc, card) => {
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

  // Mutation for deleting all cards
  const deleteCardsMutation = useMutation({
    mutationFn: async () => {
      return api.delete(`/decks/${deckId}/cards`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
    },
    onSuccess: () => {
      refetchDeckData();
      queryClient.invalidateQueries(["decks"]);
      showSuccess("All cards have been deleted successfully");
      setShowDeleteConfirm(false);
    },
    onError: (error) => {
      console.error("Error deleting cards:", error);
      showError("Failed to delete cards");
      setShowDeleteConfirm(false);
    },
  });

  // Mutation for generating new cards
  const generateCardsMutation = useMutation({
    mutationFn: async (formData) => {
      return api.post(`/generate-cards/${deckId}`, formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
    },
    onSuccess: () => {
      refetchDeckData();
      queryClient.invalidateQueries(["decks"]);
      showSuccess("Cards generated successfully!");

      setGenerateFormData({
        totalRevenueEachPort: 250_000_000,
        totalContainerQuantityEachPort: 15,
        salesCallCountEachPort: 8,
        ports: 4,
        quantityStandardDeviation: 1,
        revenueStandardDeviation: 500_000,
      });

      setShowGenerateConfirm(false);
    },
    onError: (error) => {
      console.log("Error generating cards:", error);
      setGenerateErrors(error.response?.data?.errors || {});
      showError(error.response?.data?.message || "Failed to generate cards");
      setShowGenerateConfirm(false);
    },
  });

  // Loading message rotation effect
  useEffect(() => {
    let interval;
    if (generateCardsMutation.isPending) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [generateCardsMutation.isPending]);

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
    } catch (error) {
      showError("Failed to set container quantity");
    }
  };

  const handleDeleteAllCards = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    deleteCardsMutation.mutate();
  };

  const handleGenerateButtonClick = (e) => {
    e.preventDefault();
    setShowGenerateConfirm(true);
  };

  const handleConfirmGenerate = () => {
    generateCardsMutation.mutate(generateFormData);
  };

  const navBarTitle = deck.name || "Loading...";
  const isLoading = isLoadingDeck || generateCardsMutation.isPending || deleteCardsMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoading && <LoadingOverlay messages={loadingMessages} currentMessageIndex={loadingMessageIndex} title={generateCardsMutation.isPending ? "Generating Cards" : "Loading..."} />}

      <div className="container mx-auto px-4 py-6">
        <GenerateCardsNavbar title={navBarTitle} onBack={() => navigate(-1)} onInfoClick={() => setShowInfoModal(true)} onDeleteAllCards={handleDeleteAllCards} />

        <TabGroup>
          <TabList className="flex space-x-1 rounded-xl bg-white shadow-sm p-1 mb-6 mt-4">
            <Tab className={({ selected }) => `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? "bg-blue-500 text-white shadow" : "text-blue-600 hover:bg-blue-50"}`}>Configuration</Tab>
            <Tab className={({ selected }) => `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? "bg-blue-500 text-white shadow" : "text-blue-600 hover:bg-blue-50"}`}>Market Intelligence</Tab>
            <Tab className={({ selected }) => `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${selected ? "bg-blue-500 text-white shadow" : "text-blue-600 hover:bg-blue-50"}`}>Generated Cards</Tab>
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
                refreshData={refetchDeckData}
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
                <CardsPreviewPanel cards={salesCallCards} containers={containers} formatIDR={formatIDR} deckId={deckId} onCardUpdated={refetchDeckData} />
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>

        {/* Modals */}
        {showInfoModal && <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />}

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Delete All Cards"
          message="Are you sure you want to delete all cards in this deck? This action cannot be undone."
        />

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
