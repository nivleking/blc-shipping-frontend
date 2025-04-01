import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import { useParams } from "react-router-dom";
import { api } from "../../../axios/axios";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
};

const WeeklyPerformance = ({ port, currentRound, totalRounds, longCraneMoves = 0, extraMovesCost = 0, extraMovesOnLongCrane = 0, totalMoves = 0, idealCraneSplit = 2, bayMoves = {}, bayPairs = [] }) => {
  const { roomId } = useParams();
  const { user, token } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(currentRound);
  const [error, setError] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [cumulativeRevenue, setCumulativeRevenue] = useState(0);

  useEffect(() => {
    if (roomId && user?.id && token) {
      fetchPerformanceData(selectedWeek);
      fetchAllWeeksData();
    }
  }, [roomId, user?.id, token, selectedWeek]);

  const fetchPerformanceData = async (week) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/rooms/${roomId}/users/${user.id}/weekly-performance/${week}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPerformanceData(response.data.data);
    } catch (err) {
      console.error("Error fetching weekly performance data:", err);
      setError("Failed to load weekly performance data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllWeeksData = async () => {
    try {
      let allWeeksData = [];
      let totalRevenue = 0;

      // Fetch data for all weeks up to current round
      for (let week = 1; week <= currentRound; week++) {
        const response = await api.get(`/rooms/${roomId}/users/${user.id}/weekly-performance/${week}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.data) {
          allWeeksData.push(response.data.data);
          totalRevenue += response.data.data.revenue || 0;
        }
      }

      setWeeklyData(allWeeksData);
      setCumulativeRevenue(totalRevenue);
    } catch (err) {
      console.error("Error fetching all weeks data:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  // Prepare rolling container data for current week
  const rolledContainers = {
    committed: {
      dry: performanceData?.committed_dry_containers_not_loaded || 0,
      reefer: performanceData?.committed_reefer_containers_not_loaded || 0,
    },
    nonCommitted: {
      dry: performanceData?.non_committed_dry_containers_not_loaded || 0,
      reefer: performanceData?.non_committed_reefer_containers_not_loaded || 0,
    },
  };

  // Calculate penalties based on rolling matrix - update with actual values
  const dryNonCommittedPenalty = rolledContainers.nonCommitted.dry * 0;
  const reeferNonCommittedPenalty = rolledContainers.nonCommitted.reefer * 0;
  const dryCommittedPenalty = rolledContainers.committed.dry * 0;
  const reeferCommittedPenalty = rolledContainers.committed.reefer * 0;
  const rollingPenalty = dryNonCommittedPenalty + reeferNonCommittedPenalty + dryCommittedPenalty + reeferCommittedPenalty;

  // For now, set restow penalties to 0
  const restowPenalty = 0;

  // Use the extraMovesOnLongCrane prop from Simulation component for current week
  // Only use the performanceData version for historical data
  const currentExtraMovesOnLongCrane = selectedWeek === currentRound ? extraMovesOnLongCrane : performanceData?.extra_moves_on_long_crane || 0;

  // Calculate long crane penalties using the direct prop
  const longCranePenalty = currentExtraMovesOnLongCrane * extraMovesCost;

  // Calculate total penalties
  const totalPenalties = rollingPenalty + restowPenalty + longCranePenalty;

  return (
    <div className="space-y-6">
      {/* Header with week selection */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Weekly Performance Summary</h2>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Week:</span>
          <select className="border rounded-md px-3 py-1.5 bg-white" value={selectedWeek} onChange={(e) => setSelectedWeek(parseInt(e.target.value))} disabled>
            {Array.from({ length: Math.min(currentRound, totalRounds) }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Week {i + 1}
                {i + 1 === currentRound ? " (Current)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rolling Penalty Matrix */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Crane Efficiency</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <tbody>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Ideal Crane Split:</td>
                <td className="py-2 px-4 text-right">{selectedWeek === currentRound ? idealCraneSplit : performanceData?.ideal_crane_split || 2}</td>
              </tr>
              {/* <tr className="border-b">
                <td className="py-2 px-4 font-medium">Total Moves:</td>
                <td className="py-2 px-4 text-right">{selectedWeek === currentRound ? totalMoves : (performanceData?.discharge_moves || 0) + (performanceData?.load_moves || 0)}</td>
              </tr> */}
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Extra Moves on Long Crane:</td>
                <td className="py-2 px-4 text-right">{currentExtraMovesOnLongCrane}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4 font-medium">Extra Moves Penalty:</td>
                <td className="py-2 px-4 text-right">{formatIDR(longCranePenalty)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Cost Tracking Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Operational Cost Tracking</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Week</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">No. of Rolled Committed Dry Containers</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">No. of Rolled Committed Reefer Containers</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">No. of Rolled Non-Committed Dry Containers</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">No. of Rolled Non-Committed Reefer Containers</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">No. of Restows (Boxes)</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Restow Penalty (Rp xxx/Box)</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Long Crane Additional Moves</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Long Crane Penalty ({formatIDR(extraMovesCost)})</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Total Penalties</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Total Revenues</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weeklyData.map((week, index) => {
                const weekNumber = index + 1;

                // Calculate penalties for this week
                const weekRolledContainers = {
                  committed: {
                    dry: week?.committed_dry_containers_not_loaded || 0,
                    reefer: week?.committed_reefer_containers_not_loaded || 0,
                  },
                  nonCommitted: {
                    dry: week?.non_committed_dry_containers_not_loaded || 0,
                    reefer: week?.non_committed_reefer_containers_not_loaded || 0,
                  },
                };

                const weekDryNonCommittedPenalty = weekRolledContainers.nonCommitted.dry * 0;
                const weekReeferNonCommittedPenalty = weekRolledContainers.nonCommitted.reefer * 0;
                const weekDryCommittedPenalty = weekRolledContainers.committed.dry * 0;
                const weekReeferCommittedPenalty = weekRolledContainers.committed.reefer * 0;
                const weekRollingPenalty = weekDryNonCommittedPenalty + weekReeferNonCommittedPenalty + weekDryCommittedPenalty + weekReeferCommittedPenalty;

                // For now, set restow penalties to 0
                const weekRestowCount = 0;
                const weekRestowPenalty = weekRestowCount * 3000000;

                // Long crane penalties for this week
                // Use the passed props for current week
                const weekLongCraneAdditionalMoves = weekNumber === currentRound ? extraMovesOnLongCrane : week?.extra_moves_on_long_crane || 0;

                const weekLongCranePenalty = weekLongCraneAdditionalMoves * extraMovesCost;

                // Total penalties for this week
                const weekTotalPenalties = weekRollingPenalty + weekRestowPenalty + weekLongCranePenalty;

                return (
                  <tr key={weekNumber} className={weekNumber === selectedWeek ? "bg-blue-50" : ""}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-center border">{weekNumber}</td>
                    <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">{weekRolledContainers.committed.dry}</td>
                    <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">{weekRolledContainers.committed.reefer}</td>
                    <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">{weekRolledContainers.nonCommitted.dry}</td>
                    <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">{weekRolledContainers.nonCommitted.reefer}</td>
                    <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border"></td>
                    <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border"></td>
                    <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">{weekLongCraneAdditionalMoves}</td>
                    <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">{formatIDR(weekLongCranePenalty)}</td>
                    <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">{formatIDR(weekTotalPenalties)}</td>
                    <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">{formatIDR(week?.revenue || 0)}</td>
                  </tr>
                );
              })}
              {/* Total Revenue Row */}
              <tr className="bg-gray-100 font-semibold">
                <td colSpan="10" className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium text-gray-900 border">
                  Total Revenue
                </td>
                <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">{formatIDR(cumulativeRevenue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Performance Details for Selected Week */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Week {selectedWeek} Performance Details</h3>

        {/* Financial summary for selected week */}
        <div className="gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-md font-semibold text-gray-800 mb-4">Financial Summary</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Revenue:</td>
                    <td className="py-2 px-4 text-right text-green-600 font-semibold">{formatIDR(performanceData?.revenue || 0)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Total Penalties:</td>
                    <td className="py-2 px-4 text-right text-red-600 font-semibold">{formatIDR(totalPenalties)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Net Result:</td>
                    <td className="py-2 px-4 text-right font-bold">{formatIDR((performanceData?.revenue || 0) - totalPenalties)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPerformance;
