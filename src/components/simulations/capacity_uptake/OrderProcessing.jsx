import React, { useMemo } from "react";

const OrderProcessing = ({ salesCallsData = { weekSalesCalls: [], weekRevenueTotal: 0 }, pointG = { dry: 0, reefer: 0, total: 0 }, pointH = { dry: 1, reefer: 1, total: 2 }, capacityStatus = { dry: 0, reefer: 0, total: 0 } }) => {
  // Sort the sales calls by presumed order of processing
  // We assume they're in chronological order within each accepted/rejected array
  // and we use the index as a proxy for timestamp
  const sortedSalesCalls = useMemo(() => {
    // Create a copy with index information to track original order
    const acceptedWithIndex = (salesCallsData.weekSalesCalls || []).filter((call) => call.status === "accepted").map((call, index) => ({ ...call, originalIndex: index, listType: "accepted" }));

    const rejectedWithIndex = (salesCallsData.weekSalesCalls || []).filter((call) => call.status === "rejected").map((call, index) => ({ ...call, originalIndex: index, listType: "rejected" }));

    // Combine all cards
    const allCards = [...acceptedWithIndex, ...rejectedWithIndex];

    // Sort by card ID as a proxy for chronological order
    // This assumes card IDs are assigned sequentially
    return allCards.sort((a, b) => {
      return (a.processed_at || 0) - (b.processed_at || 0);
    });
  }, [salesCallsData.weekSalesCalls]);

  // Get sales calls that have been accepted
  const acceptedSalesCalls = salesCallsData.weekSalesCalls.filter((call) => call.status === "accepted");

  // Calculate summary of accepted sales calls
  const salesCallsSummary = {
    dry: 0,
    reefer: 0,
    total: 0,
    revenue: salesCallsData.weekRevenueTotal || 0,
  };

  // Calculate the total containers in accepted sales calls
  acceptedSalesCalls.forEach((call) => {
    salesCallsSummary.dry += call.dryContainers || 0;
    salesCallsSummary.reefer += call.reeferContainers || 0;
  });
  salesCallsSummary.total = salesCallsSummary.dry + salesCallsSummary.reefer;

  const formatIDR = (value) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  };

  const pointI = {
    dry: pointG.dry - pointH.dry,
    reefer: pointG.reefer - pointH.reefer,
    total: pointG.total - pointH.total,
  };

  const pointJ = {
    dry: salesCallsSummary.dry,
    reefer: salesCallsSummary.reefer,
    total: salesCallsSummary.total,
  };

  // Point I - Point J
  const pointK = {
    dry: pointI.dry - pointJ.dry,
    reefer: pointI.reefer - pointJ.reefer,
    total: pointI.total - pointJ.total,
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Step 2: Order Processing (Loading List)</h2>

      {/* Available capacity section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                Capacity adjusted for guaranteed deposits
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Dry Container (FFE)</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Reefer Container (FFE)</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Total Cargo (FFE)</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Code</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-yellow-400">
              <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                Remaining Capacity Available for Loading
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.dry}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.reefer}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.total}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">G</td>
            </tr>
            <tr className="bg-yellow-100">
              <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                Backlog From Previous Week
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointH.dry}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointH.reefer}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointH.total}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">H</td>
            </tr>
            <tr>
              <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                Capacity Available for Bookings (G-H)
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-center border text-gray-900">{pointI.dry}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-center border text-gray-900">{pointI.reefer}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-center border text-gray-900">{pointI.total}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">I</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Orders listing - Sorted by order of processing */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-xs text-center font-medium text-gray-500 uppercase tracking-wider border">BOOKING NUMBER</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Status</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Priority (NC/C)</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Revenue (IDR)</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Dry</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Reefer</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Total</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Code</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSalesCalls.length > 0 ? (
              sortedSalesCalls.map((card) => (
                <tr key={card.id} className={card.status === "rejected" ? "bg-red-200 text-gray-600" : "bg-green-200"}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-center font-medium border">{card.id}</td>
                  <td className={`px-4 py-2 whitespace-nowrap text-sm text-center border ${card.status === "accepted" ? "text-green-600" : "text-red-600"}`}>{card.status === "accepted" ? "Accepted" : "Rejected"}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{card.priority === "Committed" ? "C" : "NC"}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{formatIDR(card.revenue)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{card.dryContainers || 0}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{card.reeferContainers || 0}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{card.totalContainers || card.quantity || 0}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border"></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500 border italic">
                  Get your sales call cards from section 2!
                </td>
              </tr>
            )}

            {/* Only show summary for accepted cards */}
            {acceptedSalesCalls.length > 0 && (
              <>
                <tr className="bg-blue-100">
                  <td colSpan="3" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-900 border">
                    Final Bookings for the Week
                    <br />
                    (Total Accepted Bookings)
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{formatIDR(salesCallsSummary.revenue)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{pointJ.dry}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{pointJ.reefer}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{pointJ.total}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">J</td>
                </tr>
                <tr className="bg-gray-100">
                  <td colSpan="3" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                    Estimated Total Revenue for Accepted Bookings and Final Capacity Status for the Ship (I-J)
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center font-bold border">{formatIDR(salesCallsSummary.revenue)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center font-bold border">{pointK.dry}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center font-bold border">{pointK.reefer}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center font-bold border">{pointK.total}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">K</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600 italic">*Priority indicates whether the booking is for a Non-Committed (NC) or Committed (C) client. Maximum per week for committed bookings is 5 and 15 slots in total.</p>

        {acceptedSalesCalls.length > 0 && (capacityStatus.dry < 0 || capacityStatus.reefer < 0 || capacityStatus.total < 0) && (
          <div className="mt-3 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">Negative values indicate that the ship is overbooked regarding reefer or total slots</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderProcessing;
