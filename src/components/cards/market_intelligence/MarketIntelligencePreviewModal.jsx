import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { BsCheck2Circle, BsXCircle, BsTable, BsGrid } from "react-icons/bs";

const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const MarketIntelligencePreviewModal = ({ isOpen, onClose, onConfirm, data }) => {
  const [viewMode, setViewMode] = useState("matrix"); // 'matrix' or 'list'
  const [filterType, setFilterType] = useState("all"); // 'all', 'dry', 'reefer'

  if (!data) return null;

  // Helper to group price data by origin
  const groupByOrigin = (priceData) => {
    const grouped = {};

    Object.entries(priceData).forEach(([key, value]) => {
      const [origin, destination, type] = key.split("-");

      if (!grouped[origin]) {
        grouped[origin] = [];
      }

      grouped[origin].push({
        destination,
        type,
        price: value,
      });
    });

    return grouped;
  };

  // Get unique ports for verifying completeness
  const allPorts = new Set();
  Object.keys(data.price_data || {}).forEach((key) => {
    const [origin, destination] = key.split("-");
    allPorts.add(origin);
    allPorts.add(destination);
  });

  const portCount = allPorts.size;
  const ports = Array.from(allPorts).sort();
  const totalRoutes = Object.keys(data.price_data || {}).length;
  const expectedRoutes = portCount * (portCount - 1) * 2; // Each origin-destination pair has two types (Dry & Reefer)
  const isComplete = totalRoutes === expectedRoutes;

  // Filter data based on type selection
  const getFilteredPriceData = () => {
    if (filterType === "all") return data.price_data;

    const filtered = {};
    Object.entries(data.price_data || {}).forEach(([key, value]) => {
      const type = key.split("-")[2].toLowerCase();
      if (type.toLowerCase() === filterType.toLowerCase()) {
        filtered[key] = value;
      }
    });
    return filtered;
  };

  const filteredData = getFilteredPriceData();

  // Generate matrix view
  const renderMatrixView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-2 border-b border-r text-left">Origin → Dest</th>
              {ports.map((destination) => (
                <th key={destination} className="px-3 py-2 border-b border-r text-center">
                  {destination}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ports.map((origin) => (
              <tr key={origin} className="hover:bg-gray-50">
                <td className="px-3 py-2 border-b border-r font-medium bg-gray-50">{origin}</td>
                {ports.map((destination) => {
                  if (origin === destination) {
                    return (
                      <td key={destination} className="px-3 py-2 border-b border-r text-center bg-gray-100">
                        —
                      </td>
                    );
                  }

                  const reeferKey = `${origin}-${destination}-Reefer`;
                  const dryKey = `${origin}-${destination}-Dry`;

                  let reeferPrice = filteredData[reeferKey];
                  let dryPrice = filteredData[dryKey];

                  // Only show values if they pass the filter
                  if (filterType === "reefer") dryPrice = null;
                  if (filterType === "dry") reeferPrice = null;

                  return (
                    <td key={destination} className="px-3 py-2 border-b border-r text-center text-xs">
                      {reeferPrice && <div className="text-blue-600 mb-1">R: {formatPrice(reeferPrice)}</div>}
                      {dryPrice && <div className="text-green-600">D: {formatPrice(dryPrice)}</div>}
                      {!reeferPrice && !dryPrice && <span className="text-red-500">Missing</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Generate list view
  const renderListView = () => {
    const groupedData = groupByOrigin(filteredData);

    return (
      <div className="space-y-4">
        {Object.entries(groupedData).map(([origin, routes]) => (
          <div key={origin} className="bg-white rounded-lg border p-4">
            <h4 className="font-medium text-blue-800 mb-2">From: {origin}</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {routes.map((route, index) => (
                    <tr key={`${origin}-${route.destination}-${route.type}-${index}`} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{route.destination}</td>
                      <td className={`px-4 py-2 whitespace-nowrap text-sm ${route.type.toLowerCase() === "reefer" ? "text-blue-600" : "text-green-600"}`}>{route.type}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{formatPrice(route.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span>Market Intelligence Preview</span>
                      <span className="text-sm font-normal text-gray-500">{data.name || "Unnamed Data"}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{portCount} Ports</span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{totalRoutes} Routes</span>
                      {isComplete ? (
                        <span className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          <BsCheck2Circle className="mr-1" />
                          Complete
                        </span>
                      ) : (
                        <span className="flex items-center text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          <BsXCircle className="mr-1" />
                          Incomplete
                        </span>
                      )}
                    </div>
                  </div>
                </Dialog.Title>

                <div className="my-4 flex justify-between">
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                      onClick={() => setViewMode("matrix")}
                      className={`px-3 py-1.5 text-sm font-medium rounded-l-lg border ${viewMode === "matrix" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                    >
                      <BsGrid className="inline mr-1" /> Matrix View
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-1.5 text-sm font-medium rounded-r-lg border ${viewMode === "list" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                    >
                      <BsTable className="inline mr-1" /> List View
                    </button>
                  </div>

                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                      onClick={() => setFilterType("all")}
                      className={`px-3 py-1.5 text-sm font-medium border ${filterType === "all" ? "bg-blue-50 text-blue-700 border-blue-300 rounded-l-lg" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 rounded-l-lg"}`}
                    >
                      All Types
                    </button>
                    <button
                      onClick={() => setFilterType("dry")}
                      className={`px-3 py-1.5 text-sm font-medium border ${filterType === "dry" ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                    >
                      Dry Only
                    </button>
                    <button
                      onClick={() => setFilterType("reefer")}
                      className={`px-3 py-1.5 text-sm font-medium border ${filterType === "reefer" ? "bg-blue-50 text-blue-700 border-blue-300 rounded-r-lg" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 rounded-r-lg"}`}
                    >
                      Reefer Only
                    </button>
                  </div>
                </div>

                <div className="mt-4 max-h-[60vh] overflow-auto border rounded-md p-4">{viewMode === "matrix" ? renderMatrixView() : renderListView()}</div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button type="button" className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="button" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none" onClick={onConfirm}>
                    Use This Data
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MarketIntelligencePreviewModal;
