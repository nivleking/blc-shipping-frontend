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
  } = financialData || {};

  const totalMoves = load_moves + discharge_moves;

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
                <p className="text-xs text-blue-600 font-medium mt-1">Round {currentRound} Estimates</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                X
              </button>
            </div>

            {/* Side-by-side tables container */}
            <div className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0">
              {/* Left side: Cost Rates Table */}
              <div className="md:w-1/2">
                <h4 className="text-sm font-medium text-gray-800 mb-1">Cost Rates Reference</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border rounded-lg text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Cost Type
                        </th>
                        <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Value
                        </th>
                        <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Container Move Cost */}
                      <tr className="bg-blue-50">
                        <td colSpan="3" className="px-2 py-1 text-xs font-medium text-blue-800 uppercase">
                          Container Move Costs
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Move Cost (Load/Discharge)</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-blue-600">{formatIDR(move_cost)}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">Per move</td>
                      </tr>

                      {/* Dock Warehouse Costs */}
                      <tr className="bg-blue-50">
                        <td colSpan="3" className="px-2 py-1 text-xs font-medium text-blue-800 uppercase">
                          Dock Warehouse Costs
                        </td>
                      </tr>
                      {dock_warehouse_costs.dry && (
                        <>
                          <tr>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Dry Container (Committed)</td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-blue-600">{formatIDR(dock_warehouse_costs.dry.committed || 0)}</td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">Per week</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Dry Container (Non-Committed)</td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-blue-600">{formatIDR(dock_warehouse_costs.dry.non_committed || 0)}</td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">Per week</td>
                          </tr>
                        </>
                      )}
                      {dock_warehouse_costs.reefer && (
                        <>
                          <tr>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Reefer Container (Committed)</td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-blue-600">{formatIDR(dock_warehouse_costs.reefer.committed || 0)}</td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">Per week</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Reefer Container (Non-Committed)</td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-blue-600">{formatIDR(dock_warehouse_costs.reefer.non_committed || 0)}</td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">Per week</td>
                          </tr>
                        </>
                      )}

                      {/* Restowage Cost */}
                      <tr className="bg-blue-50">
                        <td colSpan="3" className="px-2 py-1 text-xs font-medium text-blue-800 uppercase">
                          Restowage Costs
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Restowage Cost</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-blue-600">{formatIDR(restowage_cost)}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">Per container</td>
                      </tr>

                      {/* Unrolled Container Costs */}
                      <tr className="bg-blue-50">
                        <td colSpan="3" className="px-2 py-1 text-xs font-medium text-blue-800 uppercase">
                          Unrolled Container Costs
                        </td>
                      </tr>
                      {unrolled_cost_rates.dry_committed && (
                        <tr>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Dry Container (Committed)</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-blue-600">{formatIDR(unrolled_cost_rates.dry_committed)}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">Per container</td>
                        </tr>
                      )}
                      {unrolled_cost_rates.dry_non_committed && (
                        <tr>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Dry Container (Non-Committed)</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-blue-600">{formatIDR(unrolled_cost_rates.dry_non_committed)}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">Per container</td>
                        </tr>
                      )}
                      {unrolled_cost_rates.reefer_committed && (
                        <tr>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Reefer Container (Committed)</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-blue-600">{formatIDR(unrolled_cost_rates.reefer_committed)}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">Per container</td>
                        </tr>
                      )}
                      {unrolled_cost_rates.reefer_non_committed && (
                        <tr>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Reefer Container (Non-Committed)</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-blue-600">{formatIDR(unrolled_cost_rates.reefer_non_committed)}</td>
                          <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">Per container</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right side: Financial Results Table */}
              <div className="md:w-1/2">
                <h4 className="text-sm font-medium text-gray-800 mb-1">Financial Results</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border rounded-lg text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Category
                        </th>
                        <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Value
                        </th>
                        <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Revenue Section */}
                      <tr className="bg-green-50">
                        <td colSpan="3" className="px-2 py-1 text-xs font-medium text-green-800 uppercase">
                          Estimated Revenue
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Total Revenue from Accepted Cards</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-green-600">{formatIDR(revenue)}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">—</td>
                      </tr>

                      {/* Penalties Section */}
                      <tr className="bg-red-50">
                        <td colSpan="3" className="px-2 py-1 text-xs font-medium text-red-800 uppercase">
                          Estimated Penalties
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Container Moves Penalty</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-red-600">{formatIDR(moves_penalty)}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">
                          {load_moves}+{discharge_moves}={totalMoves} moves
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Dock Warehouse Penalty</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-red-600">{formatIDR(dock_warehouse_penalty)}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">—</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Unrolled Cards Penalty</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-red-600">{formatIDR(unrolled_penalty)}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">—</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">Restowage Penalty</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-red-600">{formatIDR(restowage_penalty)}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">—</td>
                      </tr>
                      <tr className="bg-red-50">
                        <td className="px-2 py-1 whitespace-nowrap text-xs font-medium text-red-800">Total Penalties</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right font-bold text-red-800">{formatIDR(total_penalty)}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">—</td>
                      </tr>

                      {/* Final Revenue Section */}
                      <tr className="bg-blue-50">
                        <td colSpan="3" className="px-2 py-1 text-xs font-medium text-blue-800 uppercase">
                          Final Revenue
                        </td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="px-2 py-1 whitespace-nowrap text-xs font-medium text-blue-700">Revenue - Penalties</td>
                        <td className="px-2 py-1 whitespace-nowrap text-sm text-right font-bold text-blue-900">{formatIDR(final_revenue)}</td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-500">
                          {formatIDR(revenue)}-{formatIDR(total_penalty)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-3 py-2 sm:px-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 py-1.5 bg-blue-600 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto"
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
