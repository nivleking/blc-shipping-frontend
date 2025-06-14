import React, { useState, useEffect, useContext } from "react";
import { BsLightning, BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { api } from "../../../axios/axios";
import useToast from "../../../toast/useToast";
import { availablePorts } from "../../../assets/PortUtilities";
import { AppContext } from "../../../context/AppContext";

const AutoGeneratePanel = ({ formatIDR, generateFormData, handleGenerateChange, handlePortSelect, handleRevenueSelect, handleQuantitySelect, deckId, onGenerate }) => {
  const { showSuccess, showError } = useToast();
  const [marketIntelligenceData, setMarketIntelligenceData] = useState(null);
  const [isLoadingMI, setIsLoadingMI] = useState(false);
  const [miPortCount, setMiPortCount] = useState(0);
  const { token } = useContext(AppContext);

  // Fetch market intelligence data when component mounts or useMarketIntelligence changes
  useEffect(() => {
    if (deckId && generateFormData.useMarketIntelligence) {
      fetchMarketIntelligenceData();
    }
  }, [deckId, generateFormData.useMarketIntelligence]);

  // Simplify fetch function to use the direct one-to-one relationship
  const fetchMarketIntelligenceData = async () => {
    if (!deckId) return;

    setIsLoadingMI(true);
    try {
      const response = await api.get(`/market-intelligence/deck/${deckId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMarketIntelligenceData(response.data);

      // Count unique ports in the market intelligence data
      if (response.data && response.data.price_data) {
        const portSet = new Set();
        Object.keys(response.data.price_data).forEach((key) => {
          const [origin, destination] = key.split("-");
          portSet.add(origin);
          portSet.add(destination);
        });
        setMiPortCount(portSet.size);
        generateFormData.ports = portSet.size;
      }

      showSuccess("Market intelligence data loaded successfully");
    } catch (error) {
      console.error("Error fetching market intelligence:", error);
      setMarketIntelligenceData(null);
      showError("Could not load market intelligence data");
    } finally {
      setIsLoadingMI(false);
    }
  };

  // Toggle handler updated to fetch market intelligence when enabled
  const handleMarketIntelligenceToggle = (e) => {
    const useMarketIntelligence = e.target.checked;

    handleGenerateChange({
      target: {
        name: "useMarketIntelligence",
        value: useMarketIntelligence,
      },
    });

    if (useMarketIntelligence) {
      fetchMarketIntelligenceData();
    }
  };

  return (
    <div className="space-y-2">
      {/* Generation Summary at the top */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="text-xs font-semibold text-blue-800 mb-2">Generation Summary</h3>

        {/* Market Intelligence Toggle moved to top section */}
        <div className="bg-white p-4 rounded-lg border border-blue-100 mb-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">Use Market Intelligence</h4>
              <p className="text-xs text-gray-600">Use price data from market intelligence for card generation</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={generateFormData.useMarketIntelligence} onChange={handleMarketIntelligenceToggle} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Market Intelligence Status */}
          {generateFormData.useMarketIntelligence && (
            <div className="flex items-center gap-1 text-xs">
              {isLoadingMI ? (
                <div className="flex items-center gap-2 text-yellow-600">
                  <div className="animate-spin h-4 w-4 border-2 border-yellow-500 rounded-full border-t-transparent"></div>
                  <span>Checking market intelligence data...</span>
                </div>
              ) : marketIntelligenceData ? (
                <div className="flex items-center gap-2 text-green-600">
                  <BsCloudCheck />
                  <span>
                    Using <strong>{marketIntelligenceData.name}</strong> ({Object.keys(marketIntelligenceData.price_data || {}).length} price entries, {miPortCount} ports)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600">
                  <BsCloudSlash />
                  <span>No market intelligence found. Default prices will be used.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-2 text-xs">
          <div>
            <p className="text-gray-600">
              Total Cards: <span className="font-medium text-blue-800">{generateFormData.ports * generateFormData.salesCallCountEachPort}</span>
            </p>
            <p className="text-gray-600">
              Total Containers: <span className="font-medium text-blue-800">{generateFormData.ports * generateFormData.totalContainerQuantityEachPort}</span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              Total Revenue: <span className="font-medium text-blue-800">{formatIDR(generateFormData.ports * generateFormData.totalRevenueEachPort)}</span>
            </p>
            <p className="text-gray-600">
              Ports: <span className="font-medium text-blue-800">{generateFormData.useMarketIntelligence && miPortCount > 0 ? `${miPortCount} (from Market Intelligence)` : generateFormData.ports}</span>
            </p>
            <p className="text-xs text-gray-500 truncate">
              {generateFormData.useMarketIntelligence && miPortCount > 0 ? "Port selection determined by Market Intelligence" : `Selected ports: ${availablePorts[generateFormData.ports]?.join(", ")}`}
            </p>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button onClick={onGenerate} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md">
            <BsLightning className="text-xs" />
            <span className="font-medium text-xs">Generate Cards</span>
          </button>
        </div>
      </div>

      {/* Auto Form with the requested UI style */}
      <div className="bg-white rounded-xl shadow-sm p-2 space-y-2">
        <hr />

        {/* Total Ports */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-800">Total Ports</h3>
          <div className="space-y-2">
            <div className="relative">
              <input
                type="number"
                min="2"
                max="10"
                value={generateFormData.ports}
                onChange={(e) => handlePortSelect(parseInt(e.target.value) || 2)}
                disabled={generateFormData.useMarketIntelligence && miPortCount > 0}
                className={`text-xs w-full p-4 border-2 rounded-lg focus:outline-none focus:border-blue-500 ${generateFormData.useMarketIntelligence && miPortCount > 0 ? "bg-gray-100 text-gray-500" : ""}`}
                placeholder="Enter total ports (2-10)"
              />
              <span className="absolute bottom-2 right-2 text-xs text-gray-500">{generateFormData.useMarketIntelligence && miPortCount > 0 ? "Port count set by Market Intelligence" : "Enter total ports (2-10)"}</span>
            </div>

            {/* Available Ports Display */}
            <div className="mt-2 p-4 bg-white rounded-lg border border-blue-200">
              <div className="text-xs text-gray-600 mb-2">Available Ports:</div>
              <div className="flex flex-wrap gap-2">
                {availablePorts[generateFormData.ports]?.map((port) => (
                  <span key={port} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {port}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <hr />

        {/* Sales Call Revenue Configuration */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-800">Total Revenues per Port</h3>
          <div className="grid grid-cols-3 gap-4">
            {[250_000_000, 500_000_000, 750_000_000].map((revenue) => (
              <button
                key={revenue}
                onClick={() => handleRevenueSelect(revenue)}
                className={`text-xs p-4 rounded-lg border-2 transition-colors
                          ${generateFormData.totalRevenueEachPort === revenue ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
              >
                {formatIDR(revenue)}
              </button>
            ))}
            <div className="relative">
              <input
                type="number"
                name="totalRevenueEachPort"
                value={generateFormData.totalRevenueEachPort}
                onChange={(e) => handleRevenueSelect(parseInt(e.target.value) || 0)}
                placeholder="Edit revenue manually"
                className="text-xs w-full p-4 border-2 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <span className="absolute bottom-2 right-2 text-xs text-gray-500">Edit revenue manually</span>
            </div>
          </div>
        </div>

        <hr />

        {/* Sales Call Quantity Configuration */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-800">Total Containers per Port</h3>
          <div className="grid grid-cols-3 gap-4">
            {[15, 20, 25].map((quantity) => (
              <button
                key={quantity}
                onClick={() => handleQuantitySelect(quantity)}
                className={`text-xs p-4 rounded-lg border-2 transition-colors
                          ${generateFormData.totalContainerQuantityEachPort === quantity ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
              >
                {quantity} Containers
              </button>
            ))}
            <div className="relative">
              <input
                type="number"
                name="totalContainerQuantityEachPort"
                value={generateFormData.totalContainerQuantityEachPort}
                onChange={(e) => handleQuantitySelect(parseInt(e.target.value) || 0)}
                placeholder="Edit container quantity manually"
                min="1"
                max="100"
                className="text-xs w-full p-4 border-2 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <span className="absolute bottom-2 right-2 text-xs text-gray-500">Edit container quantity manually</span>
            </div>
          </div>
        </div>

        <hr />

        {/* Sales Call Count Per Port */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-800">Total Cards per Port</h3>
          <div className="relative">
            <input
              type="number"
              name="salesCallCountEachPort"
              value={generateFormData.salesCallCountEachPort}
              onChange={handleGenerateChange}
              min="2"
              max="15"
              className="text-xs w-full p-4 border-2 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Sales calls per port (2-15)"
            />
            <span className="absolute bottom-2 right-2 text-xs text-gray-500">Recommended: 5-10 calls</span>
          </div>
        </div>

        <hr />

        {/* Standard Deviation */}
        <div>
          <h3 className="text-xs font-semibold text-gray-800 mb-2">Distribution Variance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantityStandardDeviation" className="text-xs text-gray-600">
                Quantity Variance
              </label>
              <input
                type="number"
                name="quantityStandardDeviation"
                id="quantityStandardDeviation"
                value={generateFormData.quantityStandardDeviation}
                onChange={handleGenerateChange}
                step="0.1"
                min="0"
                max="2"
                className="w-full text-xs p-2 border-2 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">0 = Even distribution, 2 = Highly varied</p>
            </div>
            <div>
              <label htmlFor="revenueStandardDeviation" className="text-xs text-gray-600">
                Revenue Variance
              </label>
              <input
                type="number"
                name="revenueStandardDeviation"
                id="revenueStandardDeviation"
                value={generateFormData.revenueStandardDeviation}
                onChange={handleGenerateChange}
                min="0"
                max="2000000"
                step="100000"
                className="w-full text-xs p-2 border-2 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">0 = Even pricing, Higher = More varied</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoGeneratePanel;
