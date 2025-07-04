import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { api } from "../../axios/axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { FaChartBar, FaTable, FaMedal, FaTrophy, FaAward, FaUserAlt } from "react-icons/fa";

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

// Medal icons for top performers
const RankBadge = ({ rank }) => {
  switch (rank) {
    case 1:
      return <FaTrophy className="text-yellow-500" title="1st Place" />;
    case 2:
      return <FaMedal className="text-gray-400" title="2nd Place" />;
    case 3:
      return <FaAward className="text-amber-700" title="3rd Place" />;
    default:
      return null;
  }
};

const LeaderboardSimulation = ({ roomId, formatIDR, onRankingsUpdate }) => {
  const { user, token } = useContext(AppContext);
  const [rankings, setRankings] = useState([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);
  const [viewMode, setViewMode] = useState("chart"); // 'table' or 'chart'

  const fetchRankings = async () => {
    try {
      setIsLeaderboardLoading(true);
      const response = await api.get(`/rooms/${roomId}/rankings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Sort rankings by total_revenue in descending order to determine places
      const sortedRankings = [...response.data].sort((a, b) => parseFloat(b.total_revenue) - parseFloat(a.total_revenue));

      // Add rank property to each item
      const rankedData = sortedRankings.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

      setRankings(rankedData);
      if (onRankingsUpdate) {
        onRankingsUpdate(rankedData);
      }
      setIsLeaderboardLoading(false);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      setIsLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    if (roomId && token) {
      fetchRankings();

      // Set up periodic refresh
      const interval = setInterval(() => {
        fetchRankings();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [roomId, token]);

  // Get chart labels
  const getChartLabels = () => {
    return rankings.map((rank) => {
      return rank.port;
    });
  };

  // Get suffix for rank (1st, 2nd, 3rd)
  const getRankSuffix = (rank) => {
    if (rank === 1) return "st";
    if (rank === 2) return "nd";
    if (rank === 3) return "rd";
    return "th";
  };

  // Get colors based on port
  const getPortColors = (type) => {
    return rankings.map((rank) => {
      const portColor = PORT_COLOR_MAP[rank.port] || DEFAULT_COLOR;
      return type === "bg" ? portColor.bg : portColor.border;
    });
  };

  // Find the current user in rankings
  const currentUserRanking = rankings.find((r) => r.user_id === user?.id);
  const currentUserIndex = rankings.findIndex((r) => r.user_id === user?.id);

  // Chart configuration
  const chartData = {
    labels: getChartLabels(),
    datasets: [
      {
        label: "Total Revenue",
        data: rankings.map((rank) => parseFloat(rank.total_revenue)),
        backgroundColor: getPortColors("bg"),
        borderColor: getPortColors("border"),
        borderWidth: 2,
        // Add pattern for current user's bar
        borderDash: rankings.map((rank) => (rank.user_id === user?.id ? [5, 5] : [])),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 30, // Add space for custom annotations
      },
    },
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

  if (isLeaderboardLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Port Rankings</h2>
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
      <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-200">
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
        <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded-lg mb-4 shadow-sm">
          <div className="flex items-center">
            <FaUserAlt className="text-blue-600 mr-2" />
            <span className="font-medium">You are managing</span>
            <span className="mx-2 px-2 py-0.5 rounded font-bold text-white" style={{ backgroundColor: (PORT_COLOR_MAP[currentUserRanking.port] || DEFAULT_COLOR).border }}>
              {currentUserRanking.port}
            </span>
            <span>and currently in</span>
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
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
                  <RankBadge rank={top.rank} />
                  <span className="font-medium">
                    {top.rank === 1 ? "1st Place" : top.rank === 2 ? "2nd Place" : "3rd Place"}: {top.user_name}
                    <span className="ml-1 px-2 py-0.5 rounded text-white text-xs font-bold" style={{ backgroundColor: (PORT_COLOR_MAP[top.port] || DEFAULT_COLOR).border }}>
                      {top.port}
                    </span>
                    {top.user_id === user?.id && <span className="ml-1 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">YOU</span>}
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Port
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Penalty
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rankings.map((ranking) => {
                const portColor = PORT_COLOR_MAP[ranking.port] || DEFAULT_COLOR;
                const isCurrentUser = ranking.user_id === user?.id;

                return (
                  <tr key={ranking.user_id} className={isCurrentUser ? "bg-blue-50 relative" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                        ${ranking.rank === 1 ? "bg-yellow-500" : ranking.rank === 2 ? "bg-gray-400" : ranking.rank === 3 ? "bg-amber-700" : "bg-gray-300"}`}
                        >
                          {ranking.rank}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{ranking.user_name}</div>
                        {isCurrentUser && <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full animate-pulse">YOU</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: portColor.bg }}></span>
                        <span
                          className="text-sm font-medium px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${portColor.bg}30`,
                            color: portColor.border,
                          }}
                        >
                          {ranking.port}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-gray-900">{formatIDR(ranking.total_revenue)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-green-600 font-medium">{formatIDR(ranking.revenue)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-red-600 font-medium">-{formatIDR(ranking.penalty || 0)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-96 relative">
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
                className="w-0 h-0 border-left-8 border-right-8 border-t-8 mx-auto"
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
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="h-3 w-8 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">Total Revenue (Revenue - Penalties)</span>
          </div>
        </div>
      )}

      {rankings.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No rankings available yet.</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardSimulation;
