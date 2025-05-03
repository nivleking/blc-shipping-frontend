import { useState, useContext } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { AppContext } from "../../../context/AppContext";
import { api } from "../../../axios/axios";
import { useQuery } from "@tanstack/react-query";
import PriceTable from "./PriceTable";
import PenaltiesPanel from "./PenaltiesPanel";
import ViewControls from "./ViewControls";
import LoadingSpinner from "../LoadingSpinner";

// Format currency function
const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const MarketIntelligenceSimulation = ({ port, roomId, deckId }) => {
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
  const deckQuery = useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const response = await api.get(`/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data?.deck_id;
    },
    enabled: !!roomId && !deckId,
    staleTime: 5 * 60 * 1000,
  });

  // The effective deck ID to use (either from props or query)
  const effectiveDeckId = deckId || deckQuery.data;

  // Query to fetch market intelligence data
  const marketQuery = useQuery({
    queryKey: ["marketIntelligence", effectiveDeckId],
    queryFn: async () => {
      const response = await api.get(`/market-intelligence/deck/${effectiveDeckId}`);
      if (response.data.penalties) setPenalties(response.data.penalties);
      return response.data.price_data;
    },
    enabled: !!effectiveDeckId,
    staleTime: 5 * 60 * 1000,
  });

  // Handle loading states for both queries
  const isLoading = deckQuery.isLoading || marketQuery.isLoading || (!deckId && deckQuery.isInitialLoading) || (effectiveDeckId && marketQuery.isInitialLoading);

  // if (isLoading) {
  //   return (
  //     <div className="py-8 flex justify-center items-center">
  //       <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  // Handle error states
  const error = deckQuery.error || marketQuery.error;
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
        <p className="text-red-600">{error.message || "Failed to load market data"}</p>
        <button onClick={() => (effectiveDeckId ? marketQuery.refetch() : deckQuery.refetch())} className="mt-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  // Get filtered price data based on selected type
  const getFilteredPriceData = () => {
    if (!marketQuery.data) return {};
    if (filterType === "all") return marketQuery.data;

    return Object.entries(marketQuery.data).reduce((filtered, [key, value]) => {
      if (key.toLowerCase().endsWith(filterType.toLowerCase())) {
        filtered[key] = value;
      }
      return filtered;
    }, {});
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <h2 className="text-sm font-bold">Market Intelligence</h2>
        <p className="text-sm text-blue-100">Current market prices and penalties for container shipping</p>
      </div>

      {/* Controls */}
      <ViewControls viewMode={viewMode} setViewMode={setViewMode} filterType={filterType} setFilterType={setFilterType} />

      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <PriceTable priceData={getFilteredPriceData()} viewMode={viewMode} port={port} formatCurrency={formatCurrency} />
      </div>

      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default MarketIntelligenceSimulation;
