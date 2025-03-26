import React from "react";

const CapacityEstimation = ({ port = "", nextPort = "", laterPorts = [], week = 1, totalRounds = 1, maxCapacity = { dry: 0, reefer: 0, total: 0 }, hasCapacityIssue = false }) => {
  // Placeholder data for demonstration
  const pointA = { dry: 0, reefer: 0, total: 0 };
  const pointB = { dry: 0, reefer: 0, total: 0 };
  const pointC = { dry: 0, reefer: 0, total: 0 };
  const pointD = { dry: 0, reefer: 0, total: 0 };
  const utilizationOutOfThisPort = { dry: 0, reefer: 0, total: 0 };
  const pointF = { dry: 0, reefer: 0, total: 0 };
  const pointG = { dry: 0, reefer: 0, total: 0 };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Step 1: Capacity Estimation</h2>
      <p className="text-sm text-gray-600 mb-4">Forward sheet to next port after completion</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-gray-50 rounded">
          <span className="font-medium">Week:</span> {week} of {totalRounds}
        </div>

        <div className="p-3 bg-gray-50 rounded">
          <span className="font-medium">Port:</span> {port}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-100">
            <tr>
              <th rowSpan="2" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                #
              </th>
              <th rowSpan="2" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                DESTINATION PORTS
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border" colSpan="3">
                Container (FFE)
              </th>
              <th rowSpan="2" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                Code
              </th>
              <th rowSpan="2" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                Description
              </th>
            </tr>
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Dry</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Reefer</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Cargo on board */}
            <tr>
              <td rowSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                Cargo on board arriving at port
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">Next Port: {nextPort}</td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointA.dry}</td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointA.reefer}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointA.total}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">A</td>
              <td className="px-4 py-2 text-sm text-gray-700 border">
                Number of containers destined for port {nextPort} when arriving at port {port}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">Later Port: {laterPorts.join("/")}</td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointB.dry}</td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointB.reefer}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointB.total}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">B</td>
              <td className="px-4 py-2 text-sm text-gray-700 border">
                Number of containers destined for port {laterPorts.join(" and ")} when arriving at port {port}
              </td>
            </tr>

            {/* New bookings */}
            <tr>
              <td rowSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                New bookings to be loaded at port
                <br />
                (Including Backlog)
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">Next Port: {nextPort}</td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointC.dry}</td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointC.reefer}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointC.total}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">C</td>
              <td className="px-4 py-2 text-sm text-gray-700 border">Number of containers from sales calls destined for port {nextPort}</td>
            </tr>
            <tr>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">Later Port: {laterPorts.join("/")}</td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointD.dry}</td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointD.reefer}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointD.total}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">D</td>
              <td className="px-4 py-2 text-sm text-gray-700 border">Number of containers from sales calls destined for port {laterPorts.join(" and ")}</td>
            </tr>

            {/* Summary rows */}
            <tr className="bg-blue-50">
              <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-900 border">
                Utilisation out of this port (A+B+C+D)
              </td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{utilizationOutOfThisPort.dry}</td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{utilizationOutOfThisPort.reefer}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{utilizationOutOfThisPort.total}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-center border"></td>
              <td className="px-4 py-2 text-sm text-blue-800 border">Total cargo on the vessel when departing port {port}</td>
            </tr>

            <tr>
              <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                Maximum Ship Capacity
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{maxCapacity.dry}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{maxCapacity.reefer}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{maxCapacity.total}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">E</td>
              <td className="px-4 py-2 text-sm text-gray-700 border">Maximum vessel capacity</td>
            </tr>

            <tr>
              <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                Utilisation out of next port (B+D)
              </td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointF.dry}</td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointF.reefer}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointF.total}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">F</td>
              <td className="px-4 py-2 text-sm text-gray-700 border">
                Number of containers destined for port {laterPorts.join(" and ")} when arriving at port {nextPort}
              </td>
            </tr>

            <tr>
              <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                Remaining available capacity at next port (E-F)
              </td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.dry}</td>
              <td className="bg-black px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.reefer}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.total}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">G</td>
              <td className="px-4 py-2 text-sm text-gray-700 border">Remaining vessel capacity when arriving at port {nextPort}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {hasCapacityIssue && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Attention:</span> If capacity constraints are exceeded, adjust booking nominations for rolling calculation
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapacityEstimation;
