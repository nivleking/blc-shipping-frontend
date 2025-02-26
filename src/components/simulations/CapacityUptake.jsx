import { useEffect, useMemo } from "react";

// Update the component to accept props instead of managing its own data fetching
const CapacityUptake = ({ port, capacityData, isLoading, refreshData }) => {
  // Extract values from props
  const {
    maxCapacity = { dry: 0, reefer: 0, total: 0 },
    cargoData = {
      onBoard: { nextPort: { dry: 0, reefer: 0 }, laterPort: { dry: 0, reefer: 0 } },
      newBookings: { nextPort: { dry: 0, reefer: 0 }, laterPort: { dry: 0, reefer: 0 } },
    },
    week = 1,
    nextPort = "",
    laterPorts = [],
  } = capacityData || {};

  // A: Jumlah container dengan tujuan port MDN saat kapal tiba di port JYP
  const pointA = useMemo(
    () => ({
      dry: cargoData.onBoard.nextPort.dry,
      reefer: cargoData.onBoard.nextPort.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    }),
    [cargoData.onBoard.nextPort]
  );

  // B: Jumlah container dengan tujuan port SUB dan MKS saat kapal tiba di port JYP
  const pointB = useMemo(
    () => ({
      dry: cargoData.onBoard.laterPort.dry,
      reefer: cargoData.onBoard.laterPort.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    }),
    [cargoData.onBoard.laterPort]
  );

  // C: Jumlah container hasil sales call dengan tujuan port MDN
  const pointC = useMemo(
    () => ({
      dry: cargoData.newBookings.nextPort.dry,
      reefer: cargoData.newBookings.nextPort.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    }),
    [cargoData.newBookings.nextPort]
  );

  // D: Jumlah container hasil sales call dengan tujuan port SUB dan MKS
  const pointD = useMemo(
    () => ({
      dry: cargoData.newBookings.laterPort.dry,
      reefer: cargoData.newBookings.laterPort.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    }),
    [cargoData.newBookings.laterPort]
  );

  // Utilisation out of this port (A+B+C+D)
  const utilizationOutOfThisPort = useMemo(
    () => ({
      dry: pointA.dry + pointB.dry + pointC.dry + pointD.dry,
      reefer: pointA.reefer + pointB.reefer + pointC.reefer + pointD.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    }),
    [pointA, pointB, pointC, pointD]
  );

  // E: Kapasitas maksimum kapal
  const pointE = maxCapacity;

  // F: Jumlah container dengan tujuan port SUB dan port MKS saat tiba di port MDN (B+D)
  const pointF = useMemo(
    () => ({
      dry: pointB.dry + pointD.dry,
      reefer: pointB.reefer + pointD.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    }),
    [pointB, pointD]
  );

  // G: Sisa kapasitas kapal saat tiba di port MDN (E-F)
  const pointG = useMemo(
    () => ({
      dry: maxCapacity.dry - pointF.dry,
      reefer: maxCapacity.reefer - pointF.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    }),
    [maxCapacity, pointF]
  );

  // Check for capacity constraints
  const hasCapacityIssue = useMemo(() => utilizationOutOfThisPort.dry > maxCapacity.dry || utilizationOutOfThisPort.reefer > maxCapacity.reefer || utilizationOutOfThisPort.total > maxCapacity.total, [utilizationOutOfThisPort, maxCapacity]);

  // TODO:
  // Saat ini pemanggilan data untuk kargo di atas kapal tiba di pelabuhan masih menghitungkan container yg disusun. Perlu ditambahkan suatu kondisi untuk menghitung container yg hanya tiba di pelabuhan
  // Mungkin pada model Container, tambahkan field `arrival_port` untuk menandakan container yg tiba di pelabuhan

  // Ketika admin memencet swap bay pada room jsx, semua bay pelabuhan akan dikriim ke respective port destination, lalu di saat itu lah status containernya harus berupa arrival_port yes. Lalu ketika arrival port yes

  return (
    <div className="space-y-8">
      <div className="text-xs text-gray-500">Status: {isLoading ? "Loading..." : "Ready"}</div>

      {/* Step 1: Capacity Estimation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Step 1: Capacity Estimation</h2>
        <p className="text-sm text-gray-600 mb-4">Forward sheet to next port after completion</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-gray-50 rounded">
            <span className="font-medium">Week:</span> {week}
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
                  Kargo diatas kapal tiba di pelabuhan
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">Next Port: {nextPort}</td>
                <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointA.dry}</td>
                <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointA.reefer}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointA.total}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">A</td>
                <td className="px-4 py-2 text-sm text-gray-700 border">
                  Jumlah container dengan tujuan port {nextPort} saat kapal tiba di port {port}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">Later Port: {laterPorts.join("/")}</td>
                <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointB.dry}</td>
                <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointB.reefer}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointB.total}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">B</td>
                <td className="px-4 py-2 text-sm text-gray-700 border">
                  Jumlah container dengan tujuan port {laterPorts.join(" dan ")} saat kapal tiba di port {port}
                </td>
              </tr>

              {/* Pemesanan baru */}
              <tr>
                <td rowSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                  Pemesanan baru untuk dimuat di pelabuhan
                  <br />
                  (Inclusive Backlog)
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">Next Port: {nextPort}</td>
                <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointC.dry}</td>
                <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointC.reefer}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointC.total}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">C</td>
                <td className="px-4 py-2 text-sm text-gray-700 border">Jumlah container hasil sales call dengan tujuan port {nextPort}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">Later Port: {laterPorts.join("/")}</td>
                <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointD.dry}</td>
                <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointD.reefer}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointD.total}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">D</td>
                <td className="px-4 py-2 text-sm text-gray-700 border">Jumlah container hasil sales call dengan tujuan port {laterPorts.join(" dan ")}</td>
              </tr>

              {/* Summary rows */}
              <tr className="bg-blue-50">
                <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-900 border">
                  Utilisation out of this port (A+B+C+D)
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{utilizationOutOfThisPort.dry}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{utilizationOutOfThisPort.reefer}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{utilizationOutOfThisPort.total}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center border"></td>
                <td className="px-4 py-2 text-sm text-blue-800 border">Jumlah muatan yang ada di kapal saat akan meninggalkan port {port}</td>
              </tr>

              <tr>
                <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                  Maximum Ship Capacity
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{maxCapacity.dry}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{maxCapacity.reefer}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{maxCapacity.total}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">E</td>
                <td className="px-4 py-2 text-sm text-gray-700 border">Kapasitas maksimum kapal</td>
              </tr>

              <tr>
                <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                  Utilisation out of next port (B+D)
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointF.dry}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointF.reefer}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointF.total}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">F</td>
                <td className="px-4 py-2 text-sm text-gray-700 border">
                  Jumlah container dengan tujuan port {laterPorts.join(" dan ")} saat tiba di port {nextPort}
                </td>
              </tr>

              <tr>
                <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                  Remaining available capacity at next port (E-F)
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.dry}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.reefer}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.total}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">G</td>
                <td className="px-4 py-2 text-sm text-gray-700 border">Sisa kapasitas kapal saat tiba di port {nextPort}</td>
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
                  <span className="font-medium">Perhatian:</span> Jika kendala kapasitas terlampaui lalu nominasi pemesanan untuk perhitungan bergulir dan ulang
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapacityUptake;
