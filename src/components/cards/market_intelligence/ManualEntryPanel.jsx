import React, { useState, useEffect } from "react";

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

const PriceTable = ({ origin, prices, onPriceChange }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">Origin: {origin}</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reefer</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Dry</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {prices.map((price, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{price.destination}</td>
              <td className="px-4 py-3 text-sm text-right">
                <input
                  type="text"
                  value={formatToIDR(price.reefer)}
                  onChange={(e) => onPriceChange(origin, price.destination, "reefer", parseFromIDR(e.target.value))}
                  className="w-32 p-1 border border-gray-300 rounded text-blue-600 font-medium text-right"
                  step="50000"
                />
              </td>
              <td className="px-4 py-3 text-sm text-right">
                <input
                  type="text"
                  value={formatToIDR(price.dry)}
                  onChange={(e) => onPriceChange(origin, price.destination, "dry", parseFromIDR(e.target.value))}
                  className="w-32 p-1 border border-gray-300 rounded text-green-600 font-medium text-right"
                  step="50000"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PenaltyTable = () => (
  <div className="bg-red-50 rounded-lg shadow-sm p-4">
    <h3 className="text-lg font-semibold text-red-800 mb-3">Penalties per Container</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-red-200">
        <thead className="bg-red-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Type</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-red-700 uppercase">Committed</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-red-700 uppercase">Non-Committed</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-red-200">
          <tr className="hover:bg-red-50">
            <td className="px-4 py-3 text-sm text-red-900">Dry</td>
            <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">0</td>
            <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">0</td>
          </tr>
          <tr className="hover:bg-red-50">
            <td className="px-4 py-3 text-sm text-red-900">Reefer</td>
            <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">0</td>
            <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">0</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const ManualEntryPanel = ({ marketIntelligenceName, setMarketIntelligenceName, selectedPorts, availablePorts, handlePortCountChange, priceData, handlePriceChange }) => {
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

  // Define the standard port order
  const PORT_ORDER = ["SBY", "MDN", "MKS", "JYP", "BPN", "BKS", "BGR", "BTH", "AMQ", "SMR"];

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
    <div className="space-y-6">
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Market Intelligence Name</label>
          <input type="text" value={marketIntelligenceName} onChange={(e) => setMarketIntelligenceName(e.target.value)} className="mt-1 p-2 w-full border border-gray-300 rounded-md" placeholder="Enter a name" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Port Count</label>
          <select value={selectedPorts} onChange={(e) => handlePortCountChange(parseInt(e.target.value))} className="mt-1 p-2 w-full border border-gray-300 rounded-md">
            {Object.keys(availablePorts).map((count) => (
              <option key={count} value={count}>
                {count} Ports
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Changing port count will reset price data for ports no longer in selection</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Price Configuration</h3>
        <p className="text-sm text-gray-600 mb-4">Set the base rates for container shipping between ports. These rates will be used as reference values during sales call generation.</p>
      </div>

      {/* Enhanced Matrix Price Editor */}
      <div className="mb-8 overflow-x-auto rounded-lg border border-gray-200 shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 border-b border-r border-gray-200 text-sm font-medium text-gray-700 sticky left-0 z-10 bg-gray-100">From \ To</th>
              {ports.map((port) => (
                <th
                  key={port}
                  className={`py-3 px-4 border-b border-r border-gray-200 text-sm font-medium text-center
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
                <th className="py-3 px-4 border-b border-r border-gray-200 text-sm font-medium text-gray-700 sticky left-0 z-10 bg-gray-50">{origin}</th>
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

      <PenaltyTable />
    </div>
  );
};

export default ManualEntryPanel;
