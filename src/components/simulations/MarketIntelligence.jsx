import { useState, useEffect, useContext } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { api } from "../../axios/axios";
import { AppContext } from "../../context/AppContext";

const MarketIntelligence = ({ port, roomId, deckId }) => {
  const { token } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [priceData, setPriceData] = useState({});
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("matrix"); // 'matrix' or 'list'
  const [filterType, setFilterType] = useState("all"); // 'all', 'dry', 'reefer'

  useEffect(() => {
    if (deckId) {
      fetchMarketData();
    }
  }, [deckId, token, roomId]);

  const fetchMarketData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get active market intelligence for this deck
      const response = await api.get(`/decks/${deckId}/market-intelligence/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.price_data) {
        setPriceData(response.data.price_data);
      } else {
        setError("No market intelligence data available for this simulation");
      }
    } catch (error) {
      console.error("Error fetching market intelligence data:", error);
      setError("Failed to load market intelligence data");
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency function
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Helper to group price data by origin
  const groupByOrigin = (priceData) => {
    const grouped = {};

    if (!priceData) return {};

    Object.entries(priceData).forEach(([key, value]) => {
      const parts = key.split("-");
      if (parts.length !== 3) return;

      const [origin, destination, type] = parts;

      if (!grouped[origin]) {
        grouped[origin] = [];
      }

      grouped[origin].push({
        destination,
        type: type.toLowerCase(),
        price: value,
      });
    });

    return grouped;
  };

  const getPorts = () => {
    const portsSet = new Set();

    if (!priceData) return [];

    Object.keys(priceData).forEach((key) => {
      const parts = key.split("-");
      if (parts.length === 3) {
        portsSet.add(parts[0]); // Origin
        portsSet.add(parts[1]); // Destination
      }
    });

    // Remove user's port from the set to avoid duplication
    if (port) {
      portsSet.delete(port);
    }

    // Create sorted array of other ports
    const otherPorts = Array.from(portsSet).sort();

    // Return array with user's port first, then others alphabetically
    return port ? [port, ...otherPorts] : otherPorts;
  };

  // Filter data based on type selection
  const getFilteredPriceData = () => {
    if (!priceData) return {};

    if (filterType === "all") {
      return priceData;
    }

    const filtered = {};
    Object.entries(priceData).forEach(([key, value]) => {
      if (key.toLowerCase().endsWith(filterType.toLowerCase())) {
        filtered[key] = value;
      }
    });

    return filtered;
  };

  const handleTypeChange = (newType) => {
    setFilterType(newType);
  };

  const handleViewChange = (newView) => {
    setViewMode(newView);
  };

  // Generate matrix view
  const renderMatrixView = () => {
    const ports = getPorts();
    const filteredData = getFilteredPriceData();

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">Origin / Destination</th>
              {ports.map((destination) => (
                <th
                  key={destination}
                  className={`px-4 py-3 text-center text-xs font-medium tracking-wider border-r
                    ${destination === port ? "bg-blue-100 text-blue-800 uppercase font-bold" : "text-gray-500 uppercase"}`}
                >
                  {destination === port ? `${destination} ★` : destination}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ports.map((origin) => (
              <tr key={origin} className={origin === port ? "bg-blue-50" : ""}>
                <td
                  className={`px-4 py-3 text-sm font-medium border-r 
                    ${origin === port ? "bg-blue-100 text-blue-800 font-bold" : "text-gray-900"}`}
                >
                  {origin === port ? `${origin} (Your Port)` : origin}
                </td>
                {ports.map((destination) => {
                  const dryKey = `${origin}-${destination}-Dry`;
                  const reeferKey = `${origin}-${destination}-Reefer`;
                  const dryPrice = filteredData[dryKey];
                  const reeferPrice = filteredData[reeferKey];
                  const showDry = filterType === "all" || filterType === "dry";
                  const showReefer = filterType === "all" || filterType === "reefer";

                  // Determine if this cell involves the user's port
                  const isUserPortRoute = origin === port || destination === port;

                  return (
                    <td
                      key={`${origin}-${destination}`}
                      className={`px-4 py-3 text-sm text-right border-r 
                        ${origin === destination ? "bg-gray-100" : isUserPortRoute && origin !== port ? "bg-blue-50" : ""}`}
                    >
                      {origin === destination ? (
                        <span className="text-gray-400">-</span>
                      ) : (
                        <div className="space-y-1">
                          {showDry && dryPrice !== undefined && <div className={`${isUserPortRoute ? "font-medium" : ""} text-green-600`}>Dry: {formatCurrency(dryPrice)}</div>}
                          {showReefer && reeferPrice !== undefined && <div className={`${isUserPortRoute ? "font-medium" : ""} text-blue-600`}>Reefer: {formatCurrency(reeferPrice)}</div>}
                          {!dryPrice && !reeferPrice && <span className="text-gray-400">No data</span>}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Generate list view
  const renderListView = () => {
    const grouped = groupByOrigin(getFilteredPriceData());

    // Sort entries to show user's port first, then others alphabetically
    const sortedEntries = Object.entries(grouped).sort((a, b) => {
      if (a[0] === port) return -1; // User's port first
      if (b[0] === port) return 1; // User's port comes after the current entry
      return a[0].localeCompare(b[0]); // Alphabetical sort for remaining ports
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedEntries.map(([origin, routes]) => (
          <div key={origin} className={`bg-white rounded-lg shadow-md p-4 ${origin === port ? "ring-2 ring-blue-400" : ""}`}>
            <div className={`text-lg font-semibold mb-3 ${origin === port ? "text-blue-700" : "text-gray-800"}`}>{origin === port ? `${origin} (Your Port)` : origin}</div>
            <table className="min-w-full divide-y divide-gray-200">
              {/* Existing table code remains the same */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {routes.map((route, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900">{route.destination}</td>
                    <td className={`px-3 py-2 text-sm text-right ${route.type === "reefer" ? "text-blue-600" : "text-green-600"}`}>{route.type}</td>
                    <td className="px-3 py-2 text-sm text-right font-medium">{formatCurrency(route.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={fetchMarketData} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Market Intelligence</h2>
        <p className="text-blue-100">Current market prices and penalties for container shipping</p>
      </div>

      {/* Your Port Info */}
      {port && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-md font-medium text-blue-800 mb-2">Your Current Port: {port}</h3>
          <p className="text-sm text-blue-600">Market intelligence data shows pricing between various ports. Use this information to make strategic decisions about which containers to accept.</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">View:</span>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${viewMode === "matrix" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              onClick={() => handleViewChange("matrix")}
            >
              Matrix
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${viewMode === "list" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              onClick={() => handleViewChange("list")}
            >
              List
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Container Type:</span>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${filterType === "all" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              onClick={() => handleTypeChange("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-t border-b ${filterType === "dry" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              onClick={() => handleTypeChange("dry")}
            >
              Dry
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${filterType === "reefer" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              onClick={() => handleTypeChange("reefer")}
            >
              Reefer
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabGroup>
        <TabList className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
            ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
            }
          >
            Price Tables
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
            ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
            }
          >
            Penalties
          </Tab>
        </TabList>

        <TabPanels>
          {/* Price Tables Panel */}
          <TabPanel>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">{viewMode === "matrix" ? renderMatrixView() : renderListView()}</div>
          </TabPanel>

          {/* Penalties Panel */}
          <TabPanel>
            <div className="bg-white rounded-lg shadow-md p-6 mt-4">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Container Rolling Penalties</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Container Type</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Non-Committed</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Committed</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Dry</td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(8000000)}</td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(16000000)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Reefer</td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(16000000)}</td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(24000000)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">Note: An additional {formatCurrency(8000000)} penalty per container for previously rolled containers</p>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2 text-gray-700">Move Penalties:</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Load Move Penalty:</p>
                      <p className="text-lg font-semibold text-red-600">{formatCurrency(1000000)}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Discharge Move Penalty:</p>
                      <p className="text-lg font-semibold text-red-600">{formatCurrency(1000000)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default MarketIntelligence;
