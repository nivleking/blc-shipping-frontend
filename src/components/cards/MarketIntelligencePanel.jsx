import { useState, useEffect } from "react";
import { api } from "../../axios/axios";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import PriceTablePanel from "./PriceTablePanel";
import ManualEntryPanel from "./ManualEntryPanel";
import UploadDataPanel from "./UploadDataPanel";
import useToast from "../../toast/useToast";

const MarketIntelligencePanel = ({ deckId }) => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [marketIntelligenceData, setMarketIntelligenceData] = useState(null);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [marketIntelligenceList, setMarketIntelligenceList] = useState([]);

  useEffect(() => {
    if (deckId) {
      loadMarketIntelligence();
      fetchMarketIntelligenceList();
    }
  }, [deckId]);

  const fetchMarketIntelligenceList = async () => {
    if (!deckId) return;

    try {
      const response = await api.get(`/decks/${deckId}/market-intelligence`);
      setMarketIntelligenceList(response.data);
    } catch (error) {
      console.error("Error loading market intelligence list:", error);
    }
  };

  const loadMarketIntelligence = async () => {
    if (!deckId) return;

    setIsLoading(true);
    try {
      // First check if any market intelligence exists at all to avoid 404 errors
      const listResponse = await api.get(`/decks/${deckId}/market-intelligence`);

      if (listResponse.data && listResponse.data.length > 0) {
        // If market intelligence data exists, get the active one
        const response = await api.get(`/decks/${deckId}/market-intelligence/active`);

        if (response.data) {
          setMarketIntelligenceData(response.data);
          setMarketIntelligenceName(response.data.name);
          setPriceData(response.data.price_data);

          // Determine number of ports based on data
          const portSet = new Set();
          Object.keys(response.data.price_data).forEach((key) => {
            const [origin] = key.split("-");
            portSet.add(origin);
          });
          setSelectedPorts(portSet.size);
        }
      } else {
        // No market intelligence exists yet
        setMarketIntelligenceData(null);
        setMarketIntelligenceName("New Market Intelligence");
        setPriceData({});
      }
    } catch (error) {
      console.error("Error loading market intelligence:", error);
      setMarketIntelligenceData(null);
      setMarketIntelligenceName("New Market Intelligence");
      setPriceData({});
    } finally {
      setIsLoading(false);
    }
  };

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

    try {
      // Try to generate using backend endpoint
      const response = await api.post(`/decks/${deckId}/market-intelligence/generate-default`);
      setMarketIntelligenceData(response.data);
      setMarketIntelligenceName(response.data.name);
      setPriceData(response.data.price_data);
    } catch (error) {
      console.error("Error generating default market intelligence:", error);

      // Use our comprehensive price map as fallback
      const priceMap = getDefaultBasePriceMap();
      setPriceData(priceMap);
      setMarketIntelligenceName("Default Market Intelligence");
    }
  };

  // Add this function to get the default base price map with exact values
  const getDefaultBasePriceMap = () => {
    return {
      // SBY routes
      "SBY-MKS-Reefer": 30000000,
      "SBY-MKS-Dry": 18000000,
      "SBY-MDN-Reefer": 11000000,
      "SBY-MDN-Dry": 6000000,
      "SBY-JYP-Reefer": 24000000,
      "SBY-JYP-Dry": 16200000,
      "SBY-BPN-Reefer": 28000000,
      "SBY-BPN-Dry": 17000000,
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
      "MDN-SBY-Reefer": 22000000,
      "MDN-SBY-Dry": 13000000,
      "MDN-MKS-Reefer": 24000000,
      "MDN-MKS-Dry": 14000000,
      "MDN-JYP-Reefer": 22000000,
      "MDN-JYP-Dry": 14000000,
      "MDN-BPN-Reefer": 26000000,
      "MDN-BPN-Dry": 15000000,
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
      "MKS-SBY-Reefer": 18000000,
      "MKS-SBY-Dry": 10000000,
      "MKS-MDN-Reefer": 20000000,
      "MKS-MDN-Dry": 12000000,
      "MKS-JYP-Reefer": 24000000,
      "MKS-JYP-Dry": 16000000,
      "MKS-BPN-Reefer": 25000000,
      "MKS-BPN-Dry": 15000000,
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
      "JYP-SBY-Reefer": 19000000,
      "JYP-SBY-Dry": 13000000,
      "JYP-MKS-Reefer": 23000000,
      "JYP-MKS-Dry": 13000000,
      "JYP-MDN-Reefer": 17000000,
      "JYP-MDN-Dry": 11000000,
      "JYP-BPN-Reefer": 24000000,
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
      "BPN-SBY-Reefer": 20000000,
      "BPN-SBY-Dry": 12000000,
      "BPN-MKS-Reefer": 22000000,
      "BPN-MKS-Dry": 13000000,
      "BPN-MDN-Reefer": 24000000,
      "BPN-MDN-Dry": 14000000,
      "BPN-JYP-Reefer": 21000000,
      "BPN-JYP-Dry": 12000000,
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
    if (!deckId) {
      showError("No deck selected");
      return;
    }

    if (!marketIntelligenceName.trim()) {
      showError("Please enter a name for the market intelligence");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: marketIntelligenceName,
        price_data: priceData,
      };

      // If we already have market intelligence data, update it
      if (marketIntelligenceData?.id) {
        await api.put(`/market-intelligence/${marketIntelligenceData.id}`, payload);
        showSuccess("Market intelligence updated successfully");

        // Update the local state with the new data to ensure UI reflects changes
        setMarketIntelligenceData({
          ...marketIntelligenceData,
          name: marketIntelligenceName,
          price_data: priceData,
          updated_at: new Date().toISOString(),
        });
      } else {
        // Otherwise, create new
        const response = await api.post(`/decks/${deckId}/market-intelligence`, payload);
        showSuccess("Market intelligence created successfully");

        // Update the local state with the returned data
        setMarketIntelligenceData(response.data);
      }

      await fetchMarketIntelligenceList();
    } catch (error) {
      console.error("Error saving market intelligence:", error);
      showError("Failed to save market intelligence data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectExisting = async (id) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/market-intelligence/${id}`);
      setMarketIntelligenceData(response.data);
      setMarketIntelligenceName(response.data.name);
      setPriceData(response.data.price_data);

      // Determine number of ports based on data
      const portSet = new Set();
      Object.keys(response.data.price_data).forEach((key) => {
        const [origin] = key.split("-");
        portSet.add(origin);
      });
      setSelectedPorts(portSet.size);

      showSuccess("Market intelligence data loaded");
    } catch (error) {
      console.error("Error loading market intelligence:", error);
      showError("Failed to load market intelligence data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Market Intelligence</h2>
        <div className="space-x-2">
          <button onClick={handleSave} disabled={isSubmitting || !deckId} className={`px-4 py-2 rounded text-white ${isSubmitting || !deckId ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}>
            {isSubmitting ? "Saving..." : "Save Market Intelligence"}
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
              <PriceTablePanel marketIntelligenceData={marketIntelligenceData} selectedPorts={selectedPorts} priceData={priceData} generateDefaultPriceData={generateDefaultPriceData} />
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
              <UploadDataPanel
                handleUpload={handleUpload}
                //marketIntelligenceList={marketIntelligenceList}
                // handleSelectExisting={handleSelectExisting}
              />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      )}
    </div>
  );
};

export default MarketIntelligencePanel;
