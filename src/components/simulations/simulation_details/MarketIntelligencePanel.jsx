import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../axios/axios";
import { AppContext } from "../../../context/AppContext";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

const MarketIntelligencePanel = ({ roomId }) => {
  const { token } = useContext(AppContext);
  const [viewMode, setViewMode] = useState("matrix");
  const [filterType, setFilterType] = useState("all");
  const [penalties, setPenalties] = useState({
    dry_committed: 0,
    dry_non_committed: 0,
    reefer_committed: 0,
    reefer_non_committed: 0,
  });

  // Query to fetch the deck ID if not provided directly
  const roomQuery = useQuery({
    queryKey: ["roomData", roomId],
    queryFn: async () => {
      const response = await api.get(`/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!roomId && !!token,
    staleTime: 5 * 60 * 1000,
  });

  // The effective deck ID to use
  const deckId = roomQuery.data?.deck_id;

  // Query to fetch market intelligence data
  const marketQuery = useQuery({
    queryKey: ["marketIntelligence", deckId],
    queryFn: async () => {
      const response = await api.get(`/market-intelligence/deck/${deckId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.penalties) setPenalties(response.data.penalties);
      return response.data.price_data;
    },
    enabled: !!deckId,
    staleTime: 5 * 60 * 1000,
  });

  // Loading state
  if (roomQuery.isLoading || marketQuery.isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (roomQuery.isError || marketQuery.isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error loading market intelligence data</p>
        <p className="text-sm">{roomQuery.error?.message || marketQuery.error?.message || "An unknown error occurred"}</p>
      </div>
    );
  }

  const priceData = marketQuery.data || {};

  // Extract unique origins and destinations
  const origins = new Set();
  const destinations = new Set();
  Object.keys(priceData).forEach((key) => {
    const [origin, destination] = key.split("-");
    origins.add(origin);
    destinations.add(destination);
  });

  const uniqueOrigins = Array.from(origins).sort();
  const uniqueDestinations = Array.from(destinations).sort();

  // Filter by container type
  const filteredPriceData = Object.entries(priceData).filter(([key]) => {
    if (filterType === "all") return true;
    return key.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Market Intelligence</h2>
        <p className="text-sm text-gray-500">Price data showing revenue potential for different routes and container types</p>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <span className="text-sm font-medium text-gray-700">View as:</span>
            <div className="inline-flex rounded-md shadow-sm">
              <button onClick={() => setViewMode("matrix")} className={`px-3 py-1 text-sm font-medium rounded-l-md ${viewMode === "matrix" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                Matrix
              </button>
              <button onClick={() => setViewMode("list")} className={`px-3 py-1 text-sm font-medium rounded-r-md ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                List
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Container Type:</span>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="form-select text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
              <option value="all">All Types</option>
              <option value="Dry">Dry</option>
              <option value="Reefer">Reefer</option>
            </select>
          </div>
        </div>

        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {viewMode === "matrix" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border-b border-r border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Origin \ Destination</th>
                    {uniqueDestinations.map((dest) => (
                      <th key={dest} className="text-center p-3 border-b border-r border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {dest}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uniqueOrigins.map((origin, originIndex) => (
                    <tr key={origin} className={originIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-3 border-b border-r border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase text-center">{origin}</td>
                      {uniqueDestinations.map((dest) => {
                        // Skip rendering if origin and destination are the same
                        if (origin === dest) {
                          return (
                            <td key={dest} className="p-3 border-b border-r border-gray-200 text-center text-gray-400">
                              -
                            </td>
                          );
                        }

                        const dryKey = `${origin}-${dest}-Dry`;
                        const reeferKey = `${origin}-${dest}-Reefer`;
                        const dryPrice = priceData[dryKey];
                        const reeferPrice = priceData[reeferKey];

                        return (
                          <td key={dest} className="p-3 border-b border-r  border-gray-200">
                            {filterType !== "Reefer" && dryPrice !== undefined && (
                              <div className="mb-1 flex items-center">
                                <span className="inline-flex items-center bg-green-100 text-gray-800 text-sm font-medium px-2 py-0.5 rounded-full mr-1">Dry</span>
                                <span className="text-gray-800 text-sm">{formatIDR(dryPrice)}</span>
                              </div>
                            )}
                            {filterType !== "Dry" && reeferPrice !== undefined && (
                              <div className="flex items-center">
                                <span className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2 py-0.5 rounded-full mr-1">Reefer</span>
                                <span className="text-gray-800 text-sm">{formatIDR(reeferPrice)}</span>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPriceData.map(([key, price]) => {
                const [origin, destination, type] = key.split("-");
                if (origin === destination) return null;

                return (
                  <div key={key} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-gray-500">Route</div>
                        <div className="font-medium">
                          {origin} → {destination}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full
                        ${type.toLowerCase() === "reefer" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {type}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">Revenue</div>
                      <div className="text-lg font-bold text-green-600">{formatIDR(price)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligencePanel;
