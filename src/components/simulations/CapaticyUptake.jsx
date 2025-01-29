import { useState } from "react";

const CapacityUptake = () => {
  // Step 1 state
  const [currentPort] = useState("JYP");
  const [week] = useState(1);
  const [shipName] = useState("Ship A");
  const [cargoData, setCargoData] = useState({
    onBoard: {
      nextPort: { dry: 2, reefer: 3 },
      laterPort: { dry: 11, reefer: 12 },
    },
    newBookings: {
      nextPort: { dry: 7, reefer: 0 },
      laterPort: { dry: 7, reefer: 8 },
    },
  });

  // Ship capacity
  const maxCapacity = {
    dry: 30,
    reefer: 24,
    total: 54,
  };

  // Step 2 state
  const [bookings] = useState([
    { id: 21, priority: "C", revenue: 91000000, dry: 7, reefer: 0 },
    { id: 80, priority: "NC", revenue: 69000000, dry: 0, reefer: 3 },
    { id: 18, priority: "C", revenue: 56000000, dry: 7, reefer: 0 },
    { id: 85, priority: "C", revenue: 135000000, dry: 0, reefer: 5 },
  ]);

  // Calculations
  const totalOnBoard = {
    dry: cargoData.onBoard.nextPort.dry + cargoData.onBoard.laterPort.dry,
    reefer: cargoData.onBoard.nextPort.reefer + cargoData.onBoard.laterPort.reefer,
  };

  const utilization = {
    dry: totalOnBoard.dry + cargoData.newBookings.nextPort.dry + cargoData.newBookings.laterPort.dry,
    reefer: totalOnBoard.reefer + cargoData.newBookings.nextPort.reefer + cargoData.newBookings.laterPort.reefer,
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Capacity Estimation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Step 1: Capacity Estimation (Week {week})</h2>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded">
            <span className="font-medium">Ship:</span> {shipName}
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <span className="font-medium">Current Port:</span> {currentPort}
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <span className="font-medium">Next Port:</span> MDN
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dry (FFE)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reefer (FFE)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (FFE)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Cargo on board */}
            <tr>
              <td rowSpan="2" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Cargo on Board
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">MDN</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cargoData.onBoard.nextPort.dry}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cargoData.onBoard.nextPort.reefer}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cargoData.onBoard.nextPort.dry + cargoData.onBoard.nextPort.reefer}</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">SUB/MKS</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cargoData.onBoard.laterPort.dry}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cargoData.onBoard.laterPort.reefer}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cargoData.onBoard.laterPort.dry + cargoData.onBoard.laterPort.reefer}</td>
            </tr>
            {/* New bookings */}
            <tr>
              <td rowSpan="2" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                New Bookings
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">MDN</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cargoData.newBookings.nextPort.dry}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cargoData.newBookings.nextPort.reefer}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cargoData.newBookings.nextPort.dry + cargoData.newBookings.nextPort.reefer}</td>
            </tr>
            {/* Summary rows */}
            <tr className="bg-blue-50">
              <td colSpan="2" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                Total Utilization
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{utilization.dry}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{utilization.reefer}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{utilization.dry + utilization.reefer}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Step 2: Order Taking */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Step 2: Order Taking - Port {currentPort}</h2>

        <table className="min-w-full divide-y divide-gray-200 mb-6">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue (IDR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dry (FFE)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reefer (FFE)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (FFE)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.priority === "C" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{booking.priority}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.revenue.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.dry}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.reefer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.dry + booking.reefer}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Warnings */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
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
              <p className="text-sm text-yellow-700">Negative values indicate overbooking for reefer or total slots</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacityUptake;
