import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../../context/AppContext";
import { api } from "../../../axios/axios";
import { useParams } from "react-router-dom";
import CapacityEstimation from "./CapacityEstimation";
import OrderProcessing from "./OrderProcessing";

const formatIDR = (value) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
};

const CapacityUptake = ({ currentRound, totalRounds }) => {
  const { roomId } = useParams();
  const { user, token } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [capacityData, setCapacityData] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(currentRound);
  const [error, setError] = useState(null);
  const [salesCallsData, setSalesCallsData] = useState({ weekSalesCalls: [], weekRevenueTotal: 0 });
  const [port, setPort] = useState("");
  const [nextPort, setNextPort] = useState("");
  const [laterPorts, setLaterPorts] = useState([]);
  const [maxCapacity, setMaxCapacity] = useState({ dry: 0, reefer: 0, total: 0 });
  const [pointG, setPointG] = useState({ dry: 0, reefer: 0, total: 0 });
  const [capacityStatus, setCapacityStatus] = useState({ dry: 0, reefer: 0, total: 0 });
  const [hasCapacityIssue, setHasCapacityIssue] = useState(false);

  useEffect(() => {
    if (roomId && user?.id && token) {
      fetchCapacityData(selectedWeek);
    }
  }, [roomId, user?.id, token, selectedWeek]);

  const fetchCapacityData = async (week) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/capacity-uptakes/${roomId}/${user.id}/${week}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data;
      console.log("Capacity Uptake Data:", data);
      setCapacityData(data);

      // Extract port, next port, and later ports from the data
      setPort(data.port || "");
      setNextPort(data.next_port || "");
      setLaterPorts(data.later_ports || []);

      // Extract max capacity
      setMaxCapacity({
        dry: data.max_capacity?.dry || 0,
        reefer: data.max_capacity?.reefer || 0,
        total: data.max_capacity?.total || 0,
      });

      // Extract point G (remaining capacity)
      setPointG({
        dry: data.remaining_capacity?.dry || 0,
        reefer: data.remaining_capacity?.reefer || 0,
        total: data.remaining_capacity?.total || 0,
      });

      // Process sales calls data
      const salesCalls = data.accepted_cards || [];
      const rejectedCalls = data.rejected_cards || [];

      // Combine and format sales calls data
      const formattedSalesCalls = [
        ...salesCalls.map((card) => ({
          id: card.id,
          status: "accepted",
          priority: card.priority,
          revenue: card.revenue,
          dryContainers: card.type === "dry" ? card.quantity : 0,
          reeferContainers: card.type === "reefer" ? card.quantity : 0,
          totalContainers: card.quantity,
        })),
        ...rejectedCalls.map((card) => ({
          id: card.id,
          status: "rejected",
          priority: card.priority,
          revenue: card.revenue,
          dryContainers: card.type === "dry" ? card.quantity : 0,
          reeferContainers: card.type === "reefer" ? card.quantity : 0,
          totalContainers: card.quantity,
        })),
      ];

      // Calculate total revenue from accepted cards
      const totalRevenue = salesCalls.reduce((sum, card) => sum + (card.revenue || 0), 0);

      setSalesCallsData({
        weekSalesCalls: formattedSalesCalls,
        weekRevenueTotal: totalRevenue,
      });

      // Calculate capacity status
      const acceptedDryContainers = data.dry_containers_accepted || 0;
      const acceptedReeferContainers = data.reefer_containers_accepted || 0;

      setCapacityStatus({
        dry: pointG.dry - acceptedDryContainers,
        reefer: pointG.reefer - acceptedReeferContainers,
        total: pointG.total - (acceptedDryContainers + acceptedReeferContainers),
      });

      // Check for capacity issues
      setHasCapacityIssue(pointG.dry - acceptedDryContainers < 0 || pointG.reefer - acceptedReeferContainers < 0 || pointG.total - (acceptedDryContainers + acceptedReeferContainers) < 0);
    } catch (error) {
      console.error("Error fetching capacity uptake data:", error);
      setError("Failed to load capacity uptake data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="weekSelector" className="text-sm font-medium text-gray-700">
            Select Week:
          </label>
          <select id="weekSelector" value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))} className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
            {Array.from({ length: currentRound }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Week {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Display Capacity Estimation (Step 1) */}
      <CapacityEstimation port={port} nextPort={nextPort} laterPorts={laterPorts} week={selectedWeek} totalRounds={totalRounds} maxCapacity={maxCapacity} hasCapacityIssue={hasCapacityIssue} />

      {/* Display Order Processing (Step 2) */}
      <OrderProcessing salesCallsData={salesCallsData} pointG={pointG} capacityStatus={capacityStatus} />
    </div>
  );
};

export default CapacityUptake;
