import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import { api } from "../../../axios/axios";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import FinancialSummaryModal from "../stowages/FinancialSummaryModal";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
};

const WeeklyPerformance = ({
  port,
  currentRound,
  totalRounds,
  bayMoves = {},
  totalMoves = 0,
  showFinancialModal,
  toggleFinancialModal,
  userId = null,
  isAdminView = false,
  //
}) => {
  const { roomId } = useParams();
  const { user, token } = useContext(AppContext);
  const effectiveUserId = isAdminView ? userId : user?.id;
  const [isLoading, setIsLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(currentRound);
  const [error, setError] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [cumulativeRevenue, setCumulativeRevenue] = useState(0);
  const [financialSummary, setFinancialSummary] = useState(null);

  useEffect(() => {
    if (roomId && effectiveUserId && token) {
      fetchAllWeeksData();
      fetchFinancialSummary();
    }
  }, [roomId, effectiveUserId, token, selectedWeek]);

  const handleFinancialButtonClick = () => {
    toggleFinancialModal();
  };

  useEffect(() => {
    if (weeklyData.length > 0) {
      // Find the data for the selected week (weeks are 1-indexed, arrays are 0-indexed)
      const selectedWeekData = weeklyData.find((data) => data.week === selectedWeek);
      if (selectedWeekData) {
        setPerformanceData(selectedWeekData);
      }
    }
  }, [selectedWeek, weeklyData]);

  const fetchAllWeeksData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/rooms/${roomId}/weekly-performance-all/${effectiveUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.data) {
        const allWeeklyData = response.data.data;

        // Set the overall cumulative revenue
        setCumulativeRevenue(response.data.total_cumulative_revenue || 0);

        // Update weekly data state
        setWeeklyData(allWeeklyData);

        // Find and set the selected week's data
        const selectedWeekData = allWeeklyData.find((data) => data.week === selectedWeek);
        if (selectedWeekData) {
          setPerformanceData(selectedWeekData);
        }
      }
    } catch (err) {
      setError("Failed to fetch performance data. Please try again.");
      console.error("Error fetching weekly performance data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFinancialSummary = async () => {
    try {
      const response = await api.get(`/ship-bays/financial-summary/${roomId}/${effectiveUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFinancialSummary(response.data);
    } catch (err) {
      console.error("Error fetching financial summary:", err);
    }
  };

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-[400px]">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add the Financial Summary Modal */}
      {showFinancialModal && (
        <FinancialSummaryModal isOpen={showFinancialModal} onClose={toggleFinancialModal} financialData={financialSummary} formatIDR={formatIDR} currentRound={currentRound} existingRevenue={performanceData?.revenue || 0} />
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-bold text-gray-800">Weekly Performance Summary</h2>
        <div className="flex items-center space-x-2">
          {/* <select className="border rounded-md px-1.5 py-0.5 bg-white text-xs" value={selectedWeek} onChange={(e) => setSelectedWeek(parseInt(e.target.value))}>
            {Array.from({ length: Math.min(currentRound, totalRounds) }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Week {i + 1}
                {i + 1 === currentRound ? " (Current)" : ""}
              </option>
            ))}
          </select> */}
          <button onClick={handleFinancialButtonClick} className="inline-flex items-center px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded shadow-sm transition-colors">
            <svg className="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1.5v1A1.5 1.5 0 0114 6.5H7A1.5 1.5 0 015.5 5V4H4z" clipRule="evenodd" />
            </svg>
            Review Current State
          </button>
        </div>
      </div>

      {/* Rate/Cost Constants Table - Side by Side Layout */}
      {financialSummary && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            Penalty and Cost Rates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Move & Restowage Costs - Blue Theme */}
            <div className="bg-gradient-to-b from-blue-50 to-white rounded-lg border border-blue-200 overflow-hidden shadow-sm">
              <div className="bg-blue-600 px-3 py-2">
                <h4 className="text-sm font-semibold text-white flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Basic Operational Costs
                </h4>
              </div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-blue-800 uppercase tracking-wider border-b border-blue-200">Cost Type</th>
                    <th className="px-2 py-1.5 text-center text-xs font-medium text-blue-800 uppercase tracking-wider border-b border-blue-200">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  <tr className="hover:bg-blue-50">
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-800 border-r border-blue-100">Move Cost (per container)</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-blue-700 font-semibold text-center">{formatIDR(financialSummary.move_cost || 0)}</td>
                  </tr>
                  <tr className="hover:bg-blue-50">
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-800 border-r border-blue-100">Restowage Cost (per container)</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-blue-700 font-semibold text-center">{formatIDR(financialSummary.restowage_cost * 2 || 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Unrolled Cost Rates - Red Theme */}
            <div className="bg-gradient-to-b from-red-50 to-white rounded-lg border border-red-200 overflow-hidden shadow-sm">
              <div className="bg-red-600 px-3 py-2">
                <h4 className="text-sm font-semibold text-white flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Rolled Penalty Rates
                </h4>
              </div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-red-100">
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-red-800 uppercase tracking-wider border-b border-red-200">Container</th>
                    <th className="px-2 py-1.5 text-center text-xs font-medium text-red-800 uppercase tracking-wider border-b border-red-200">Committed</th>
                    <th className="px-2 py-1.5 text-center text-xs font-medium text-red-800 uppercase tracking-wider border-b border-red-200">Non-Committed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100">
                  <tr className="hover:bg-red-50">
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-800 border-r border-red-100">Dry</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-red-700 font-semibold text-center border-r border-red-100">{formatIDR(financialSummary.unrolled_cost_rates?.dry_committed || 0)}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-red-700 font-semibold text-center">{formatIDR(financialSummary.unrolled_cost_rates?.dry_non_committed || 0)}</td>
                  </tr>
                  <tr className="hover:bg-red-50">
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-800 border-r border-red-100">Reefer</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-red-700 font-semibold text-center border-r border-red-100">{formatIDR(financialSummary.unrolled_cost_rates?.reefer_committed || 0)}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-red-700 font-semibold text-center">{formatIDR(financialSummary.unrolled_cost_rates?.reefer_non_committed || 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Dock Warehouse Cost Rates - Amber Theme */}
            <div className="bg-gradient-to-b from-amber-50 to-white rounded-lg border border-amber-200 overflow-hidden shadow-sm">
              <div className="bg-amber-600 px-3 py-2">
                <h4 className="text-sm font-semibold text-white flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Dock Warehouse Penalty
                </h4>
              </div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-amber-100">
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-amber-800 uppercase tracking-wider border-b border-amber-200">Container</th>
                    <th className="px-2 py-1.5 text-center text-xs font-medium text-amber-800 uppercase tracking-wider border-b border-amber-200">Committed</th>
                    <th className="px-2 py-1.5 text-center text-xs font-medium text-amber-800 uppercase tracking-wider border-b border-amber-200">Non-Committed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  <tr className="hover:bg-amber-50">
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-800 border-r border-amber-100">Dry</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-amber-700 font-semibold text-center border-r border-amber-100">{formatIDR(financialSummary.dock_warehouse_costs?.dry?.committed || 0)}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-amber-700 font-semibold text-center">{formatIDR(financialSummary.dock_warehouse_costs?.dry?.non_committed || 0)}</td>
                  </tr>
                  <tr className="hover:bg-amber-50">
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-800 border-r border-amber-100">Reefer</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-amber-700 font-semibold text-center border-r border-amber-100">{formatIDR(financialSummary.dock_warehouse_costs?.reefer?.committed || 0)}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-amber-700 font-semibold text-center">{formatIDR(financialSummary.dock_warehouse_costs?.reefer?.non_committed || 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Operational Cost Tracking Table */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-sm font-semibold mb-3">Operational Cost Tracking</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th rowSpan="4" className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase border">
                  Week
                </th>
                {/* Updated Moves column to include Restow */}
                <th colSpan="3" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-gray-100">
                  Moves
                </th>
                {/* Unrolled Heading Group */}
                <th colSpan="4" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-red-50">
                  Rolled
                </th>
                {/* Dock Warehouse Heading Group */}
                <th colSpan="4" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-blue-50">
                  Dock Warehouse
                </th>
                {/* NEW: Penalty Breakdown Group */}
                <th colSpan="3" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-yellow-50">
                  Penalty Breakdown
                </th>
                <th rowSpan="4" className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase border">
                  Penalties
                </th>
                <th rowSpan="4" className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase border">
                  Revenue
                </th>
                <th rowSpan="4" className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase border">
                  Net Result
                </th>
              </tr>
              <tr>
                {/* Load, Discharge and Restow as sub-headers */}
                <th rowSpan="2" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-gray-100">
                  Load
                </th>
                <th rowSpan="2" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-gray-100">
                  Discharge
                </th>
                <th rowSpan="2" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-gray-100">
                  Restow
                </th>
                {/* Unrolled Second Level - Committed/Non-Committed */}
                <th colSpan="2" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-red-50">
                  Committed
                </th>
                <th colSpan="2" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-red-50">
                  Non-Committed
                </th>
                {/* Dock Warehouse Second Level */}
                <th colSpan="2" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-blue-50">
                  Committed
                </th>
                <th colSpan="2" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-blue-50">
                  Non-Committed
                </th>
                <th rowSpan="2" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-gray-100">
                  Moves
                </th>
                <th rowSpan="2" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-red-50">
                  Rolled
                </th>
                <th rowSpan="2" className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-blue-50">
                  Dock Werehouse
                </th>
              </tr>
              <tr>
                {/* Unrolled Third Level - Container Types */}
                <th className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-red-50">Dry</th>
                <th className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-red-50">Reefer</th>
                <th className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-red-50">Dry</th>
                <th className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-red-50">Reefer</th>
                {/* Dock Warehouse Third Level */}
                <th className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-blue-50">Dry</th>
                <th className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-blue-50">Reefer</th>
                <th className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-blue-50">Dry</th>
                <th className="px-3 py-1 text-center text-xs font-medium text-gray-700 uppercase border bg-blue-50">Reefer</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weeklyData.map((week, index) => {
                const movesPenalty = ((week.discharge_moves || 0) + (week.load_moves || 0)) * (financialSummary?.move_cost || 0) + week.restowage_penalty;

                return (
                  <tr key={index} className={week.week === selectedWeek ? "bg-blue-50" : ""}>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center font-medium border">
                      Week {week.week}
                      {week.week === currentRound && <span className="ml-1 text-[9px] text-blue-600">(Current)</span>}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{week.load_moves || 0}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{week.discharge_moves || 0}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{week.restowage_moves || 0}</td>

                    {/* Use the proper structure from unrolled_container_counts */}
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{week.unrolled_container_counts?.dry_committed || 0}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{week.unrolled_container_counts?.reefer_committed || 0}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{week.unrolled_container_counts?.dry_non_committed || 0}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{week.unrolled_container_counts?.reefer_non_committed || 0}</td>

                    {/* Use the proper structure from dock_warehouse_container_counts */}
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{week.dock_warehouse_container_counts?.dry_committed || 0}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{week.dock_warehouse_container_counts?.reefer_committed || 0}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{week.dock_warehouse_container_counts?.dry_non_committed || 0}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{week.dock_warehouse_container_counts?.reefer_non_committed || 0}</td>

                    {/* NEW: Individual penalty columns */}
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border bg-gray-50">{formatIDR(movesPenalty)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border bg-red-50">{formatIDR(week.unrolled_penalty || 0)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border bg-blue-50">{formatIDR(week.dock_warehouse_penalty || 0)}</td>

                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{formatIDR(week.total_penalty)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{formatIDR(week.revenue || 0)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{formatIDR(week.net_result || 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Impact Summary Table for Current Week */}
      {/* <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center">
          <span>Estimation Breakdown for Week {selectedWeek}</span>
          <span className="ml-auto text-sm font-normal bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Net Result: {formatIDR(financialSummary?.final_revenue || 0)}</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">Category</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Count</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Unit Cost</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Financial Impact</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 border">Total Revenue</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">-</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">-</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-green-600 font-medium text-center border">{formatIDR(financialSummary?.revenue || 0)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 border">Container Moves</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{(performanceData?.load_moves || 0) + (performanceData?.discharge_moves || 0)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{formatIDR(financialSummary?.move_cost || 0)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-red-600 font-medium text-center border">{formatIDR(financialSummary?.moves_penalty || 0)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 border">Unrolled Containers</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">
                  {(performanceData?.committed_dry_containers_not_loaded || 0) +
                    (performanceData?.non_committed_dry_containers_not_loaded || 0) +
                    (performanceData?.committed_reefer_containers_not_loaded || 0) +
                    (performanceData?.non_committed_reefer_containers_not_loaded || 0)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">Varies</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-red-600 font-medium text-center border">{formatIDR(financialSummary?.unrolled_penalty || 0)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 border">Restowage</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{financialSummary?.restowage_moves || 0}</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">{formatIDR(financialSummary?.restowage_cost || 0)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-red-600 font-medium text-center border">{formatIDR(financialSummary?.restowage_penalty || 0)}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 border">Dock Warehouse</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">
                  {(financialSummary?.dock_warehouse_dry_committed || 0) +
                    (financialSummary?.dock_warehouse_dry_non_committed || 0) +
                    (financialSummary?.dock_warehouse_reefer_committed || 0) +
                    (financialSummary?.dock_warehouse_reefer_non_committed || 0)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">Varies</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-red-600 font-medium text-center border">{formatIDR(financialSummary?.dock_warehouse_penalty || 0)}</td>
              </tr>
              <tr className="bg-gray-50 font-medium">
                <td className="px-3 py-2 whitespace-nowrap text-xs font-bold text-gray-900 border">Total Penalties</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">-</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">-</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-red-600 font-bold text-center border">{formatIDR(financialSummary?.total_penalty || 0)}</td>
              </tr>
              <tr className="bg-blue-50">
                <td className="px-3 py-2 whitespace-nowrap text-xs font-bold text-blue-900 border">Net Result</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">-</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-center border">-</td>
                <td className="px-3 py-2 whitespace-nowrap text-xs font-bold text-center border">{formatIDR(financialSummary?.final_revenue || 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div> */}

      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default WeeklyPerformance;
