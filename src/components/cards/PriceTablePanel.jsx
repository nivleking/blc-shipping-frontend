import React, { useEffect, useState } from "react";
import { BsExclamationTriangle } from "react-icons/bs";

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const PenaltyTable = () => (
  <div className="bg-red-50 rounded-lg shadow-sm p-3 mb-4 w-full lg:max-w-md ml-auto">
    <h3 className="text-sm font-semibold text-red-800 mb-2">Penalties per Container</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-red-200">
        <thead className="bg-red-100">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-red-700 uppercase">Type</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-red-700 uppercase">Committed</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-red-700 uppercase">Non-Committed</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-red-200">
          <tr className="hover:bg-red-50">
            <td className="px-3 py-2 text-xs text-red-900">Dry</td>
            <td className="px-3 py-2 text-xs text-right text-red-600 font-medium">8,000,000</td>
            <td className="px-3 py-2 text-xs text-right text-red-600 font-medium">4,000,000</td>
          </tr>
          <tr className="hover:bg-red-50">
            <td className="px-3 py-2 text-xs text-red-900">Reefer</td>
            <td className="px-3 py-2 text-xs text-right text-red-600 font-medium">15,000,000</td>
            <td className="px-3 py-2 text-xs text-right text-red-600 font-medium">9,000,000</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// Define the standard port order to match ManualEntryPanel
const PORT_ORDER = ["SBY", "MKS", "MDN", "JYP", "BPN", "BKS", "BGR", "BTH", "AMQ", "SMR"];

const PriceTablePanel = ({ marketIntelligenceData, selectedPorts, priceData, generateDefaultPriceData }) => {
  const [currentPriceData, setCurrentPriceData] = useState(priceData);
  const [hoveredCell, setHoveredCell] = useState(null); // Track hovered cell for highlighting

  useEffect(() => {
    setCurrentPriceData(priceData);
  }, [priceData]);

  // Update the check for market intelligence data
  const hasMarketData = marketIntelligenceData && marketIntelligenceData.price_data && Object.keys(marketIntelligenceData.price_data).length > 0;

  // Update the empty state to include a button to generate default data
  if (!hasMarketData) {
    return (
      <div className="bg-yellow-50 p-8 rounded-lg shadow-sm border border-yellow-200">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full">
            <BsExclamationTriangle className="text-yellow-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-medium text-yellow-800">No Market Intelligence Data</h3>
          <p className="text-yellow-700 max-w-md">There is no market intelligence data available for this deck. Please create one using the Manual Entry tab or upload data using the Upload Data tab.</p>
          {/* Add Generate Default button */}
          <button onClick={generateDefaultPriceData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Generate Default Data
          </button>
          <div className="flex space-x-2 mt-2">
            <div className="bg-white border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-800">
              <span className="font-medium">Tip:</span> Market intelligence data provides pricing information for shipping routes
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract all unique origins and destinations from price data
  const portSet = new Set();
  Object.keys(currentPriceData).forEach((key) => {
    const [origin, destination] = key.split("-");
    portSet.add(origin);
    portSet.add(destination);
  });

  // Sort ports according to the standard order
  const ports = Array.from(portSet).sort((a, b) => {
    const indexA = PORT_ORDER.indexOf(a);
    const indexB = PORT_ORDER.indexOf(b);

    // If both ports are in the order array, use that order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only one port is in the array, prioritize it
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // Default to alphabetical sorting for any ports not in the predefined order
    return a.localeCompare(b);
  });

  const highlightRow = (origin) => {
    setHoveredCell({ row: origin, col: null });
  };

  const highlightColumn = (destination) => {
    setHoveredCell({ row: null, col: destination });
  };

  const clearHighlight = () => {
    setHoveredCell(null);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 flex-grow">
          <h3 className="text-lg font-semibold text-blue-800">Active Market Intelligence</h3>
          <p className="text-blue-700">
            <span className="font-medium">Name:</span> {marketIntelligenceData?.name || "Untitled"}
          </p>
          <p className="text-blue-700">
            <span className="font-medium">Ports:</span> {selectedPorts}
          </p>
          <p className="text-blue-700">
            <span className="font-medium">Last Updated:</span> {marketIntelligenceData?.updated_at ? new Date(marketIntelligenceData.updated_at).toLocaleString() : "Never"}
          </p>
        </div>

        <PenaltyTable />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Price Configuration</h3>
        <p className="text-sm text-gray-600 mb-4">These are the current base rates for container shipping between ports. These rates are used as reference values during sales call generation.</p>
      </div>

      {/* Horizontal Matrix Price Table */}
      <div className="overflow-x-auto mb-8 shadow rounded-lg">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 border-b border-r border-gray-200 text-sm font-medium text-gray-700 sticky left-0 bg-gray-100 z-10">From \ To</th>
              {ports.map((port) => (
                <th
                  key={port}
                  className={`py-3 px-4 border-b border-r border-gray-200 text-sm font-medium text-center
                    ${hoveredCell?.col === port ? "bg-blue-50" : "bg-gray-50"}`}
                  onMouseEnter={() => highlightColumn(port)}
                  onMouseLeave={clearHighlight}
                >
                  {port}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ports.map((origin) => (
              <tr key={origin} className={hoveredCell?.row === origin ? "bg-blue-50" : "hover:bg-gray-50"} onMouseEnter={() => highlightRow(origin)} onMouseLeave={clearHighlight}>
                <th className="py-3 px-4 border-b border-r border-gray-200 text-sm font-medium text-gray-700 bg-gray-100 sticky left-0 z-10">{origin}</th>
                {ports.map((destination) => {
                  if (origin === destination) {
                    return (
                      <td key={destination} className="py-3 px-4 border-b border-r border-gray-200 text-center bg-gray-100">
                        <span className="text-gray-400">—</span>
                      </td>
                    );
                  }

                  const reeferKey = `${origin}-${destination}-Reefer`;
                  const dryKey = `${origin}-${destination}-Dry`;

                  const isHighlighted = hoveredCell?.row === origin || hoveredCell?.col === destination;

                  return (
                    <td
                      key={destination}
                      className={`py-3 px-3 border-b border-r border-gray-200 transition-colors
                        ${isHighlighted ? "bg-blue-50" : ""}`}
                    >
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-blue-600">Reefer:</span>
                          <span className="text-xs font-semibold text-gray-700 bg-blue-50 px-2 py-1 rounded">{formatPrice(currentPriceData[reeferKey] || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-green-600">Dry:</span>
                          <span className="text-xs font-semibold text-gray-700 bg-green-50 px-2 py-1 rounded">{formatPrice(currentPriceData[dryKey] || 0)}</span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceTablePanel;
