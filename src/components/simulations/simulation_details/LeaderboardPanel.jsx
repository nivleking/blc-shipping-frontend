import { useState, useContext, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../axios/axios";
import { AppContext } from "../../../context/AppContext";
import { getPortColor } from "../../../assets/Colors";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

const LeaderboardPanel = ({ roomId }) => {
  const { token } = useContext(AppContext);
  const [sortBy, setSortBy] = useState("rank"); // Default sort by rank
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch leaderboard data using React Query
  const {
    data: originalRankings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["roomRankings", roomId],
    queryFn: async () => {
      const response = await api.get(`/rooms/${roomId}/rankings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!roomId && !!token,
  });

  // Process rankings to add rank property
  const rankings = useMemo(() => {
    if (!originalRankings || !originalRankings.length) return [];

    // First sort by total_revenue in descending order to determine ranks
    const sortedByRevenue = [...originalRankings].sort((a, b) => {
      const aValue = parseFloat(a.total_revenue) || 0;
      const bValue = parseFloat(b.total_revenue) || 0;
      return bValue - aValue;
    });

    // Then add rank property
    return sortedByRevenue.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [originalRankings]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder(column === "rank" ? "asc" : "desc"); // Default to ascending for rank, descending for others
    }
  };

  const getSortedData = () => {
    if (!rankings || !rankings.length) return [];

    return [...rankings].sort((a, b) => {
      let aValue, bValue;

      // Handle specific sorting for numeric columns
      if (sortBy === "total_revenue" || sortBy === "revenue") {
        aValue = parseFloat(a[sortBy]) || 0;
        bValue = parseFloat(b[sortBy]) || 0;
      }
      // Fix penalty sorting - use the correct field name
      else if (sortBy === "penalties") {
        aValue = parseFloat(a.penalty) || 0;
        bValue = parseFloat(b.penalty) || 0;
      } else {
        aValue = a[sortBy];
        bValue = b[sortBy];
      }

      // Sort in requested order
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error loading leaderboard</p>
        <p className="text-sm">{error.message}</p>
        <button onClick={() => refetch()} className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm">
          Retry
        </button>
      </div>
    );
  }

  const sortedData = getSortedData();

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Simulation Results</h2>
        <p className="text-sm text-gray-500">Final rankings and performance metrics for all participants</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("rank")}>
                Rank
                {sortBy === "rank" && <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("user_name")}>
                Participant
                {sortBy === "user_name" && <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("port")}>
                Port
                {sortBy === "port" && <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("total_revenue")}>
                Total Revenue
                {sortBy === "total_revenue" && <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("revenue")}>
                Revenue
                {sortBy === "revenue" && <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("penalties")}>
                Penalties
                {sortBy === "penalties" && <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((ranking, index) => (
              <tr key={ranking.user_id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className={`
                      w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                      ${ranking.rank === 1 ? "bg-yellow-400 text-yellow-900" : ranking.rank === 2 ? "bg-gray-300 text-gray-800" : ranking.rank === 3 ? "bg-amber-600 text-amber-100" : "bg-gray-100 text-gray-500"}
                    `}
                    >
                      {ranking.rank}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{ranking.user_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-md"
                    style={{
                      backgroundColor: `${getPortColor(ranking.port)}20`,
                      color: getPortColor(ranking.port),
                    }}
                  >
                    {ranking.port}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${parseInt(ranking.total_revenue) >= 0 ? "text-green-700" : "text-red-700"}`}>{formatIDR(ranking.total_revenue)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatIDR(ranking.revenue)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatIDR(ranking.penalty)}</td>
              </tr>
            ))}

            {sortedData.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No leaderboard data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPanel;
