import React, { useState, useEffect, useContext } from "react";
import { api } from "../../axios/axios";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const formatIDR = (value) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
};

const WeeklyPerformance = ({ port, currentRound, totalRounds }) => {
  const { roomId } = useParams();
  const { user, token } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState({
    weeks: [],
    totalRevenue: 0,
    totalPenalties: 0,
    penaltyMatrix: {
      dry: {
        committed: 16000000,
        nonCommitted: 8000000,
      },
      reefer: {
        committed: 24000000,
        nonCommitted: 16000000,
      },
      additionalRolledPenalty: 8000000,
      restowPenalty: 3000000,
      longCranePenalty: 1000000,
    },
  });

  useEffect(() => {
    fetchPerformanceData();
  }, [roomId, token, currentRound]);

  const fetchPerformanceData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/rooms/${roomId}/weekly-performance/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        const data = response.data.data;

        setPerformanceData(data);
      }
    } catch (error) {
      console.error("Error fetching weekly performance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total revenue and penalty for a better user experience
  const netProfit = performanceData.totalRevenue - performanceData.totalPenalties;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Weekly Performance Report</h2>
          <div className="text-sm text-gray-500">
            Port: <span className="font-semibold">{port}</span>
          </div>
        </div>

        {/* Penalty Matrix Explanation */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Rolling Penalty Matrix</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Customer Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Dry</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Reefer</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 font-medium">Non-Committed</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{formatIDR(performanceData.penaltyMatrix.dry.nonCommitted)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{formatIDR(performanceData.penaltyMatrix.reefer.nonCommitted)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 font-medium">Committed</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{formatIDR(performanceData.penaltyMatrix.dry.committed)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{formatIDR(performanceData.penaltyMatrix.reefer.committed)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-gray-500">Note: An additional {formatIDR(performanceData.penaltyMatrix.additionalRolledPenalty)} per container for previously rolled containers</div>
        </div>

        {/* Main Performance Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th rowSpan="2" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Week
                </th>
                <th colSpan="4" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Rolled Containers
                </th>
                <th rowSpan="2" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Total Penalties
                </th>
                <th rowSpan="2" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Total Revenues
                </th>
              </tr>
              <tr>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Committed Dry</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Committed Reefer</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Non-Committed Dry</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Non-Committed Reefer</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceData.weeks.map((week) => (
                <tr key={week.weekNumber} className={week.weekNumber === currentRound ? "bg-yellow-50" : ""}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">{week.weekNumber}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500 border">{week.rolledCommittedDry ?? "-"}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500 border">{week.rolledCommittedReefer ?? "-"}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500 border">{week.rolledNonCommittedDry ?? "-"}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-500 border">{week.rolledNonCommittedReefer ?? "-"}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-medium text-red-600 border">{week.totalPenalty ? formatIDR(week.totalPenalty) : "-"}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-medium text-green-600 border">{week.revenue ? formatIDR(week.revenue) : "-"}</td>
                </tr>
              ))}

              {/* Summary Row */}
              <tr className="bg-gray-100 font-semibold">
                <td colSpan="5" className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900 text-right border">
                  Total
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-bold text-red-600 border">{formatIDR(performanceData.totalPenalties || 0)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center font-bold text-green-600 border">{formatIDR(performanceData.totalRevenue || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Net Profit */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-700">Net Profit:</span>
            <span className={`text-xl font-bold ${netProfit >= 0 ? "text-blue-600" : "text-red-600"}`}>{formatIDR(netProfit)}</span>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-4 text-right">
          <button onClick={fetchPerformanceData} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPerformance;
