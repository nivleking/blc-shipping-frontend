import { useState, useEffect } from "react";
import { api } from "../../../axios/axios";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import PriceTablePanel from "./PriceTablePanel";
import ManualEntryPanel from "./ManualEntryPanel";
import UploadDataPanel from "./UploadDataPanel";
import useToast from "../../../toast/useToast";

const MarketIntelligencePanel = ({ deckId }) => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const queryClient = useQueryClient();
  const [selectedPorts, setSelectedPorts] = useState(4);
  const [availablePorts, setAvailablePorts] = useState({
    2: ["SBY", "MKS"],
    3: ["SBY", "MKS", "MDN"],
    4: ["SBY", "MKS", "MDN", "JYP"],
    5: ["SBY", "MKS", "MDN", "JYP", "BPN"],
    6: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS"],
    7: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR"],
    8: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH"],
    9: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH", "AMQ"],
    10: ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH", "AMQ", "SMR"],
  });
  const [marketIntelligenceName, setMarketIntelligenceName] = useState("");
  const [priceData, setPriceData] = useState({});

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
    onSuccess: (data) => {
      console.log("Market Intelligence Data Success:", data);
      if (data) {
        setMarketIntelligenceName(data.name);
        setPriceData(data.price_data);

        const portSet = new Set();
        Object.keys(data.price_data).forEach((key) => {
          const [origin] = key.split("-");
          portSet.add(origin);
        });
        setSelectedPorts(portSet.size);
      } else {
        setMarketIntelligenceName("New Market Intelligence");
        setPriceData({});
      }
    },
  });

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

      // Invalidate and refetch
      queryClient.invalidateQueries(["marketIntelligence", deckId]);
    },
    onError: (error) => {
      console.error("Error generating default market intelligence:", error);

      // Use our comprehensive price map as fallback
      const priceMap = getDefaultBasePriceMap();
      setPriceData(priceMap);
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

  const getDefaultBasePriceMap = () => {
    return {
      // SBY routes
      "SBY-MKS-Reefer": 27600000,
      "SBY-MKS-Dry": 16800000,
      "SBY-MDN-Reefer": 23000000,
      "SBY-MDN-Dry": 14000000,
      "SBY-JYP-Reefer": 32200000,
      "SBY-JYP-Dry": 19600000,
      "SBY-BPN-Reefer": 36800000,
      "SBY-BPN-Dry": 22400000,
      "SBY-BKS-Reefer": 26000000,
      "SBY-BKS-Dry": 15000000,
      "SBY-BGR-Reefer": 25000000,
      "SBY-BGR-Dry": 14000000,
      "SBY-BTH-Reefer": 27000000,
      "SBY-BTH-Dry": 16000000,
      "SBY-AMQ-Reefer": 32000000,
      "SBY-AMQ-Dry": 19000000,
      "SBY-SMR-Reefer": 29000000,
      "SBY-SMR-Dry": 17000000,

      // MDN routes
      "MDN-SBY-Reefer": 36800000,
      "MDN-SBY-Dry": 22400000,
      "MDN-MKS-Reefer": 23000000,
      "MDN-MKS-Dry": 14000000,
      "MDN-JYP-Reefer": 27600000,
      "MDN-JYP-Dry": 16800000,
      "MDN-BPN-Reefer": 32200000,
      "MDN-BPN-Dry": 19600000,
      "MDN-BKS-Reefer": 25000000,
      "MDN-BKS-Dry": 14000000,
      "MDN-BGR-Reefer": 24000000,
      "MDN-BGR-Dry": 13000000,
      "MDN-BTH-Reefer": 23000000,
      "MDN-BTH-Dry": 12000000,
      "MDN-AMQ-Reefer": 30000000,
      "MDN-AMQ-Dry": 18000000,
      "MDN-SMR-Reefer": 28000000,
      "MDN-SMR-Dry": 16000000,

      // MKS routes
      "MKS-SBY-Reefer": 32200000,
      "MKS-SBY-Dry": 19600000,
      "MKS-MDN-Reefer": 36800000,
      "MKS-MDN-Dry": 22400000,
      "MKS-JYP-Reefer": 23000000,
      "MKS-JYP-Dry": 14000000,
      "MKS-BPN-Reefer": 27600000,
      "MKS-BPN-Dry": 16800000,
      "MKS-BKS-Reefer": 23000000,
      "MKS-BKS-Dry": 13000000,
      "MKS-BGR-Reefer": 22000000,
      "MKS-BGR-Dry": 12000000,
      "MKS-BTH-Reefer": 26000000,
      "MKS-BTH-Dry": 15000000,
      "MKS-AMQ-Reefer": 28000000,
      "MKS-AMQ-Dry": 17000000,
      "MKS-SMR-Reefer": 27000000,
      "MKS-SMR-Dry": 16000000,

      // JYP routes
      "JYP-SBY-Reefer": 27600000,
      "JYP-SBY-Dry": 16800000,
      "JYP-MKS-Reefer": 36800000,
      "JYP-MKS-Dry": 22400000,
      "JYP-MDN-Reefer": 32200000,
      "JYP-MDN-Dry": 19600000,
      "JYP-BPN-Reefer": 23000000,
      "JYP-BPN-Dry": 14000000,
      "JYP-BKS-Reefer": 22000000,
      "JYP-BKS-Dry": 12000000,
      "JYP-BGR-Reefer": 21000000,
      "JYP-BGR-Dry": 11000000,
      "JYP-BTH-Reefer": 25000000,
      "JYP-BTH-Dry": 14000000,
      "JYP-AMQ-Reefer": 29000000,
      "JYP-AMQ-Dry": 18000000,
      "JYP-SMR-Reefer": 26000000,
      "JYP-SMR-Dry": 15000000,

      // BPN routes
      "BPN-SBY-Reefer": 27600000,
      "BPN-SBY-Dry": 16800000,
      "BPN-MKS-Reefer": 36800000,
      "BPN-MKS-Dry": 22400000,
      "BPN-MDN-Reefer": 32200000,
      "BPN-MDN-Dry": 19600000,
      "BPN-JYP-Reefer": 23000000,
      "BPN-JYP-Dry": 14000000,
      "BPN-BKS-Reefer": 23000000,
      "BPN-BKS-Dry": 13000000,
      "BPN-BGR-Reefer": 22000000,
      "BPN-BGR-Dry": 12000000,
      "BPN-BTH-Reefer": 25000000,
      "BPN-BTH-Dry": 15000000,
      "BPN-AMQ-Reefer": 28000000,
      "BPN-AMQ-Dry": 17000000,
      "BPN-SMR-Reefer": 24000000,
      "BPN-SMR-Dry": 14000000,

      // BKS routes
      "BKS-SBY-Reefer": 21000000,
      "BKS-SBY-Dry": 12000000,
      "BKS-MKS-Reefer": 23000000,
      "BKS-MKS-Dry": 13000000,
      "BKS-MDN-Reefer": 25000000,
      "BKS-MDN-Dry": 15000000,
      "BKS-JYP-Reefer": 22000000,
      "BKS-JYP-Dry": 12000000,
      "BKS-BPN-Reefer": 24000000,
      "BKS-BPN-Dry": 14000000,
      "BKS-BGR-Reefer": 20000000,
      "BKS-BGR-Dry": 11000000,
      "BKS-BTH-Reefer": 26000000,
      "BKS-BTH-Dry": 16000000,
      "BKS-AMQ-Reefer": 29000000,
      "BKS-AMQ-Dry": 18000000,
      "BKS-SMR-Reefer": 25000000,
      "BKS-SMR-Dry": 15000000,

      // BGR routes
      "BGR-SBY-Reefer": 22000000,
      "BGR-SBY-Dry": 13000000,
      "BGR-MKS-Reefer": 24000000,
      "BGR-MKS-Dry": 14000000,
      "BGR-MDN-Reefer": 26000000,
      "BGR-MDN-Dry": 16000000,
      "BGR-JYP-Reefer": 23000000,
      "BGR-JYP-Dry": 13000000,
      "BGR-BPN-Reefer": 25000000,
      "BGR-BPN-Dry": 15000000,
      "BGR-BKS-Reefer": 21000000,
      "BGR-BKS-Dry": 12000000,
      "BGR-BTH-Reefer": 27000000,
      "BGR-BTH-Dry": 17000000,
      "BGR-AMQ-Reefer": 30000000,
      "BGR-AMQ-Dry": 19000000,
      "BGR-SMR-Reefer": 26000000,
      "BGR-SMR-Dry": 16000000,

      // BTH routes
      "BTH-SBY-Reefer": 23000000,
      "BTH-SBY-Dry": 14000000,
      "BTH-MKS-Reefer": 25000000,
      "BTH-MKS-Dry": 15000000,
      "BTH-MDN-Reefer": 27000000,
      "BTH-MDN-Dry": 17000000,
      "BTH-JYP-Reefer": 24000000,
      "BTH-JYP-Dry": 14000000,
      "BTH-BPN-Reefer": 26000000,
      "BTH-BPN-Dry": 16000000,
      "BTH-BKS-Reefer": 22000000,
      "BTH-BKS-Dry": 13000000,
      "BTH-BGR-Reefer": 23000000,
      "BTH-BGR-Dry": 14000000,
      "BTH-AMQ-Reefer": 31000000,
      "BTH-AMQ-Dry": 20000000,
      "BTH-SMR-Reefer": 27000000,
      "BTH-SMR-Dry": 17000000,

      // AMQ routes
      "AMQ-SBY-Reefer": 24000000,
      "AMQ-SBY-Dry": 15000000,
      "AMQ-MKS-Reefer": 26000000,
      "AMQ-MKS-Dry": 16000000,
      "AMQ-MDN-Reefer": 28000000,
      "AMQ-MDN-Dry": 18000000,
      "AMQ-JYP-Reefer": 25000000,
      "AMQ-JYP-Dry": 15000000,
      "AMQ-BPN-Reefer": 27000000,
      "AMQ-BPN-Dry": 17000000,
      "AMQ-BKS-Reefer": 23000000,
      "AMQ-BKS-Dry": 14000000,
      "AMQ-BGR-Reefer": 24000000,
      "AMQ-BGR-Dry": 15000000,
      "AMQ-BTH-Reefer": 28000000,
      "AMQ-BTH-Dry": 18000000,
      "AMQ-SMR-Reefer": 25000000,
      "AMQ-SMR-Dry": 15000000,

      // SMR routes
      "SMR-SBY-Reefer": 25000000,
      "SMR-SBY-Dry": 16000000,
      "SMR-MKS-Reefer": 27000000,
      "SMR-MKS-Dry": 17000000,
      "SMR-MDN-Reefer": 29000000,
      "SMR-MDN-Dry": 19000000,
      "SMR-JYP-Reefer": 26000000,
      "SMR-JYP-Dry": 16000000,
      "SMR-BPN-Reefer": 28000000,
      "SMR-BPN-Dry": 18000000,
      "SMR-BKS-Reefer": 24000000,
      "SMR-BKS-Dry": 15000000,
      "SMR-BGR-Reefer": 25000000,
      "SMR-BGR-Dry": 16000000,
      "SMR-BTH-Reefer": 29000000,
      "SMR-BTH-Dry": 19000000,
      "SMR-AMQ-Reefer": 26000000,
      "SMR-AMQ-Dry": 16000000,
    };
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
              <PriceTablePanel marketIntelligenceData={marketIntelligenceData} selectedPorts={selectedPorts} priceData={priceData} generateDefaultPriceData={generateDefaultPriceData} isGenerating={generateDefaultMutation.isPending} />
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
