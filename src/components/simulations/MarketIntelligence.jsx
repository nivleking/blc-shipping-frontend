import { useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

const MarketIntelligence = () => {
  // Price data for different ports
  const priceData = {
    SBY: [
      { destination: "MKS", reefer: 30000000, dry: 18000000 },
      { destination: "MDN", reefer: 11000000, dry: 6000000 },
      { destination: "JYP", reefer: 24000000, dry: 16200000 },
    ],
    MDN: [
      { destination: "SBY", reefer: 22000000, dry: 13000000 },
      { destination: "MKS", reefer: 24000000, dry: 14000000 },
      { destination: "JYP", reefer: 22000000, dry: 14000000 },
    ],
    MKS: [
      { destination: "SBY", reefer: 18000000, dry: 10000000 },
      { destination: "MDN", reefer: 20000000, dry: 12000000 },
      { destination: "JYP", reefer: 24000000, dry: 16000000 },
    ],
    JYP: [
      { destination: "SBY", reefer: 19000000, dry: 13000000 },
      { destination: "MKS", reefer: 23000000, dry: 13000000 },
      { destination: "MDN", reefer: 17000000, dry: 11000000 },
    ],
  };

  // Format currency function
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Market Intelligence</h2>
        <p className="text-blue-100">Current market prices and penalties for container shipping</p>
      </div>

      {/* Tabs */}
      <TabGroup>
        <TabList className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
            ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
            }
          >
            Price Tables
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
            ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
            }
          >
            Penalties
          </Tab>
        </TabList>

        <TabPanels>
          {/* Price Tables Panel */}
          <TabPanel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(priceData).map(([origin, routes]) => (
                <div key={origin} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Origin: {origin}</h3>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Reefer</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Dry</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {routes.map((route, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{route.destination}</td>
                          <td className="px-4 py-3 text-sm text-right text-blue-600">{formatCurrency(route.reefer)}</td>
                          <td className="px-4 py-3 text-sm text-right text-green-600">{formatCurrency(route.dry)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </TabPanel>

          {/* Penalties Panel */}
          <TabPanel>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Container Rolling Penalties</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Container Type</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Non-Committed</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Committed</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Dry</td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(8000000)}</td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(16000000)}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Reefer</td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(16000000)}</td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(24000000)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">Note: An additional {formatCurrency(8000000)} penalty per container for previously rolled containers</p>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default MarketIntelligence;
