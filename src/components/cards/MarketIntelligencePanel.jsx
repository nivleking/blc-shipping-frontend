import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { api } from "../../axios/axios";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import PriceTablePanel from "./PriceTablePanel";
import ManualEntryPanel from "./ManualEntryPanel";
import UploadDataPanel from "./UploadDataPanel";

const MarketIntelligencePanel = ({ deckId }) => {
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

      toast.success("Market intelligence data loaded from file");
    } else {
      toast.error("Invalid market intelligence data format");
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

      // Fallback: Generate empty structured data in frontend
      const ports = availablePorts[selectedPorts];
      const data = {};

      ports.forEach((origin) => {
        ports.forEach((destination) => {
          if (origin !== destination) {
            data[`${origin}-${destination}-Reefer`] = 25000000;
            data[`${origin}-${destination}-Dry`] = 15000000;
          }
        });
      });

      setPriceData(data);
      setMarketIntelligenceName("New Market Intelligence");
    }
  };

  const handlePriceChange = (origin, destination, type, value) => {
    setPriceData((prevData) => ({
      ...prevData,
      [`${origin}-${destination}-${type.charAt(0).toUpperCase() + type.slice(1)}`]: value,
    }));
  };

  const handlePortCountChange = (portCount) => {
    setSelectedPorts(portCount);

    // Update price data for new port selection
    const ports = availablePorts[portCount];
    const newData = {};

    // Preserve existing values
    ports.forEach((origin) => {
      ports.forEach((destination) => {
        if (origin !== destination) {
          const reeferKey = `${origin}-${destination}-Reefer`;
          const dryKey = `${origin}-${destination}-Dry`;

          newData[reeferKey] = priceData[reeferKey] || 25000000;
          newData[dryKey] = priceData[dryKey] || 15000000;
        }
      });
    });

    setPriceData(newData);
  };

  const handleSave = async () => {
    if (!deckId) {
      toast.error("No deck selected");
      return;
    }

    if (!marketIntelligenceName.trim()) {
      toast.error("Please enter a name for the market intelligence");
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
        toast.success("Market intelligence updated successfully");

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
        toast.success("Market intelligence created successfully");

        // Update the local state with the returned data
        setMarketIntelligenceData(response.data);
      }

      await fetchMarketIntelligenceList();
    } catch (error) {
      console.error("Error saving market intelligence:", error);
      toast.error("Failed to save market intelligence data");
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

      toast.success("Market intelligence data loaded");
    } catch (error) {
      console.error("Error loading market intelligence:", error);
      toast.error("Failed to load market intelligence data");
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
