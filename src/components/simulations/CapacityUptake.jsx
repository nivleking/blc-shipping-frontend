import { useContext, useEffect, useMemo, useState } from "react";
import { api, socket } from "../../axios/axios";
import { AppContext } from "../../context/AppContext";

// Update the component to accept props instead of managing its own data fetching
const CapacityUptake = ({ port, capacityData, isLoading, refreshData, salesCallsData = { weekSalesCalls: [], weekRevenueTotal: 0 } }) => {
  const { user, token } = useContext(AppContext);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [historicalData, setHistoricalData] = useState(null);
  const [isHistoricalView, setIsHistoricalView] = useState(false);

  // Extract values from props
  const {
    maxCapacity = { dry: 0, reefer: 0, total: 0 },
    cargoData = {
      onBoard: { nextPort: { dry: 0, reefer: 0 }, laterPort: { dry: 0, reefer: 0 } },
      newBookings: { nextPort: { dry: 0, reefer: 0 }, laterPort: { dry: 0, reefer: 0 } },
    },
    week = 1,
    totalRounds = 1,
    nextPort = "",
    laterPorts = [],
    roomId = "",
  } = capacityData || {};

  // Fetch available weeks for the current user and room
  useEffect(() => {
    async function fetchAvailableWeeks() {
      if (!user?.id || !roomId || !token) return;

      try {
        const response = await api.get(`/capacity-uptake/weeks/${roomId}/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Available weeks:", response.data.data);

        if (response.data.data && response.data.data.length > 0) {
          setAvailableWeeks(response.data.data);
          if (!response.data.data.includes(week)) {
            setSelectedWeek(response.data.data[0]);
          } else {
            setSelectedWeek(week);
          }
        } else {
          // No weeks available yet (empty array returned)
          setAvailableWeeks([]);
          setSelectedWeek(week);
        }
      } catch (error) {
        console.log("No saved capacity uptake data yet. This is normal for first use.");
        setAvailableWeeks([]);
        setSelectedWeek(week);
      }
    }

    fetchAvailableWeeks();
  }, [user?.id, roomId, token, week]);

  // Load capacity data for selected week
  useEffect(() => {
    async function loadCapacityData() {
      if (!selectedWeek || !user?.id || !roomId || !token) return;

      // Reset to current data if viewing current week
      if (selectedWeek === week) {
        setHistoricalData(null);
        setIsHistoricalView(false);
        return;
      }

      try {
        const response = await api.get(`/capacity-uptake/${roomId}/${user.id}/${selectedWeek}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.data) {
          setHistoricalData(response.data.data);
          setIsHistoricalView(true);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Error loading capacity uptake data:", error);
        }
        setHistoricalData(null);
        setIsHistoricalView(false);
      }
    }

    loadCapacityData();
  }, [selectedWeek, user?.id, roomId, token, week]);

  // Save capacity uptake data when data changes
  const saveCapacityData = async () => {
    if (!user?.id || !roomId || !token) return;

    setIsSaving(true);
    try {
      await api.post(
        `/capacity-uptake`,
        {
          room_id: roomId,
          user_id: user.id,
          week: week,
          capacity_data: {
            maxCapacity,
            cargoData,
            week,
            totalRounds,
            nextPort,
            laterPorts,
          },
          sales_calls_data: salesCallsData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Capacity uptake data saved successfully");
    } catch (error) {
      console.error("Error saving capacity uptake data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save data when there are significant changes
  useEffect(() => {
    if (salesCallsData.weekSalesCalls.length > 0) {
      saveCapacityData();
    }
  }, [salesCallsData.weekSalesCalls.length, week]);

  const activeData = useMemo(() => {
    if (isHistoricalView && historicalData) {
      return {
        capacityData: historicalData.capacity_data,
        salesCallsData: historicalData.sales_calls_data,
      };
    }
    return {
      capacityData: {
        maxCapacity,
        cargoData,
        week,
        totalRounds,
        nextPort,
        laterPorts,
      },
      salesCallsData,
    };
  }, [isHistoricalView, historicalData, maxCapacity, cargoData, week, totalRounds, nextPort, laterPorts, salesCallsData]);

  const pointA = useMemo(
    () => ({
      dry: activeData.capacityData.cargoData.onBoard.nextPort.dry,
      reefer: activeData.capacityData.cargoData.onBoard.nextPort.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    }),
    [activeData.capacityData.cargoData.onBoard.nextPort]
  );

  const pointB = useMemo(
    () => ({
      dry: activeData.capacityData.cargoData.onBoard.laterPort.dry,
      reefer: activeData.capacityData.cargoData.onBoard.laterPort.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    }),
    [activeData.capacityData.cargoData.onBoard.laterPort]
  );

  const pointC = useMemo(
    () => ({
      dry: activeData.capacityData.cargoData.newBookings.nextPort.dry,
      reefer: activeData.capacityData.cargoData.newBookings.nextPort.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    }),
    [activeData.capacityData.cargoData.newBookings.nextPort]
  );

  const pointD = useMemo(
    () => ({
      dry: activeData.capacityData.cargoData.newBookings.laterPort.dry,
      reefer: activeData.capacityData.cargoData.newBookings.laterPort.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    }),
    [activeData.capacityData.cargoData.newBookings.laterPort]
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
  const pointE = activeData.capacityData.maxCapacity;

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
  const hasCapacityIssue = useMemo(
    () => utilizationOutOfThisPort.dry > activeData.capacityData.maxCapacity.dry || utilizationOutOfThisPort.reefer > activeData.capacityData.maxCapacity.reefer || utilizationOutOfThisPort.total > activeData.capacityData.maxCapacity.total,
    [utilizationOutOfThisPort, activeData.capacityData.maxCapacity]
  );

  // TODO:
  // Saat ini pemanggilan data untuk kargo di atas kapal tiba di pelabuhan masih menghitungkan container yg disusun. Perlu ditambahkan suatu kondisi untuk menghitung container yg hanya tiba di pelabuhan
  // Mungkin pada model Container, tambahkan field `arrival_port` untuk menandakan container yg tiba di pelabuhan

  // Ketika admin memencet swap bay pada room jsx, semua bay pelabuhan akan dikriim ke respective port destination, lalu di saat itu lah status containernya harus berupa arrival_port yes. Lalu ketika arrival port yes

  // Step 2
  // Calculate total accepted containers from weekSalesCalls
  const acceptedSalesCalls = useMemo(() => {
    return (activeData.salesCallsData.weekSalesCalls || []).filter((call) => call.status === "accepted");
  }, [activeData.salesCallsData.weekSalesCalls]);

  // Calculate summary of accepted sales calls
  const salesCallsSummary = useMemo(() => {
    let totalDry = 0;
    let totalReefer = 0;

    acceptedSalesCalls.forEach((call) => {
      totalDry += call.dryContainers || 0;
      totalReefer += call.reeferContainers || 0;
    });

    return {
      dry: totalDry,
      reefer: totalReefer,
      total: totalDry + totalReefer,
      revenue: activeData.salesCallsData.weekRevenueTotal || 0,
    };
  }, [acceptedSalesCalls, activeData.salesCallsData.weekRevenueTotal]);

  // Calculate capacity status after accepted sales calls
  const capacityStatus = useMemo(() => {
    return {
      dry: pointG.dry - salesCallsSummary.dry,
      reefer: pointG.reefer - salesCallsSummary.reefer,
      total: pointG.total - salesCallsSummary.total,
    };
  }, [pointG, salesCallsSummary]);

  const formatIDR = (value) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-8">
      <div className="text-xs text-gray-500">Status: {isLoading ? "Loading..." : "Ready"}</div>
      {/* {isHistoricalView && <span className="ml-2 text-blue-500 font-bold">(Viewing historical data from Week {selectedWeek})</span>} */}
      {/* Add week selector */}
      {availableWeeks.length > 0 && (
        <div className="flex items-center space-x-2">
          <label htmlFor="week-select" className="text-sm font-medium text-gray-700">
            View Week:
          </label>
          <select
            id="week-select"
            value={selectedWeek || ""}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
          >
            {availableWeeks.map((w) => (
              <option key={w} value={w}>
                Week {w}
                {w === week ? " (Current)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step 1: Capacity Estimation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Step 1: Capacity Estimation</h2>
        <p className="text-sm text-gray-600 mb-4">Forward sheet to next port after completion</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-gray-50 rounded">
            <span className="font-medium">Week:</span> {activeData.capacityData.week} of {activeData.capacityData.totalRounds}
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
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">Next Port: {activeData.capacityData.nextPort}</td>
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

      {/* Step 2: Order Processing */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">Step 2: Order Processing (Daftar Muat)</h2>

        {/* Available capacity section */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border mb-6">
            <thead className="bg-gray-100">
              <tr>
                <th colSpan="2" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Kapasitas yang tersedia disesuaikan untuk jaminan simpanan
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Dry Container (FFE)</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Reefer Container (FFE)</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Total Kargo (FFE)</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Code</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                  Sisa Kapasitas yang Tersedia untuk Dimuat
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.dry}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.reefer}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.total}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">G</td>
              </tr>
              <tr>
                <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                  Backlog From Previous Week
                </td>
                <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">0</td>
                <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">0</td>
                <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">0</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">H</td>
              </tr>
              <tr>
                <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                  Kapasitas yang Tersedia untuk Pemesanan (G-H)
                </td>
                <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.dry}</td>
                <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.reefer}</td>
                <td className="px-4 py-2 bg-black whitespace-nowrap text-sm text-gray-900 text-center border">{pointG.total}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">I</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Orders listing - use data from salesCallsData */}
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeData.salesCallsData.weekSalesCalls && activeData.salesCallsData.weekSalesCalls.length > 0 ? (
                activeData.salesCallsData.weekSalesCalls.map((card) => (
                  <tr key={card.id} className={card.status === "rejected" ? "bg-red-200 text-gray-600" : "bg-green-200"}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center font-medium border">{card.id}</td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm text-center border ${card.status === "accepted" ? "text-green-600" : "text-red-600"}`}>{card.status}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{card.priority === "Committed" ? "C" : "NC"}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{formatIDR(card.revenue)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{card.dryContainers || 0}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{card.reeferContainers || 0}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{card.totalContainers || card.quantity || 0}</td>
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
                  <tr className="bg-blue-50">
                    <td colSpan="3" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-900 border">
                      Pemesanan Terakhir untuk Seminggu
                      <br />
                      (Jumlah Pemesanan yang Diterima)
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{formatIDR(salesCallsSummary.revenue)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{salesCallsSummary.dry}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{salesCallsSummary.reefer}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{salesCallsSummary.total}</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td colSpan="3" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                      Perkiraan Total Pendapatan untuk Pemesanan yang Diterima
                      <br />
                      dan Status Kapasitas Akhir untuk Kapal
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center font-bold border">{formatIDR(salesCallsSummary.revenue)}</td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm font-bold text-center border ${capacityStatus.dry < 0 ? "text-red-600" : "text-gray-900"}`}>{capacityStatus.dry}</td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm font-bold text-center border ${capacityStatus.reefer < 0 ? "text-red-600" : "text-gray-900"}`}>{capacityStatus.reefer}</td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm font-bold text-center border ${capacityStatus.total < 0 ? "text-red-600" : "text-gray-900"}`}>{capacityStatus.total}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600 italic">*Priority menunjukkan jika pemesanan adalah untuk klien tanpa (NC) atau dengan (C) komitmen. Maksimum setiap minggu untuk pemesanan komitmen adalah 5 dan 15 slot dalam total.</p>

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
                  <p className="text-sm text-red-700">Nilai negatif menunjukkan bahwa kapal kelebihan pesanan mengenai reefer atau total slot</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CapacityUptake;
