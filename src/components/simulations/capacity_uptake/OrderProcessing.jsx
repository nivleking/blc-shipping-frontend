import React, { useMemo, useState } from "react";
import SalesCallCardPreview from "./SalesCallCardPreview";

const OrderProcessing = ({
  salesCallsData = { weekSalesCalls: [], weekRevenueTotal: 0 },
  pointG = { dry: 0, reefer: 0, total: 0 },
  pointH = { dry: 0, reefer: 0, total: dry + reefer },
  containers,
  unfulfilledContainers, //
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Sort the sales calls by presumed order of handling
  const sortedSalesCalls = useMemo(() => {
    // Create a single array without pre-filtering by status
    const allCards = (salesCallsData.weekSalesCalls || []).map((call) => ({
      ...call,
      originalIndex: salesCallsData.weekSalesCalls.indexOf(call),
    }));

    // Sort purely by handledAt timestamp
    return allCards.sort((a, b) => {
      const aTimestamp = a.handledAt || 0;
      const bTimestamp = b.handledAt || 0;
      return aTimestamp - bTimestamp;
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

  const isCardFulfilled = (cardId) => {
    // If there are no unfulfilled containers at all
    if (!unfulfilledContainers) {
      return true;
    }

    // Check if cardId exists in unfulfilled containers
    if (!unfulfilledContainers[cardId]) {
      return true;
    }

    // Handle case when unfulfilledContainers[cardId] is an array (current format)
    if (Array.isArray(unfulfilledContainers[cardId])) {
      return unfulfilledContainers[cardId].length === 0;
    }

    // Handle case when unfulfilledContainers[cardId] is a direct value (like a number)
    // If it's a non-null value (container ID), the card is not fulfilled
    return unfulfilledContainers[cardId] === null || unfulfilledContainers[cardId] === undefined;
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
    <div className="bg-white rounded-lg shadow-md p-3 mt-3">
      <h2 className="text-sm font-bold mb-2">Step 2: Order Processing (Loading List)</h2>

      {/* Available capacity section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border mb-3 text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th colSpan="2" className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                Capacity adjusted for guaranteed deposits
              </th>
              <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Dry Container (FFE)</th>
              <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Reefer Container (FFE)</th>
              <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Total Cargo (FFE)</th>
              <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Code</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-yellow-400">
              <td colSpan="2" className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900 border">
                Remaining Capacity Available for Loading
              </td>
              <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 text-center border">{pointG.dry}</td>
              <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 text-center border">{pointG.reefer}</td>
              <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 text-center border">{pointG.total}</td>
              <td className="px-2 py-1 whitespace-nowrap text-xs text-blue-600 font-medium text-center border">G</td>
            </tr>
            <tr className="bg-yellow-100">
              <td colSpan="2" className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900 border">
                Backlog From Previous Week
              </td>
              <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 text-center border">{pointH.dry}</td>
              <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 text-center border">{pointH.reefer}</td>
              <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 text-center border">{pointH.total}</td>
              <td className="px-2 py-1 whitespace-nowrap text-xs text-blue-600 font-medium text-center border">H</td>
            </tr>
            <tr>
              <td colSpan="2" className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900 border">
                Capacity Available for Bookings (G-H)
              </td>
              <td className="px-2 py-1 whitespace-nowrap text-xs font-bold text-center border text-gray-900">{pointI.dry}</td>
              <td className="px-2 py-1 whitespace-nowrap text-xs font-bold text-center border text-gray-900">{pointI.reefer}</td>
              <td className="px-2 py-1 whitespace-nowrap text-xs font-bold text-center border text-gray-900">{pointI.total}</td>
              <td className="px-2 py-1 whitespace-nowrap text-xs text-blue-600 font-medium text-center border">I</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Orders listing - Sorted by order of processing */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1.5 text-xs text-center font-medium text-gray-500 uppercase tracking-wider border">BOOKING NUMBER</th>
              <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Status</th>
              <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Priority</th>
              <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Revenue (IDR)</th>
              <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Dry</th>
              <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Reefer</th>
              <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Total</th>
              <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Fulfilled</th>
              <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Code</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSalesCalls.length > 0 ? (
              sortedSalesCalls.map((card) => {
                const isHovered = hoveredCard && hoveredCard.id === card.id;
                const fulfilled = card.status === "accepted" ? isCardFulfilled(card.id) : null;

                // Set base colors and hover highlight
                const baseColor = card.status === "rejected" ? "bg-red-200" : "bg-green-200";
                const highlightColor = card.status === "rejected" ? "bg-red-300 shadow-inner" : "bg-green-300 shadow-inner";

                return (
                  <tr key={card.id} className={`${isHovered ? highlightColor : baseColor} relative transition-colors duration-150`} onMouseEnter={() => setHoveredCard(card)} onMouseLeave={() => setHoveredCard(null)}>
                    <td className="px-2 py-1 whitespace-nowrap text-xs text-center font-medium border">{card.id}</td>
                    <td className={`px-2 py-1 whitespace-nowrap text-xs text-center border ${card.status === "accepted" ? "text-green-600" : "text-red-600"}`}>{card.status === "accepted" ? "Accepted" : "Rejected"}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs text-center border">
                      {card.priority}
                      {card.isBacklog ? " (Backlog)" : ""}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs text-center border">{formatIDR(card.revenue)}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs text-center border">{card.dryContainers || 0}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs text-center border">{card.reeferContainers || 0}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs text-center border">{card.totalContainers || card.quantity || 0}</td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs text-center border">
                      {card.status === "accepted" &&
                        (fulfilled ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                            <svg className="w-3 h-3 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-100 rounded-full">
                            <svg className="w-3 h-3 text-amber-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </span>
                        ))}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs text-blue-600 font-medium text-center border"></td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="px-2 py-2 text-center text-xs text-gray-500 border italic">
                  Get your sales call cards from section sales calls!
                </td>
              </tr>
            )}

            {/* Only show summary for accepted cards */}
            {acceptedSalesCalls.length > 0 && (
              <>
                <tr className="bg-blue-100">
                  <td colSpan="3" className="px-2 py-1 whitespace-nowrap text-xs font-medium text-blue-900 border">
                    Final Bookings for the Week
                    <br />
                    (Total Accepted Bookings)
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-blue-900 text-center font-bold border">{formatIDR(salesCallsSummary.revenue)}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-blue-900 text-center font-bold border">{pointJ.dry}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-blue-900 text-center font-bold border">{pointJ.reefer}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-blue-900 text-center font-bold border">{pointJ.total}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 text-center font-bold border"></td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-blue-600 font-medium text-center border">J</td>
                </tr>
                <tr className="bg-gray-100">
                  <td colSpan="3" className="px-2 py-1 whitespace-nowrap text-xs font-medium text-gray-900 border">
                    Estimated Total Revenue for Accepted Bookings and Final Capacity Status for the Ship (I-J)
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 text-center font-bold border">{formatIDR(salesCallsSummary.revenue)}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 text-center font-bold border">{pointK.dry}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 text-center font-bold border">{pointK.reefer}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 text-center font-bold border">{pointK.total}</td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 text-center font-bold border"></td>
                  <td className="px-2 py-1 whitespace-nowrap text-xs text-blue-600 font-medium text-center border">K</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* <div className="mt-2">
        {acceptedSalesCalls.length > 0 && (capacityStatus.dry < 0 || capacityStatus.reefer < 0 || capacityStatus.total < 0) && (
          <div className="mt-2 bg-red-50 border-l-4 border-red-400 p-2">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-2">
                <p className="text-xs text-red-700">Negative values indicate that the ship is overbooked regarding reefer or total slots</p>
              </div>
            </div>
          </div>
        )}
      </div> */}
      {hoveredCard && <SalesCallCardPreview card={hoveredCard} containers={containers} />}
    </div>
  );
};

export default OrderProcessing;
