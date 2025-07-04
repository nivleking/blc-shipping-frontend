import React, { useEffect, useState } from "react";
import { BsExclamationTriangle } from "react-icons/bs";
import { PORT_ORDER } from "../../../assets/PortUtilities";

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const PenaltyTable = ({ penalties = {} }) => (
  <div className="bg-red-50 rounded-lg shadow-sm p-3 w-full lg:max-w-md">
    <h3 className="text-sm font-semibold text-red-800 mb-2">Rolled Container Penalties</h3>
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
            <td className="px-3 py-2 text-xs text-right text-red-600 font-medium">{formatPrice(penalties.dry_committed || 0)}</td>
            <td className="px-3 py-2 text-xs text-right text-red-600 font-medium">{formatPrice(penalties.dry_non_committed || 0)}</td>
          </tr>
          <tr className="hover:bg-red-50">
            <td className="px-3 py-2 text-xs text-red-900">Reefer</td>
            <td className="px-3 py-2 text-xs text-right text-red-600 font-medium">{formatPrice(penalties.reefer_committed || 0)}</td>
            <td className="px-3 py-2 text-xs text-right text-red-600 font-medium">{formatPrice(penalties.reefer_non_committed || 0)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const PriceTablePanel = ({ marketIntelligenceData, selectedPorts, isGenerating, priceData, penalties, generateDefaultPriceData }) => {
  const [currentPriceData, setCurrentPriceData] = useState({});
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    if (priceData && Object.keys(priceData).length > 0) {
      console.log("Setting price data from priceData prop:", priceData);
      setCurrentPriceData(priceData);
    } else if (marketIntelligenceData && marketIntelligenceData.price_data) {
      console.log("Setting price data from marketIntelligenceData:", marketIntelligenceData.price_data);
      setCurrentPriceData(marketIntelligenceData.price_data);
    } else {
      setCurrentPriceData({});
    }
  }, [marketIntelligenceData, priceData]);

  // Debug logging
  console.log("marketIntelligenceData:", marketIntelligenceData);
  console.log("currentPriceData:", currentPriceData);

  // Better check for market data existence
  const hasMarketData = (marketIntelligenceData?.price_data && Object.keys(marketIntelligenceData.price_data).length > 0) || (currentPriceData && Object.keys(currentPriceData).length > 0);

  if (!hasMarketData) {
    return (
      <div className="bg-yellow-50 p-8 rounded-lg shadow-sm border border-yellow-200">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full">
            <BsExclamationTriangle className="text-yellow-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-medium text-yellow-800">No Market Intelligence Data</h3>
          <p className="text-yellow-700 max-w-md">There is no market intelligence data available for this deck. Please create one using the Manual Entry tab or upload data using the Upload Data tab.</p>
          <button onClick={generateDefaultPriceData} disabled={isGenerating} className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${isGenerating ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"} transition-colors`}>
            {isGenerating ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Default Data"
            )}
          </button>
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
      <div className="flex grid-cols-2 justify-between gap-2 mb-2">
        <div className="bg-blue-50 rounded-lg p-4 flex-grow text-sm w-1/2">
          <h3 className="text-sm font-bold text-blue-800">Market Intelligence</h3>
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

        <div className="w-1/2">
          <PenaltyTable penalties={penalties} />
        </div>
      </div>

      {/* Horizontal Matrix Price Table */}
      <div className="overflow-x-auto mb-4 shadow rounded-lg">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-2 border-b border-r border-gray-200 text-xs font-medium text-gray-700 sticky left-0 bg-gray-100 z-10">From \ To</th>
              {ports.map((port) => (
                <th
                  key={port}
                  className={`py-2 px-2 border-b border-r border-gray-200 text-xs font-medium text-center
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
                <th className="py-2 px-2 border-b border-r border-gray-200 text-xs font-medium text-gray-700 bg-gray-100 sticky left-0 z-10">{origin}</th>
                {ports.map((destination) => {
                  if (origin === destination) {
                    return (
                      <td key={destination} className="py-2 px-2 border-b border-r border-gray-200 text-center bg-gray-100">
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
