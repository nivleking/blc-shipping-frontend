import React, { useState, useEffect, useContext, useMemo } from "react";
import { AppContext } from "../../../context/AppContext";
import { api } from "../../../axios/axios";
import { useParams } from "react-router-dom";
import CapacityEstimation from "./CapacityEstimation";
import OrderProcessing from "./OrderProcessing";
import LoadingSpinner from "../LoadingSpinner";
import useToast from "../../../toast/useToast";

const CapacityUptake = ({
  currentRound,
  totalRounds,
  containers,
  unfulfilledContainers,
  userId = null,
  isAdminView = false, //
}) => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { roomId } = useParams();
  const { user, token } = useContext(AppContext);
  const effectiveUserId = isAdminView ? userId : user?.id;
  const [isLoading, setIsLoading] = useState(false);
  const [capacityData, setCapacityData] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(currentRound);
  const [error, setError] = useState(null);
  const [salesCallsData, setSalesCallsData] = useState({ weekSalesCalls: [], weekRevenueTotal: 0 });
  const [port, setPort] = useState("");
  const [nextPort, setNextPort] = useState("");
  const [laterPorts, setLaterPorts] = useState([]);
  const [maxCapacity, setMaxCapacity] = useState({ dry: 0, reefer: 0, total: 0 });
  const [capacityStatus, setCapacityStatus] = useState({ dry: 0, reefer: 0, total: 0 });
  const [hasCapacityIssue, setHasCapacityIssue] = useState(false);
  // -- CENTRALIZED CAPACITY CALCULATION LOGIC --

  // Point A: Containers on board heading to next port
  const pointA = useMemo(() => {
    const containers = capacityData?.arena_start?.containers || [];
    const containersToNextPort = containers.filter((container) => {
      return container.destination === nextPort;
    });

    const dry = containersToNextPort.filter((c) => c.type === "dry").length;
    const reefer = containersToNextPort.filter((c) => c.type === "reefer").length;
    const total = dry + reefer;

    console.log(`Point A (${nextPort}):`, { dry, reefer, total });

    return { dry, reefer, total };
  }, [capacityData?.arena_start, nextPort]);

  // Point B: Containers on board heading to later ports
  const pointB = useMemo(() => {
    const containers = capacityData?.arena_start?.containers || [];
    const containersToLaterPorts = containers.filter((container) => {
      return container.destination && laterPorts.includes(container.destination);
    });

    const dry = containersToLaterPorts.filter((c) => c.type === "dry").length;
    const reefer = containersToLaterPorts.filter((c) => c.type === "reefer").length;
    const total = dry + reefer;

    console.log(`Point B (${laterPorts.join("/")}):`, { dry, reefer, total });

    return { dry, reefer, total };
  }, [capacityData?.arena_start, laterPorts]);

  // Point C: New booked containers from accepted cards to next port
  const pointC = useMemo(() => {
    const acceptedCards = capacityData?.accepted_cards || [];
    const cardsToNextPort = acceptedCards.filter((card) => card.destination === nextPort);

    let dry = 0;
    let reefer = 0;

    cardsToNextPort.forEach((card) => {
      const quantity = card.quantity || 1;
      if (card.type === "dry") {
        dry += quantity;
      } else if (card.type === "reefer") {
        reefer += quantity;
      }
    });

    const total = dry + reefer;
    return { dry, reefer, total };
  }, [capacityData?.accepted_cards, nextPort]);

  // Point D: New booked containers from accepted cards to later ports
  const pointD = useMemo(() => {
    const acceptedCards = capacityData?.accepted_cards || [];
    const cardsToLaterPorts = acceptedCards.filter((card) => laterPorts.includes(card.destination));

    let dry = 0;
    let reefer = 0;

    cardsToLaterPorts.forEach((card) => {
      const quantity = card.quantity || 1;
      if (card.type === "dry") {
        dry += quantity;
      } else if (card.type === "reefer") {
        reefer += quantity;
      }
    });

    const total = dry + reefer;
    return { dry, reefer, total };
  }, [capacityData?.accepted_cards, laterPorts]);

  // Point E: Max ship capacity (already available in maxCapacity state)
  const pointE = maxCapacity;

  // Point F: Utilization out of next port (B + D)
  const pointF = useMemo(() => {
    return {
      dry: pointB.dry + pointD.dry,
      reefer: pointB.reefer + pointD.reefer,
      total: pointB.total + pointD.total,
    };
  }, [pointB, pointD]);

  // Point G: Remaining available capacity at next port (E - F)
  const pointG = useMemo(() => {
    return {
      dry: pointE.dry - pointF.dry,
      reefer: pointE.reefer - pointF.reefer,
      total: pointE.total - pointF.total,
    };
  }, [pointE, pointF]);

  const pointH = useMemo(() => {
    const backlogData = capacityData?.backlog || { dry: 0, reefer: 0, total: 0 };

    return {
      dry: backlogData.dry || 0,
      reefer: backlogData.reefer || 0,
      total: backlogData.total || 0,
    };
  }, [capacityData?.backlog]);

  // Calculate total utilization out of this port (A + B + C + D)
  const utilizationOutOfThisPort = useMemo(() => {
    return {
      dry: pointA.dry + pointB.dry + pointC.dry + pointD.dry,
      reefer: pointA.reefer + pointB.reefer + pointC.reefer + pointD.reefer,
      total: pointA.total + pointB.total + pointC.total + pointD.total,
    };
  }, [pointA, pointB, pointC, pointD]);

  useEffect(() => {
    if (roomId && effectiveUserId && token) {
      fetchCapacityData(selectedWeek);
    }
  }, [roomId, effectiveUserId, token, selectedWeek]);

  const fetchCapacityData = async (week, bypassCache = false) => {
    setIsLoading(true);
    setError(null);
    try {
      // Add useCache parameter for admin views
      const params = {};
      if (isAdminView && !bypassCache) {
        params.useCache = true;
      }

      const response = await api.get(`/rooms/${roomId}/capacity-uptakes/${effectiveUserId}/${week}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: params,
      });

      const data = response.data.data;
      console.log("Capacity Uptake Data:", data, "Source:", response.data.source);
      setCapacityData(data);

      // Ekstrak next port dan later ports dari swap_config
      if (data.swap_config && data.port) {
        const swapConfig = data.swap_config;

        // Mendapatkan next port (port berikutnya langsung dari swap_config)
        const nextPort = swapConfig[data.port];
        setNextPort(nextPort || "");
        setPort(data.port || "");

        // Mendapatkan later ports (port-port berikutnya setelah next port)
        const laterPorts = [];
        let currentPort = nextPort;

        // Dapatkan port setelah next port
        currentPort = swapConfig[currentPort]; // Mulai dari port setelah next port

        // Buat urutan port sesuai konfigurasi
        while (currentPort && currentPort !== data.port && !laterPorts.includes(currentPort)) {
          laterPorts.push(currentPort);
          currentPort = swapConfig[currentPort];
        }

        setLaterPorts(laterPorts);
      }

      // Extract max capacity
      setMaxCapacity({
        dry: data.max_capacity?.dry || 0,
        reefer: data.max_capacity?.reefer || 0,
        total: data.max_capacity?.total || 0,
      });

      // Process sales calls data
      const salesCalls = data.accepted_cards || [];
      const rejectedCalls = data.rejected_cards || [];

      // console.log("Data capacity uptake:", data);

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
          handledAt: card.handled_at,
          isBacklog: card.is_backlog,
          origin: card.origin,
          destination: card.destination,
          type: card.type,
          quantity: card.quantity,
        })),
        ...rejectedCalls.map((card) => ({
          id: card.id,
          status: "rejected",
          priority: card.priority,
          revenue: card.revenue,
          dryContainers: card.type === "dry" ? card.quantity : 0,
          reeferContainers: card.type === "reefer" ? card.quantity : 0,
          totalContainers: card.quantity,
          handledAt: card.handled_at,
          isBacklog: card.is_backlog,
          origin: card.origin,
          destination: card.destination,
          type: card.type,
          quantity: card.quantity,
        })),
      ];

      // Calculate total revenue from accepted cards
      const totalRevenue = salesCalls.reduce((sum, card) => sum + (card.revenue || 0), 0);

      setSalesCallsData({
        weekSalesCalls: formattedSalesCalls,
        weekRevenueTotal: totalRevenue,
      });

      // Check for capacity issues
      const acceptedDryContainers = data.dry_containers_accepted || 0;
      const acceptedReeferContainers = data.reefer_containers_accepted || 0;

      setCapacityStatus({
        dry: pointG.dry - acceptedDryContainers,
        reefer: pointG.reefer - acceptedReeferContainers,
        total: pointG.total - (acceptedDryContainers + acceptedReeferContainers),
      });

      setHasCapacityIssue(pointG.dry - acceptedDryContainers < 0 || pointG.reefer - acceptedReeferContainers < 0 || pointG.total - (acceptedDryContainers + acceptedReeferContainers) < 0);
    } catch (error) {
      console.error("Error fetching capacity uptake data:", error);
      setError("Failed to load capacity uptake data");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a refresh function
  const handleRefreshData = async () => {
    try {
      // Pass true to bypass cache
      await fetchCapacityData(selectedWeek, true);
      showInfo("Data refreshed from database");
    } catch (error) {
      showError("Failed to refresh data");
    }
  };

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-32">
  //       <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs">
        <strong className="font-bold">Error!</strong>
        <span className="ml-1">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <label htmlFor="weekSelector" className="text-xs font-medium text-gray-700">
            Select Week:
          </label>
          <select id="weekSelector" value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))} className="text-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-0.5 px-2">
            {Array.from({ length: currentRound }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Week {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add refresh button for admin view */}
      {isAdminView && (
        <button
          onClick={handleRefreshData}
          disabled={isLoading}
          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Refresh data from database"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </span>
          ) : (
            <span className="flex items-center">
              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </span>
          )}
        </button>
      )}

      {/* Compact Capacity Estimation (Step 1) */}
      <CapacityEstimation
        port={port}
        nextPort={nextPort}
        laterPorts={laterPorts}
        week={selectedWeek}
        totalRounds={totalRounds}
        maxCapacity={maxCapacity}
        hasCapacityIssue={hasCapacityIssue}
        pointA={pointA}
        pointB={pointB}
        pointC={pointC}
        pointD={pointD}
        pointE={pointE}
        pointF={pointF}
        pointG={pointG}
        utilizationOutOfThisPort={utilizationOutOfThisPort}
      />

      {/* Compact Order Processing (Step 2) */}
      <OrderProcessing
        salesCallsData={salesCallsData}
        pointG={pointG}
        pointH={pointH}
        capacityStatus={capacityStatus}
        containers={containers}
        unfulfilledContainers={unfulfilledContainers} //
      />

      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default CapacityUptake;
