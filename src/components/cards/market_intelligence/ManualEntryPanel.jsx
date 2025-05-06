import React, { useState, useEffect } from "react";
import { PORT_ORDER } from "../../../assets/PortUtilities";

// Format number as IDR currency
const formatToIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Parse IDR formatted string back to number
const parseFromIDR = (formattedValue) => {
  if (!formattedValue) return 0;
  return parseInt(formattedValue.replace(/[^\d]/g, "")) || 0;
};

const PenaltyTable = ({ penalties = {}, onPenaltyChange }) => {
  const safePenalties = penalties || {};
  return (
    <div className="bg-red-50 rounded-lg shadow-sm p-4 mb-2">
      <h3 className="text-sm font-semibold text-red-800 mb-3">Rolled Container Penalties</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-red-200">
          <thead className="bg-red-100">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-red-700 uppercase">Type</th>
              <th className="px-2 py-2 text-right text-xs font-medium text-red-700 uppercase">Committed</th>
              <th className="px-2 py-2 text-right text-xs font-medium text-red-700 uppercase">Non-Committed</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-red-200">
            <tr className="hover:bg-red-50">
              <td className="px-2 py-2 text-sm text-red-900">Dry</td>
              <td className="px-2 py-2 text-sm text-right">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">IDR</span>
                  <input
                    type="text"
                    value={formatToIDR(safePenalties.dry_committed || 0).replace("Rp", "")}
                    onChange={(e) => onPenaltyChange("dry_committed", parseFromIDR(e.target.value))}
                    className="w-full pl-12 p-2 border border-red-300 rounded text-red-600 font-medium text-right"
                  />
                </div>
              </td>
              <td className="px-2 py-2 text-sm text-right">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">IDR</span>
                  <input
                    type="text"
                    value={formatToIDR(safePenalties.dry_non_committed || 0).replace("Rp", "")}
                    onChange={(e) => onPenaltyChange("dry_non_committed", parseFromIDR(e.target.value))}
                    className="w-full pl-12 p-2 border border-red-300 rounded text-red-600 font-medium text-right"
                  />
                </div>
              </td>
            </tr>
            <tr className="hover:bg-red-50">
              <td className="px-2 py-2 text-sm text-red-900">Reefer</td>
              <td className="px-2 py-2 text-sm text-right">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">IDR</span>
                  <input
                    type="text"
                    value={formatToIDR(safePenalties.reefer_committed || 0).replace("Rp", "")}
                    onChange={(e) => onPenaltyChange("reefer_committed", parseFromIDR(e.target.value))}
                    className="w-full pl-12 p-2 border border-red-300 rounded text-red-600 font-medium text-right"
                  />
                </div>
              </td>
              <td className="px-2 py-2 text-sm text-right">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">IDR</span>
                  <input
                    type="text"
                    value={formatToIDR(safePenalties.reefer_non_committed || 0).replace("Rp", "")}
                    onChange={(e) => onPenaltyChange("reefer_non_committed", parseFromIDR(e.target.value))}
                    className="w-full pl-12 p-2 border border-red-300 rounded text-red-600 font-medium text-right"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ManualEntryPanel = ({ marketIntelligenceName, setMarketIntelligenceName, selectedPorts, availablePorts, handlePortCountChange, priceData, handlePriceChange, penalties, handlePenaltyChange }) => {
  const [hoveredCell, setHoveredCell] = useState(null); // Track hovered cell for highlighting
  const [displayedPriceData, setDisplayedPriceData] = useState({});

  // Format the price data for display
  useEffect(() => {
    setDisplayedPriceData(priceData);
  }, [priceData]);

  const highlightRow = (origin) => {
    setHoveredCell({ row: origin, col: null });
  };

  const highlightColumn = (destination) => {
    setHoveredCell({ row: null, col: destination });
  };

  const clearHighlight = () => {
    setHoveredCell(null);
  };

  // Sort ports according to the standard order
  const ports = [...availablePorts[selectedPorts]].sort((a, b) => {
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

  return (
    <div className="space-y-4">
      <div className="mb-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Market Intelligence Name</label>
          <input type="text" value={marketIntelligenceName} onChange={(e) => setMarketIntelligenceName(e.target.value)} className="mt-1 p-2 w-full border border-gray-300 rounded-md text-sm" placeholder="Enter a name" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Port Count</label>
          <select value={selectedPorts} onChange={(e) => handlePortCountChange(parseInt(e.target.value))} className="mt-1 p-2 w-full border border-gray-300 rounded-md text-sm">
            {Object.keys(availablePorts).map((count) => (
              <option key={count} value={count}>
                {count} Ports
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Changing port count will reset price data for ports no longer in selection</p>
        </div>
      </div>

      {/* Enhanced Matrix Price Editor */}
      <div className="mb-8 overflow-x-auto rounded-lg border border-gray-200 shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-2 border-b border-r border-gray-200 text-sm font-medium text-gray-700 sticky left-0 z-10 bg-gray-100">From \ To</th>
              {ports.map((port) => (
                <th
                  key={port}
                  className={`py-2 px-2 border-b border-r border-gray-200 text-sm font-medium text-center
                    ${hoveredCell?.col === port ? "bg-blue-50" : ""}`}
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
                <th className="py-2 px-2 border-b border-r border-gray-200 text-sm font-medium text-gray-700 sticky left-0 z-10 bg-gray-50">{origin}</th>
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
                      className={`py-2 px-3 border-b border-r border-gray-200 transition-colors
                        ${isHighlighted ? "bg-blue-50" : ""}`}
                    >
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between space-x-1">
                          <label className="text-xs font-medium text-blue-600 flex-shrink-0">Reefer:</label>
                          <input
                            type="text"
                            value={formatToIDR(displayedPriceData[reeferKey] || 0)}
                            onChange={(e) => handlePriceChange(origin, destination, "reefer", parseFromIDR(e.target.value))}
                            className="w-24 p-1 text-xs border border-gray-300 rounded text-right bg-blue-50"
                            title={`${origin} to ${destination} - Reefer price`}
                          />
                        </div>
                        <div className="flex items-center justify-between space-x-1">
                          <label className="text-xs font-medium text-green-600 flex-shrink-0">Dry:</label>
                          <input
                            type="text"
                            value={formatToIDR(displayedPriceData[dryKey] || 0)}
                            onChange={(e) => handlePriceChange(origin, destination, "dry", parseFromIDR(e.target.value))}
                            className="w-24 p-1 text-xs border border-gray-300 rounded text-right bg-green-50"
                            title={`${origin} to ${destination} - Dry price`}
                          />
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

      <PenaltyTable penalties={penalties} onPenaltyChange={handlePenaltyChange} />
    </div>
  );
};

export default ManualEntryPanel;
