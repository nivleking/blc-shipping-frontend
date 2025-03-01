import { useContext, useEffect, useMemo, useState } from "react";
import { api } from "../../axios/axios";
import { AppContext } from "../../context/AppContext";

const CapacityUptakeHistory = ({ roomId }) => {
  const { token } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [users, setUsers] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [userPorts, setUserPorts] = useState({});

  // Add new function to fetch user's port
  const fetchUserPort = async (userId) => {
    try {
      const response = await api.get(`/ship-bays/${roomId}/${userId}`);
      setUserPorts((prev) => ({
        ...prev,
        [userId]: response.data.port,
      }));
    } catch (error) {
      console.error("Error fetching user port:", error);
    }
  };

  // Fetch users first
  useEffect(() => {
    fetchUsers();
  }, [roomId]);

  // Then fetch weeks when user is selected
  useEffect(() => {
    if (selectedUserId) {
      fetchWeeks();
    }
  }, [selectedUserId]);

  // Finally fetch capacity data when week is selected
  useEffect(() => {
    if (selectedUserId && selectedWeek) {
      fetchCapacityData();
    }
  }, [selectedUserId, selectedWeek]);

  // Modify fetchUsers to also fetch ports
  const fetchUsers = async () => {
    try {
      const response = await api.get(`/rooms/${roomId}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      if (response.data.length > 0) {
        setSelectedUserId(response.data[0].id);
        // Fetch ports for all users
        await Promise.all(response.data.map((user) => fetchUserPort(user.id)));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchWeeks = async () => {
    try {
      const response = await api.get(`/capacity-uptake/weeks/${roomId}/${selectedUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeeks(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedWeek(response.data.data[0]);
      }
    } catch (error) {
      console.error("Error fetching weeks:", error);
    }
  };

  const fetchCapacityData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/capacity-uptake/${roomId}/${selectedUserId}/${selectedWeek}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching capacity data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate points using the data from controller
  const points = useMemo(() => {
    if (!data?.capacity_data) return null;

    const { cargoData, maxCapacity } = data.capacity_data;

    const pointA = {
      dry: cargoData.onBoard.nextPort.dry,
      reefer: cargoData.onBoard.nextPort.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    };

    const pointB = {
      dry: cargoData.onBoard.laterPort.dry,
      reefer: cargoData.onBoard.laterPort.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    };

    const pointC = {
      dry: cargoData.newBookings.nextPort.dry,
      reefer: cargoData.newBookings.nextPort.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    };

    const pointD = {
      dry: cargoData.newBookings.laterPort.dry,
      reefer: cargoData.newBookings.laterPort.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    };

    // Calculate utilization
    const utilization = {
      dry: pointA.dry + pointB.dry + pointC.dry + pointD.dry,
      reefer: pointA.reefer + pointB.reefer + pointC.reefer + pointD.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    };

    // Calculate remaining capacity
    const pointF = {
      dry: pointB.dry + pointD.dry,
      reefer: pointB.reefer + pointD.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    };

    const pointG = {
      dry: maxCapacity.dry - pointF.dry,
      reefer: maxCapacity.reefer - pointF.reefer,
      get total() {
        return this.dry + this.reefer;
      },
    };

    return {
      pointA,
      pointB,
      pointC,
      pointD,
      utilization,
      pointF,
      pointG,
      maxCapacity,
    };
  }, [data]);

  const formatIDR = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="flex gap-4">
        <select className="form-select rounded-lg border-gray-300" value={selectedUserId || ""} onChange={(e) => setSelectedUserId(e.target.value)}>
          <option value="">Select Player</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({userPorts[user.id] || "Loading..."})
            </option>
          ))}
        </select>

        <select className="form-select rounded-lg border-gray-300" value={selectedWeek || ""} onChange={(e) => setSelectedWeek(Number(e.target.value))} disabled={!selectedUserId}>
          <option value="">Select Week</option>
          {weeks.map((week) => (
            <option key={week} value={week}>
              Week {week}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : data && points ? (
        <div className="space-y-8">
          {/* Step 1: Capacity Estimation */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Step 1: Capacity Estimation</h2>
            <p className="text-sm text-gray-600 mb-4">Historical capacity data</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded">
                <span className="font-medium">Week:</span> {data.capacity_data.week} of {data.capacity_data.totalRounds}
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <span className="font-medium">Port:</span> {userPorts[selectedUserId]}
              </div>
            </div>

            {/* Add the main capacity table */}
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
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">Next Port: {data.capacity_data.nextPort}</td>
                    <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointA.dry}</td>
                    <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointA.reefer}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointA.total}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">A</td>
                    <td className="px-4 py-2 text-sm text-gray-700 border">Jumlah container dengan tujuan port {data.capacity_data.nextPort}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">Later Port: {data.capacity_data.laterPorts.join("/")}</td>
                    <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointB.dry}</td>
                    <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointB.reefer}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointB.total}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">B</td>
                    <td className="px-4 py-2 text-sm text-gray-700 border">Jumlah container dengan tujuan port {data.capacity_data.laterPorts.join(" dan ")}</td>
                  </tr>

                  {/* Pemesanan baru */}
                  <tr>
                    <td rowSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                      Pemesanan baru untuk dimuat di pelabuhan
                      <br />
                      (Inclusive Backlog)
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">Next Port: {data.capacity_data.nextPort}</td>
                    <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointC.dry}</td>
                    <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointC.reefer}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointC.total}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">C</td>
                    <td className="px-4 py-2 text-sm text-gray-700 border">Jumlah container hasil sales call dengan tujuan port {data.capacity_data.nextPort}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">Later Port: {data.capacity_data.laterPorts.join("/")}</td>
                    <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointD.dry}</td>
                    <td className="bg-yellow-200 px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointD.reefer}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointD.total}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">D</td>
                    <td className="px-4 py-2 text-sm text-gray-700 border">Jumlah container hasil sales call dengan tujuan port {data.capacity_data.laterPorts.join(" dan ")}</td>
                  </tr>

                  {/* Summary rows */}
                  <tr className="bg-blue-50">
                    <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-900 border">
                      Utilisation out of this port (A+B+C+D)
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{points.utilization.dry}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{points.utilization.reefer}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-900 text-center font-bold border">{points.utilization.total}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center border"></td>
                    <td className="px-4 py-2 text-sm text-blue-800 border">Jumlah muatan yang ada di kapal saat akan meninggalkan port {data.capacity_data.port}</td>
                  </tr>

                  <tr>
                    <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                      Maximum Ship Capacity
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.maxCapacity.dry}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.maxCapacity.reefer}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.maxCapacity.total}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">E</td>
                    <td className="px-4 py-2 text-sm text-gray-700 border">Kapasitas maksimum kapal</td>
                  </tr>

                  <tr>
                    <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                      Utilisation out of next port (B+D)
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointF.dry}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointF.reefer}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointF.total}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">F</td>
                    <td className="px-4 py-2 text-sm text-gray-700 border">
                      Jumlah container dengan tujuan port {data.capacity_data.laterPorts.join(" dan ")} saat tiba di port {data.capacity_data.nextPort}
                    </td>
                  </tr>

                  <tr>
                    <td colSpan="2" className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                      Remaining available capacity at next port (E-F)
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointG.dry}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointG.reefer}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointG.total}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">G</td>
                    <td className="px-4 py-2 text-sm text-gray-700 border">Sisa kapasitas kapal saat tiba di port {data.capacity_data.nextPort}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Step 2: Order Processing */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Step 2: Order Processing (Daftar Muat)</h2>

            {/* Available capacity table */}
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
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointG.dry}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointG.reefer}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center border">{points.pointG.total}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 font-medium text-center border">G</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Sales calls table */}
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
                  {data.sales_calls_data.weekSalesCalls && data.sales_calls_data.weekSalesCalls.length > 0 ? (
                    data.sales_calls_data.weekSalesCalls.map((card) => (
                      <tr key={card.id} className={card.status === "rejected" ? "bg-red-100" : "bg-green-100"}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-center font-medium border">{card.id}</td>
                        <td className={`px-4 py-2 whitespace-nowrap text-sm text-center border ${card.status === "accepted" ? "text-green-600" : "text-red-600"}`}>{card.status}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{card.priority === "Committed" ? "C" : "NC"}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{formatIDR(card.revenue)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{card.dryContainers || 0}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{card.reeferContainers || 0}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-center border">{card.totalContainers || 0}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500 border italic">
                        No sales calls data available for this week
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 italic">Select a player and week to view capacity uptake data</p>
      )}
    </div>
  );
};

export default CapacityUptakeHistory;
