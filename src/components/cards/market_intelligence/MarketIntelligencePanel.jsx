import { useState, useEffect } from "react";
import { api } from "../../../axios/axios";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PriceTablePanel from "./PriceTablePanel";
import ManualEntryPanel from "./ManualEntryPanel";
import UploadDataPanel from "./UploadDataPanel";
import useToast from "../../../toast/useToast";
import { getUnrolledPenalties, getDefaultBasePriceMap, availablePorts } from "../../../assets/PortUtilities";

const MarketIntelligencePanel = ({ deckId }) => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const queryClient = useQueryClient();
  const [selectedPorts, setSelectedPorts] = useState(5);
  const [marketIntelligenceName, setMarketIntelligenceName] = useState("");
  const [priceData, setPriceData] = useState({});
  const [penalties, setPenalties] = useState({
    dry_committed: 0,
    dry_non_committed: 0,
    reefer_committed: 0,
    reefer_non_committed: 0,
  });

  // Fetch market intelligence data
  const {
    data: marketIntelligenceData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["marketIntelligence", deckId],
    queryFn: async () => {
      if (!deckId) return null;
      try {
        const response = await api.get(`/market-intelligence/deck/${deckId}`);
        console.log("Market Intelligence API Response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching market intelligence:", error);
        throw error;
      }
    },
    enabled: !!deckId,
  });

  useEffect(() => {
    console.log("Market Intelligence Data Effect:", marketIntelligenceData);
    if (marketIntelligenceData) {
      setMarketIntelligenceName(marketIntelligenceData.name);
      setPriceData(marketIntelligenceData.price_data);

      if (marketIntelligenceData.penalties) {
        setPenalties(marketIntelligenceData.penalties);
      }

      const portSet = new Set();
      Object.keys(marketIntelligenceData.price_data).forEach((key) => {
        const [origin] = key.split("-");
        portSet.add(origin);
      });
      setSelectedPorts(portSet.size);
    } else if (!isLoading && deckId) {
      setMarketIntelligenceName("New Market Intelligence");
      setPriceData({});
      setPenalties({});
    }
  }, [marketIntelligenceData, isLoading, deckId]);

  const handlePenaltyChange = (key, value) => {
    setPenalties((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      return api.post(`/market-intelligence/deck/${deckId}`, payload);
    },
    onSuccess: (response) => {
      showSuccess("Market intelligence saved successfully");
      queryClient.invalidateQueries(["marketIntelligence", deckId]);
    },
    onError: (error) => {
      console.error("Error saving market intelligence:", error);
      showError("Failed to save market intelligence data");
    },
  });

  // Generate default data mutation
  const generateDefaultMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/market-intelligence/deck/${deckId}/generate-default`);
    },
    onSuccess: (response) => {
      showSuccess("Default market intelligence data generated");
      setMarketIntelligenceName(response.data.name);
      setPriceData(response.data.price_data);
      setPenalties(response.data.penalties);

      // Invalidate and refetch
      queryClient.invalidateQueries(["marketIntelligence", deckId]);
    },
    onError: (error) => {
      console.error("Error generating default market intelligence:", error);

      // Use our comprehensive price map as fallback
      const priceMap = getDefaultBasePriceMap();
      setPriceData(priceMap);

      const unrolledPenalties = getUnrolledPenalties();
      setPenalties(unrolledPenalties);

      setMarketIntelligenceName("Default Market Intelligence");
    },
  });

  const handleUpload = (data) => {
    if (data.price_data) {
      setPriceData(data.price_data);
      if (data.name) setMarketIntelligenceName(data.name);

      // Determine number of ports based on uploaded data
      const portSet = new Set();
      Object.keys(data.price_data).forEach((key) => {
        const [origin] = key.split("-");
        portSet.add(origin);
      });
      if (portSet.size > 0) {
        setSelectedPorts(portSet.size);
      }

      showSuccess("Market intelligence data loaded from file");
    } else {
      showError("Invalid market intelligence data format");
    }
  };

  const generateDefaultPriceData = async () => {
    if (!deckId) return;
    generateDefaultMutation.mutate();
  };

  const handlePriceChange = (origin, destination, type, value) => {
    setPriceData((prevData) => ({
      ...prevData,
      [`${origin}-${destination}-${type.charAt(0).toUpperCase() + type.slice(1)}`]: value,
    }));
  };

  const handlePortCountChange = (portCount) => {
    setSelectedPorts(portCount);

    const ports = availablePorts[portCount];

    const defaultPriceMap = getDefaultBasePriceMap();
    const newPriceData = {};

    ports.forEach((origin) => {
      ports.forEach((destination) => {
        if (origin !== destination) {
          const reeferKey = `${origin}-${destination}-Reefer`;
          const dryKey = `${origin}-${destination}-Dry`;

          if (defaultPriceMap[reeferKey]) {
            newPriceData[reeferKey] = defaultPriceMap[reeferKey];
          }

          if (defaultPriceMap[dryKey]) {
            newPriceData[dryKey] = defaultPriceMap[dryKey];
          }
        }
      });
    });

    setPriceData(newPriceData);
  };

  const handleSave = async () => {
    if (!marketIntelligenceName.trim()) {
      showError("Please enter a name for the market intelligence");
      return;
    }

    const payload = {
      name: marketIntelligenceName,
      price_data: priceData,
      penalties: penalties,
    };

    saveMutation.mutate(payload);
  };

  // Loading state from React Query
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  // Error state from React Query
  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">Error loading market intelligence data. Please try again.</p>
          </div>
          <div className="ml-auto pl-3">
            <button onClick={() => queryClient.invalidateQueries(["marketIntelligence", deckId])} className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded text-xs">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Market Intelligence</h2>
        <div className="space-x-2">
          <button onClick={handleSave} disabled={saveMutation.isPending || !deckId} className={`px-4 py-2 rounded text-white ${saveMutation.isPending || !deckId ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}>
            {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {!deckId ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <p className="text-yellow-700">Please select a deck to manage market intelligence data.</p>
        </div>
      ) : (
        <TabGroup>
          <TabList className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                ${selected ? "bg-white shadow text-blue-700" : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"}`
              }
            >
              Price Tables
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                ${selected ? "bg-white shadow text-blue-700" : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"}`
              }
            >
              Manual Entry
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                ${selected ? "bg-white shadow text-blue-700" : "text-blue-600 hover:bg-white/[0.12] hover:text-blue-700"}`
              }
            >
              Upload Data
            </Tab>
          </TabList>

          <TabPanels>
            {/* Price Tables Panel */}
            <TabPanel>
              <PriceTablePanel
                marketIntelligenceData={marketIntelligenceData}
                selectedPorts={selectedPorts}
                priceData={priceData}
                penalties={penalties}
                generateDefaultPriceData={generateDefaultPriceData}
                isGenerating={generateDefaultMutation.isPending}
              />
            </TabPanel>

            {/* Manual Entry Panel */}
            <TabPanel>
              <ManualEntryPanel
                marketIntelligenceName={marketIntelligenceName}
                setMarketIntelligenceName={setMarketIntelligenceName}
                selectedPorts={selectedPorts}
                availablePorts={availablePorts}
                handlePortCountChange={handlePortCountChange}
                priceData={priceData}
                handlePriceChange={handlePriceChange}
                penalties={penalties}
                handlePenaltyChange={handlePenaltyChange}
              />
            </TabPanel>

            {/* Upload Data Panel */}
            <TabPanel>
              <UploadDataPanel handleUpload={handleUpload} />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      )}
    </div>
  );
};

export default MarketIntelligencePanel;
