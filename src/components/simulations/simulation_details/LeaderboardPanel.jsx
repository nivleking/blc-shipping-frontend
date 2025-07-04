import { useState, useContext, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../axios/axios";
import { AppContext } from "../../../context/AppContext";
import { getPortColor } from "../../../assets/Colors";
import { FaChartBar, FaTable, FaUserAlt } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Color mapping for ports based on UtilitiesHelper.php
const PORT_COLOR_MAP = {
  SBY: { bg: "rgba(239, 68, 68, 0.7)", border: "rgb(220, 38, 38)" }, // red
  MDN: { bg: "rgba(34, 197, 94, 0.7)", border: "rgb(22, 163, 74)" }, // green
  MKS: { bg: "rgba(59, 130, 246, 0.7)", border: "rgb(37, 99, 235)" }, // blue
  JYP: { bg: "rgba(250, 204, 21, 0.7)", border: "rgb(202, 138, 4)" }, // yellow
  BPN: { bg: "rgba(23, 23, 23, 0.7)", border: "rgb(23, 23, 23)" }, // black
  BKS: { bg: "rgba(249, 115, 22, 0.7)", border: "rgb(194, 65, 12)" }, // orange
  BGR: { bg: "rgba(236, 72, 153, 0.7)", border: "rgb(190, 24, 93)" }, // pink
  BTH: { bg: "rgba(120, 53, 15, 0.7)", border: "rgb(120, 53, 15)" }, // brown
  AMQ: { bg: "rgba(34, 211, 238, 0.7)", border: "rgb(8, 145, 178)" }, // cyan
  SMR: { bg: "rgba(20, 184, 166, 0.7)", border: "rgb(13, 148, 136)" }, // teal
};

const DEFAULT_COLOR = { bg: "rgba(156, 163, 175, 0.7)", border: "rgb(107, 114, 128)" }; // gray

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

// Helper function to get suffix for rank (1st, 2nd, 3rd)
const getRankSuffix = (rank) => {
  if (rank === 1) return "st";
  if (rank === 2) return "nd";
  if (rank === 3) return "rd";
  return "th";
};

const LeaderboardPanel = ({ roomId }) => {
  const { token, user } = useContext(AppContext);
  const [sortBy, setSortBy] = useState("rank"); // Default sort by rank
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("chart"); // 'table' or 'chart'

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

  // Find the current user in rankings
  const currentUserRanking = rankings.find((r) => r.user_id === user?.id);
  const currentUserIndex = rankings.findIndex((r) => r.user_id === user?.id);

  // Get colors based on port
  const getPortColors = (type) => {
    return rankings.map((rank) => {
      const portColor = PORT_COLOR_MAP[rank.port] || DEFAULT_COLOR;
      return type === "bg" ? portColor.bg : portColor.border;
    });
  };

  // Chart configuration
  const chartData = {
    labels: rankings.map((rank) => rank.port),
    datasets: [
      {
        label: "Total Revenue",
        data: rankings.map((rank) => parseFloat(rank.total_revenue)),
        backgroundColor: getPortColors("bg"),
        borderColor: getPortColors("border"),
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Total Revenue (IDR)",
          font: {
            weight: "bold",
          },
        },
        ticks: {
          callback: function (value) {
            return formatIDR(value).replace("Rp", "").trim();
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Ports",
          font: {
            weight: "bold",
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Hide default legend
      },
      tooltip: {
        callbacks: {
          title: function (tooltipItems) {
            const index = tooltipItems[0].dataIndex;
            const ranking = rankings[index];
            const rankText = ranking.rank <= 3 ? `${ranking.rank}${getRankSuffix(ranking.rank)} Place: ` : "";
            const youText = ranking.user_id === user?.id ? " (YOU)" : "";
            return `${rankText}${ranking.user_name} - ${ranking.port}${youText}`;
          },
          label: function (context) {
            return `Total Revenue: ${formatIDR(context.raw)}`;
          },
          afterLabel: function (context) {
            const index = context.dataIndex;
            const ranking = rankings[index];
            return [`Revenue: ${formatIDR(ranking.revenue)}`, `Penalty: -${formatIDR(ranking.penalty || 0)}`];
          },
        },
        titleFont: {
          weight: "bold",
          size: 14,
        },
        backgroundColor: "rgba(0,0,0,0.85)",
        padding: 12,
        cornerRadius: 6,
        caretSize: 8,
        bodyFont: {
          size: 13,
        },
      },
      title: {
        display: true,
        text: "Port Revenue Leaderboard",
        font: {
          size: 18,
          weight: "bold",
        },
        padding: {
          bottom: 10,
        },
      },
    },
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
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Simulation Results</h2>
          <p className="text-sm text-gray-500">Final rankings and performance metrics for all participants</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setViewMode("table")} className={`p-2 rounded-md ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} title="Table View">
            <FaTable className="h-5 w-5" />
          </button>
          <button onClick={() => setViewMode("chart")} className={`p-2 rounded-md ${viewMode === "chart" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} title="Chart View">
            <FaChartBar className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Port Color Legend */}
      <div className="bg-gray-50 p-3 mx-4 my-2 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-medium text-gray-700">Port Colors:</span>
          {rankings.map((rank) => (
            <div key={rank.user_id} className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: (PORT_COLOR_MAP[rank.port] || DEFAULT_COLOR).bg }}></span>
              <span className="text-sm">{rank.port}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current User Banner */}
      {currentUserRanking && (
        <div className="bg-blue-100 border-l-4 border-blue-500 p-3 mx-4 my-2 rounded-lg shadow-sm">
          <div className="flex items-center">
            <FaUserAlt className="text-blue-600 mr-2" />
            <span className="font-medium">You managed</span>
            <span className="mx-2 px-2 py-0.5 rounded font-bold text-white" style={{ backgroundColor: (PORT_COLOR_MAP[currentUserRanking.port] || DEFAULT_COLOR).border }}>
              {currentUserRanking.port}
            </span>
            <span>and finished in</span>
            <span className="font-bold mx-1">
              {currentUserRanking.rank}
              {getRankSuffix(currentUserRanking.rank)} place
            </span>
            <span>with</span>
            <span className="font-bold ml-1 text-blue-700">{formatIDR(currentUserRanking.total_revenue)}</span>
          </div>
        </div>
      )}

      {viewMode === "chart" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mx-4 my-2">
          <div className="flex flex-wrap justify-center gap-3">
            {rankings
              .filter((r) => r.rank <= 3)
              .map((top) => (
                <div
                  key={top.user_id}
                  className="px-3 py-2 rounded-lg border shadow-sm flex items-center gap-2"
                  style={{
                    backgroundColor: `${(PORT_COLOR_MAP[top.port] || DEFAULT_COLOR).bg}30`,
                    borderColor: (PORT_COLOR_MAP[top.port] || DEFAULT_COLOR).border,
                  }}
                >
                  <div
                    className={`
                  w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                  ${top.rank === 1 ? "bg-yellow-400 text-yellow-900" : top.rank === 2 ? "bg-gray-300 text-gray-800" : "bg-amber-600 text-amber-100"}
                `}
                  >
                    {top.rank}
                  </div>
                  <span className="font-medium">
                    {top.rank === 1 ? "1st Place" : top.rank === 2 ? "2nd Place" : "3rd Place"}: {top.user_name}
                    <span className="ml-1 px-2 py-0.5 rounded text-white text-xs font-bold" style={{ backgroundColor: (PORT_COLOR_MAP[top.port] || DEFAULT_COLOR).border }}>
                      {top.port}
                    </span>
                    {top.user_id === user?.id && <span className="ml-1 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">YOU</span>}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {viewMode === "table" ? (
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
                <tr key={ranking.user_id} className={ranking.user_id === user?.id ? "bg-blue-50" : index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{ranking.user_name}</div>
                      {ranking.user_id === user?.id && <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">YOU</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: (PORT_COLOR_MAP[ranking.port] || DEFAULT_COLOR).bg }}></span>
                      <span
                        className="text-sm font-medium px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${(PORT_COLOR_MAP[ranking.port] || DEFAULT_COLOR).bg}30`,
                          color: (PORT_COLOR_MAP[ranking.port] || DEFAULT_COLOR).border,
                        }}
                      >
                        {ranking.port}
                      </span>
                    </div>
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
      ) : (
        <div className="h-96 relative p-4">
          <Bar data={chartData} options={chartOptions} />

          {/* Custom label for current user's bar */}
          {currentUserIndex !== -1 && (
            <div
              className="absolute pointer-events-none"
              style={{
                top: "50%",
                left: `${(currentUserIndex + 0.5) * (100 / rankings.length)}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg mb-1">YOU</div>
              <div
                className="w-0 h-0 mx-auto"
                style={{
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderTop: "8px solid #2563eb",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Custom Legend for Total Revenue */}
      {viewMode === "chart" && (
        <div className="mt-4 flex justify-center p-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-8 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">Total Revenue (Revenue - Penalties)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPanel;
