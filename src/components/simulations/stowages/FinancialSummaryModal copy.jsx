import React, { useEffect, useRef } from "react";

const FinancialSummaryModal = ({ isOpen, onClose, financialData, formatIDR, currentRound = 1 }) => {
  const modalRef = useRef(null);

  // Handle click outside modal
  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop (not the modal itself)
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Add event listeners
    document.addEventListener("keydown", handleEscKey);

    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const {
    revenue = 0,
    load_moves = 0,
    discharge_moves = 0,
    move_cost = 0,
    moves_penalty = 0,
    dock_warehouse_penalty = 0,
    unrolled_penalty = 0,
    restowage_penalty = 0,
    total_penalty = 0,
    final_revenue = 0,
    dock_warehouse_costs = {},
    restowage_cost = 0,
    unrolled_cost_rates = {},
    // Add new container count destructuring
    unrolled_container_counts = {
      dry_committed: 0,
      dry_non_committed: 0,
      reefer_committed: 0,
      reefer_non_committed: 0,
      total: 0,
    },
    dock_warehouse_container_counts = {
      dry_committed: 0,
      dry_non_committed: 0,
      reefer_committed: 0,
      reefer_non_committed: 0,
      total: 0,
    },
    restowage_container_count = 0,
    restowage_moves = 0,
  } = financialData || {};

  const totalMoves = load_moves + discharge_moves;

  const ContainerBreakdown = () => (
    <>
      <h4 className="text-sm font-medium text-gray-800 mb-1">Container Breakdown</h4>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border mb-3">
        <div className="bg-gray-50 px-3 py-2 border-b">
          <div className="flex items-center">
            <svg className="w-3.5 h-3.5 mr-1.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <span className="text-[10px] font-medium text-gray-700">Container Distribution</span>
          </div>
        </div>

        {/* Main container breakdown table */}
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-r">Container Type</th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-r w-1/5">
                <div className="flex flex-col items-center">
                  <span className="bg-red-100 text-red-800 px-1.5 rounded text-[9px] w-full text-center">Unrolled</span>
                </div>
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-r w-1/5">
                <div className="flex flex-col items-center">
                  <span className="bg-amber-100 text-amber-800 px-1.5 rounded text-[9px] w-full text-center">Dock</span>
                </div>
              </th>
              <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b w-1/5">
                <div className="flex flex-col items-center">
                  <span className="bg-blue-100 text-blue-800 px-1.5 rounded text-[9px] w-full text-center">Total</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r">Dry (Committed)</td>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-red-50">{unrolled_container_counts.dry_committed}</td>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-amber-50">{dock_warehouse_container_counts.dry_committed}</td>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center font-medium text-gray-700 bg-blue-50">{unrolled_container_counts.dry_committed + dock_warehouse_container_counts.dry_committed}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r">Dry (Non-Committed)</td>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-red-50">{unrolled_container_counts.dry_non_committed}</td>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-amber-50">{dock_warehouse_container_counts.dry_non_committed}</td>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center font-medium text-gray-700 bg-blue-50">{unrolled_container_counts.dry_non_committed + dock_warehouse_container_counts.dry_non_committed}</td>
            </tr>
            <tr>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r">Reefer (Committed)</td>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-red-50">{unrolled_container_counts.reefer_committed}</td>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-amber-50">{dock_warehouse_container_counts.reefer_committed}</td>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center font-medium text-gray-700 bg-blue-50">{unrolled_container_counts.reefer_committed + dock_warehouse_container_counts.reefer_committed}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r">Reefer (Non-Committed)</td>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-red-50">{unrolled_container_counts.reefer_non_committed}</td>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-amber-50">{dock_warehouse_container_counts.reefer_non_committed}</td>
              <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center font-medium text-gray-700 bg-blue-50">{unrolled_container_counts.reefer_non_committed + dock_warehouse_container_counts.reefer_non_committed}</td>
            </tr>
            <tr className="border-t-2 font-medium">
              <td className="px-2 py-2 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r">Total</td>
              <td className="px-2 py-2 whitespace-nowrap text-[10px] text-center font-medium text-red-700 border-r bg-red-100">{unrolled_container_counts.total}</td>
              <td className="px-2 py-2 whitespace-nowrap text-[10px] text-center font-medium text-amber-700 border-r bg-amber-100">{dock_warehouse_container_counts.total}</td>
              <td className="px-2 py-2 whitespace-nowrap text-[10px] text-center font-medium text-blue-700 bg-blue-100">{unrolled_container_counts.total + dock_warehouse_container_counts.total}</td>
            </tr>
          </tbody>
        </table>

        {/* Restowage information card */}
        <div className="border-t px-3 py-2 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center mb-1">
            <svg className="w-3.5 h-3.5 mr-1.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-[10px] font-medium text-blue-700">Restowage Operations</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex flex-col">
              <span className="text-gray-600">Containers requiring restowage:</span>
              <span className="font-semibold text-blue-800 text-sm">{restowage_container_count} containers</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-gray-600">Total restowage moves:</span>
              <span className="font-semibold text-blue-800 text-sm">{restowage_moves} moves</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-gray-600">Cost per move:</span>
              <span className="font-semibold text-blue-800">{formatIDR(restowage_cost)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={handleBackdropClick}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Reduced max-width for smaller modal */}
        <div ref={modalRef} className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="bg-white px-3 pt-4 pb-3 sm:p-5 sm:pb-4">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <div>
                <h3 className="text-base leading-6 font-medium text-gray-900">Financial Summary</h3>
                <p className="text-[10px] text-blue-600 font-medium mt-1">Round {currentRound} Estimates</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                X
              </button>
            </div>

            {/* TOP ROW: 3 cost rates reference tables in grid-cols-3 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Cost Rates Reference</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Table 1: Move & Restowage Costs - Blue Theme */}
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
                        <th className="px-2 py-1.5 text-left text-[10px] font-medium text-blue-800 uppercase tracking-wider border-b border-blue-200">Cost Type</th>
                        <th className="px-2 py-1.5 text-center text-[10px] font-medium text-blue-800 uppercase tracking-wider border-b border-blue-200">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      <tr className="hover:bg-blue-50">
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r border-blue-100">Move Cost (per container)</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-blue-700 font-semibold text-center">{formatIDR(move_cost || 0)}</td>
                      </tr>
                      <tr className="hover:bg-blue-50">
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r border-blue-100">Restowage Cost (per container)</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-blue-700 font-semibold text-center">{formatIDR(restowage_cost || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Table 2: Unrolled Cost Rates - Red Theme */}
                <div className="bg-gradient-to-b from-red-50 to-white rounded-lg border border-red-200 overflow-hidden shadow-sm">
                  <div className="bg-red-600 px-3 py-2">
                    <h4 className="text-sm font-semibold text-white flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Unrolled Penalty Rates
                    </h4>
                  </div>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-red-100">
                        <th className="px-2 py-1.5 text-left text-[10px] font-medium text-red-800 uppercase tracking-wider border-b border-red-200">Container</th>
                        <th className="px-2 py-1.5 text-center text-[10px] font-medium text-red-800 uppercase tracking-wider border-b border-red-200">Committed</th>
                        <th className="px-2 py-1.5 text-center text-[10px] font-medium text-red-800 uppercase tracking-wider border-b border-red-200">Non-Committed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100">
                      <tr className="hover:bg-red-50">
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r border-red-100">Dry</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-red-700 font-semibold text-center border-r border-red-100">{formatIDR(unrolled_cost_rates?.dry_committed || 0)}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-red-700 font-semibold text-center">{formatIDR(unrolled_cost_rates?.dry_non_committed || 0)}</td>
                      </tr>
                      <tr className="hover:bg-red-50">
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r border-red-100">Reefer</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-red-700 font-semibold text-center border-r border-red-100">{formatIDR(unrolled_cost_rates?.reefer_committed || 0)}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-red-700 font-semibold text-center">{formatIDR(unrolled_cost_rates?.reefer_non_committed || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Table 3: Dock Warehouse Cost Rates - Amber Theme */}
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
                        <th className="px-2 py-1.5 text-left text-[10px] font-medium text-amber-800 uppercase tracking-wider border-b border-amber-200">Container</th>
                        <th className="px-2 py-1.5 text-center text-[10px] font-medium text-amber-800 uppercase tracking-wider border-b border-amber-200">Committed</th>
                        <th className="px-2 py-1.5 text-center text-[10px] font-medium text-amber-800 uppercase tracking-wider border-b border-amber-200">Non-Committed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      <tr className="hover:bg-amber-50">
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r border-amber-100">Dry</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-amber-700 font-semibold text-center border-r border-amber-100">{formatIDR(dock_warehouse_costs?.dry?.committed || 0)}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-amber-700 font-semibold text-center">{formatIDR(dock_warehouse_costs?.dry?.non_committed || 0)}</td>
                      </tr>
                      <tr className="hover:bg-amber-50">
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r border-amber-100">Reefer</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-amber-700 font-semibold text-center border-r border-amber-100">{formatIDR(dock_warehouse_costs?.reefer?.committed || 0)}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-amber-700 font-semibold text-center">{formatIDR(dock_warehouse_costs?.reefer?.non_committed || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* MIDDLE ROW: Container Breakdown and Financial Results Tables side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {/* Container Breakdown Table */}
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-1">Container Breakdown</h4>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border mb-3">
                  <div className="bg-gray-50 px-3 py-2 border-b">
                    <div className="flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                      <span className="text-[10px] font-medium text-gray-700">Container Distribution</span>
                    </div>
                  </div>

                  {/* Main container breakdown table */}
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-2 py-1.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-r">Container Type</th>
                        <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-r">
                          <div className="flex flex-col items-center">
                            <span className="bg-red-100 text-red-800 px-1.5 rounded text-[9px] w-full text-center">Unrolled</span>
                          </div>
                        </th>
                        <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-r">
                          <div className="flex flex-col items-center">
                            <span className="bg-amber-100 text-amber-800 px-1.5 rounded text-[9px] w-full text-center">Dock</span>
                          </div>
                        </th>
                        <th className="px-2 py-1.5 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b">
                          <div className="flex flex-col items-center">
                            <span className="bg-blue-100 text-blue-800 px-1.5 rounded text-[9px] w-full text-center">Total</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      <tr>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r">Dry (Committed)</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-red-50">{unrolled_container_counts.dry_committed}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-amber-50">{dock_warehouse_container_counts.dry_committed}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center font-medium text-gray-700 bg-blue-50">{unrolled_container_counts.dry_committed + dock_warehouse_container_counts.dry_committed}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r">Dry (Non-Committed)</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-red-50">{unrolled_container_counts.dry_non_committed}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-amber-50">{dock_warehouse_container_counts.dry_non_committed}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center font-medium text-gray-700 bg-blue-50">{unrolled_container_counts.dry_non_committed + dock_warehouse_container_counts.dry_non_committed}</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r">Reefer (Committed)</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-red-50">{unrolled_container_counts.reefer_committed}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-amber-50">{dock_warehouse_container_counts.reefer_committed}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center font-medium text-gray-700 bg-blue-50">{unrolled_container_counts.reefer_committed + dock_warehouse_container_counts.reefer_committed}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r">Reefer (Non-Committed)</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-red-50">{unrolled_container_counts.reefer_non_committed}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center text-gray-700 border-r bg-amber-50">{dock_warehouse_container_counts.reefer_non_committed}</td>
                        <td className="px-2 py-1.5 whitespace-nowrap text-[10px] text-center font-medium text-gray-700 bg-blue-50">{unrolled_container_counts.reefer_non_committed + dock_warehouse_container_counts.reefer_non_committed}</td>
                      </tr>
                      <tr className="border-t-2 font-medium">
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] font-medium text-gray-800 border-r">Total</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-center font-medium text-red-700 border-r bg-red-100">{unrolled_container_counts.total}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-center font-medium text-amber-700 border-r bg-amber-100">{dock_warehouse_container_counts.total}</td>
                        <td className="px-2 py-2 whitespace-nowrap text-[10px] text-center font-medium text-blue-700 bg-blue-100">{unrolled_container_counts.total + dock_warehouse_container_counts.total}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Restowage information card */}
                  <div className="border-t px-3 py-2 bg-gradient-to-r from-blue-50 to-white">
                    <div className="flex items-center mb-1">
                      <svg className="w-3.5 h-3.5 mr-1.5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-[10px] font-medium text-blue-700">Restowage Operations</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <div className="flex flex-col">
                        <span className="text-gray-600">Containers requiring restowage:</span>
                        <span className="font-semibold text-blue-800 text-sm">{restowage_container_count} containers</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-gray-600">Total restowage moves:</span>
                        <span className="font-semibold text-blue-800 text-sm">{restowage_moves} moves</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-gray-600">Cost per move:</span>
                        <span className="font-semibold text-blue-800">{formatIDR(restowage_cost)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Results Table */}
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-1">Financial Results</h4>
                <div className="bg-white rounded-lg shadow-md overflow-hidden border">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b">Category</th>
                        <th className="px-3 py-2 text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b">Count</th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b">Financial Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {/* Revenue row */}
                      <tr>
                        <td className="px-3 py-2 text-[10px] font-medium text-gray-900 border-r">
                          <div className="flex items-center">
                            <svg className="w-3.5 h-3.5 mr-1.5 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Total Revenue
                          </div>
                        </td>
                        <td className="px-3 py-2 text-[10px] text-center text-gray-500 border-r">-</td>
                        <td className="px-3 py-2 text-[10px] text-right font-medium text-green-600">{formatIDR(revenue)}</td>
                      </tr>

                      {/* Move Costs */}
                      <tr className="bg-gray-50">
                        <td className="px-3 py-2 text-[10px] font-medium text-gray-900 border-r">
                          <div className="flex items-center">
                            <svg className="w-3.5 h-3.5 mr-1.5 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Container Moves
                          </div>
                        </td>
                        <td className="px-3 py-2 text-[10px] text-center text-gray-500 border-r">{totalMoves}</td>
                        <td className="px-3 py-2 text-[10px] text-right font-medium text-red-600">{formatIDR(moves_penalty)}</td>
                      </tr>

                      {/* Unrolled Cards */}
                      <tr>
                        <td className="px-3 py-2 text-[10px] font-medium text-gray-900 border-r">
                          <div className="flex items-center">
                            <svg className="w-3.5 h-3.5 mr-1.5 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Unrolled Cards
                          </div>
                        </td>
                        <td className="px-3 py-2 text-[10px] text-center text-gray-500 border-r">{unrolled_container_counts.total}</td>
                        <td className="px-3 py-2 text-[10px] text-right font-medium text-red-600">{formatIDR(unrolled_penalty)}</td>
                      </tr>

                      {/* Dock Warehouse */}
                      <tr className="bg-gray-50">
                        <td className="px-3 py-2 text-[10px] font-medium text-gray-900 border-r">
                          <div className="flex items-center">
                            <svg className="w-3.5 h-3.5 mr-1.5 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Dock Warehouse
                          </div>
                        </td>
                        <td className="px-3 py-2 text-[10px] text-center text-gray-500 border-r">{dock_warehouse_container_counts.total}</td>
                        <td className="px-3 py-2 text-[10px] text-right font-medium text-red-600">{formatIDR(dock_warehouse_penalty)}</td>
                      </tr>

                      {/* Restowage */}
                      <tr>
                        <td className="px-3 py-2 text-[10px] font-medium text-gray-900 border-r">
                          <div className="flex items-center">
                            <svg className="w-3.5 h-3.5 mr-1.5 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Restowage
                          </div>
                        </td>
                        <td className="px-3 py-2 text-[10px] text-center text-gray-500 border-r">
                          {restowage_container_count} ({restowage_moves} moves)
                        </td>
                        <td className="px-3 py-2 text-[10px] text-right font-medium text-red-600">{formatIDR(restowage_penalty)}</td>
                      </tr>

                      {/* Total Penalties */}
                      <tr className="bg-red-50">
                        <td className="px-3 py-2 text-[10px] font-bold text-red-800 border-r">Total Penalties</td>
                        <td className="px-3 py-2 text-[10px] text-center text-gray-500 border-r">-</td>
                        <td className="px-3 py-2 text-[10px] text-right font-bold text-red-800">{formatIDR(total_penalty)}</td>
                      </tr>

                      {/* Net Result */}
                      <tr className="bg-blue-50">
                        <td className="px-3 py-2 text-[10px] font-bold text-blue-800 border-r">Net Result</td>
                        <td className="px-3 py-2 text-[10px] text-center text-gray-500 border-r">-</td>
                        <td className="px-3 py-2 text-[10px] text-right font-bold text-blue-800">{formatIDR(final_revenue)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: Estimated Net Result Card - spans full width */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-medium text-blue-100">Estimated Net Result Round {currentRound}</p>
                  <h3 className="text-xl font-bold">{formatIDR(final_revenue)}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium text-blue-100">Revenue</p>
                  <p className="text-sm font-semibold text-green-300">{formatIDR(revenue)}</p>
                  <p className="text-[10px] font-medium text-blue-100 mt-1">Penalties</p>
                  <p className="text-sm font-semibold text-red-300">{formatIDR(total_penalty)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-3 py-2 sm:px-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 py-1.5 bg-blue-600 text-[10px] font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryModal;
