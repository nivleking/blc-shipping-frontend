import React, { useState, useEffect, useContext } from "react";
import { api, socket } from "../axios/axios";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import CapacityUptake from "../components/simulations/CapacityUptake";
import HeaderCards from "../components/simulations/stowages/HeaderCards";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "../components/simulations/LoadingSpinner";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import WeeklyPerformance from "../components/simulations/WeeklyPerformance";
import MarketIntelligence from "../components/simulations/MarketIntelligence";
import Stowage from "../components/simulations/Stowage";

const PORT_COLORS = {
  SBY: "#EF4444", // red
  MKS: "#3B82F6", // blue
  MDN: "#10B981", // green
  JYP: "#EAB308", // yellow
  BPN: "#8B5CF6", // purple
  BKS: "#F97316", // orange
  BGR: "#EC4899", // pink
  BTH: "#92400E", // brown
  AMQ: "#06B6D4", // cyan
  SMR: "#059669", // teal
};

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
};

const Simulation = () => {
  const { roomId } = useParams();
  const { user, token } = useContext(AppContext);
  const [port, setPort] = useState("");
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(1);

  // Stowage states
  const [droppedItems, setDroppedItems] = useState([]);
  const [baySize, setBaySize] = useState({ rows: 1, columns: 1 });
  const [bayCount, setBayCount] = useState(1);
  const [bayTypes, setBayTypes] = useState([]);
  const [bayData, setBayData] = useState([]);
  const [dockData, setDockData] = useState([]);
  const [dockSize, setDockSize] = useState({ rows: 6, columns: 6 });
  const [currentPage, setCurrentPage] = useState(0);
  const [draggingItem, setDraggingItem] = useState(null);
  const itemsPerPage = 30;
  const [salesCallCards, setSalesCallCards] = useState([]);
  const [containers, setContainers] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSwapAlert, setShowSwapAlert] = useState(false);
  const [section, setSection] = useState(1);
  const [targetContainers, setTargetContainers] = useState([]);
  const paginatedItems = droppedItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const [penalties, setPenalties] = useState(0);
  const [rank, setRank] = useState(1);
  const [moveStats, setMoveStats] = useState({
    loadMoves: 0,
    dischargeMoves: 0,
    acceptedCards: 0,
    rejectedCards: 0,
    loadPenalty: 0,
    dischargePenalty: 0,
  });
  const [swapInfo, setSwapInfo] = useState({
    receivesFrom: "",
    sendsTo: "",
  });
  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => prevPage + direction);
  };
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(1);

  // Capacity Uptake states
  const [capacityData, setCapacityData] = useState({
    maxCapacity: { dry: 0, reefer: 0, total: 0 },
    cargoData: {
      onBoard: {
        nextPort: { dry: 0, reefer: 0 },
        laterPort: { dry: 0, reefer: 0 },
      },
      newBookings: {
        nextPort: { dry: 0, reefer: 0 },
        laterPort: { dry: 0, reefer: 0 },
      },
    },
    week: 1,
    nextPort: "",
    laterPorts: [],
  });
  const [isCapacityLoading, setIsCapacityLoading] = useState(true);
  const [weekSalesCalls, setWeekSalesCalls] = useState([]);
  const [weekRevenueTotal, setWeekRevenueTotal] = useState(0);

  const fetchContainerData = async (nextPort, laterPorts) => {
    try {
      // Get current ship bay data which contains the container arena
      const shipBayResponse = await api.get(`/ship-bays/${roomId}/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Get room configuration for bay details
      const roomConfigResponse = await api.get(`/rooms/${roomId}/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Calculate max capacity based on bay configuration
      const { baySize, bayCount, bayTypes } = roomConfigResponse.data;

      // Calculate max capacity based on bay types
      let dryCapacity = 0;
      let reeferCapacity = 0;

      // If bayTypes is available, count by type
      if (bayTypes && Array.isArray(bayTypes)) {
        for (let i = 0; i < bayTypes.length; i++) {
          const bayType = bayTypes[i];
          const cellsInBay = baySize.rows * baySize.columns;

          if (bayType === "reefer") {
            reeferCapacity += cellsInBay;
          } else {
            dryCapacity += cellsInBay;
          }
        }
      } else {
        // Fallback: assume all bays are dry except last one
        const cellsInBay = baySize.rows * baySize.columns;
        dryCapacity = (bayCount - 1) * cellsInBay;
        reeferCapacity = 1 * cellsInBay; // Assume last bay is reefer
      }

      const maxCapacity = {
        dry: dryCapacity,
        reefer: reeferCapacity,
        get total() {
          return this.dry + this.reefer;
        },
      };

      console.log("Calculated max capacity:", maxCapacity);

      if (!shipBayResponse.data || !shipBayResponse.data.arena) {
        console.error("No ship bay data available");
        return { maxCapacity, cargoData: capacityData.cargoData };
      }

      // Parse arena data
      let arena;
      try {
        arena = JSON.parse(shipBayResponse.data.arena);
      } catch (error) {
        console.error("Error parsing arena data:", error);
        return { maxCapacity, cargoData: capacityData.cargoData };
      }

      // Extract valid container IDs from the arena
      let validContainerIds = [];
      for (let i = 0; i < arena.length; i++) {
        const row = arena[i];
        for (let j = 0; j < row.length; j++) {
          const anotherRow = row[j];
          if (Array.isArray(anotherRow)) {
            for (let k = 0; k < anotherRow.length; k++) {
              const value = anotherRow[k];
              if (value) {
                validContainerIds.push(value);
              }
            }
          }
        }
      }

      console.log("Valid Container IDs:", validContainerIds);

      // Process each container ID
      const containers = [];
      for (const id of validContainerIds) {
        try {
          const response = await api.get(`/containers/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          containers.push(response.data);
        } catch (error) {
          console.warn(`Failed to fetch container with ID ${id}:`, error.message);
        }
      }

      // Initialize container counts
      const nextPortCargo = { dry: 0, reefer: 0 };
      const laterPortCargo = { dry: 0, reefer: 0 };

      // Process containers based on their destination
      containers.forEach((container) => {
        if (!container || !container.card) return;

        const destination = container.card.destination;
        const type = container.type?.toLowerCase() || "dry";

        if (destination === nextPort) {
          if (type === "dry") nextPortCargo.dry++;
          else if (type === "reefer") nextPortCargo.reefer++;
        } else if (laterPorts.includes(destination)) {
          if (type === "dry") laterPortCargo.dry++;
          else if (type === "reefer") laterPortCargo.reefer++;
        }
      });

      const cardsResponse = await api.get(`/card-temporary/${roomId}/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          include: "card",
        },
      });

      const inclusiveBacklogCards = cardsResponse.data.filter((cardTemp) => cardTemp.status === "accepted" || !cardTemp.status);

      const nextPortBookings = { dry: 0, reefer: 0 };
      const laterPortBookings = { dry: 0, reefer: 0 };

      inclusiveBacklogCards.forEach((cardTemp) => {
        const card = cardTemp.card;
        console.log("Processing card:", card);
        if (!card) return;

        const destination = card.destination;
        const quantity = card.quantity || 1;
        const type = card.type?.toLowerCase();

        if (type === "dry") {
          if (destination === nextPort) {
            nextPortBookings.dry += quantity;
          } else if (laterPorts.includes(destination)) {
            laterPortBookings.dry += quantity;
          }
        } else if (type === "reefer") {
          if (destination === nextPort) {
            nextPortBookings.reefer += quantity;
          } else if (laterPorts.includes(destination)) {
            laterPortBookings.reefer += quantity;
          }
        }
      });

      // Return the updated data
      return {
        maxCapacity,
        cargoData: {
          onBoard: {
            nextPort: nextPortCargo,
            laterPort: laterPortCargo,
          },
          newBookings: {
            nextPort: nextPortBookings,
            laterPort: laterPortBookings,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching container data:", error);
      return {
        maxCapacity: { dry: 0, reefer: 0, total: 0 },
        cargoData: {
          onBoard: {
            nextPort: { dry: 0, reefer: 0 },
            laterPort: { dry: 0, reefer: 0 },
          },
          newBookings: {
            nextPort: { dry: 0, reefer: 0 },
            laterPort: { dry: 0, reefer: 0 },
          },
        },
      };
    }
  };

  const fetchCapacityData = async () => {
    console.log("Fetching capacity data in parent component...");
    setIsCapacityLoading(true);
    try {
      // Get swap configuration from room data
      const roomResponse = await api.get(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Total Rounds:", roomResponse.data.total_rounds);

      // Get the swap configuration
      let swapConfig = {};
      if (roomResponse.data.swap_config) {
        try {
          swapConfig = typeof roomResponse.data.swap_config === "string" ? JSON.parse(roomResponse.data.swap_config) : roomResponse.data.swap_config;
        } catch (e) {
          console.error("Error parsing swap config:", e);
        }
      }

      // Get week/round
      const week = roomResponse.data.current_round || 1;

      // Determine the port sequence (next ports)
      const nextPorts = determineNextPorts(port, swapConfig);
      const nextPort = nextPorts[0] || "MDN";
      const laterPorts = nextPorts.slice(1, 3) || ["SUB", "MKS"];

      // Now fetch container data based on the updated ports
      const { maxCapacity, cargoData } = await fetchContainerData(nextPort, laterPorts);

      // Set the complete capacity data
      setCapacityData({
        maxCapacity,
        cargoData,
        week,
        nextPort,
        laterPorts,
      });

      console.log("Capacity data fetched successfully in parent!");
      return { maxCapacity, cargoData, week, nextPort, laterPorts };
    } catch (error) {
      console.error("Error fetching capacity data in parent:", error);
      return null;
    } finally {
      setIsCapacityLoading(false);
    }
  };

  // Add a function to determine next ports (copied from CapacityUptake)
  const determineNextPorts = (currentPort, swapConfig) => {
    const nextPorts = [];
    let portTracker = currentPort;

    for (let i = 0; i < 3; i++) {
      portTracker = swapConfig[portTracker] || "";
      if (!portTracker) break;
      nextPorts.push(portTracker);
    }

    if (nextPorts.length === 0) return ["MDN", "SUB", "MKS"];
    if (nextPorts.length === 1) return [nextPorts[0], "SUB", "MKS"];
    if (nextPorts.length === 2) return [nextPorts[0], nextPorts[1], "MKS"];

    return nextPorts;
  };

  // Add effect to fetch capacity data when tab changes to CapacityUptake
  useEffect(() => {
    if (selectedTab === 0) {
      console.log("Tab changed to Capacity Uptake, fetching data");
      fetchCapacityData();
    }
  }, [selectedTab]);

  useEffect(() => {
    if (user && token) {
      fetchSalesCallCards();
      fetchContainers();
    }
  }, [roomId, token, user]);

  async function fetchSalesCallCards() {
    if (!user || !token) {
      console.log("User not authenticated");
      return;
    }

    setIsLoading(true);
    try {
      // Check limit first
      const limitExceeded = await checkLimitCard();
      if (limitExceeded) {
        setSalesCallCards([]);
        return;
      }

      const roomResponse = await api.get(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const deckId = roomResponse.data.deck_id;

      const portResponse = await api.get(`/rooms/${roomId}/user-port`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userPort = portResponse.data.port;

      const deckResponse = await api.get(`/decks/${deckId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const cardTemporaryResponse = await api.get(`/card-temporary/${roomId}/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const cardTemporaries = cardTemporaryResponse.data;

      const filteredCards = deckResponse.data.cards
        .filter((card) => {
          return card.origin === userPort;
        })
        .filter((card) => {
          const cardTemp = cardTemporaries.find((ct) => ct.card_id === card.id);
          return !cardTemp || cardTemp.status === "selected";
        });

      setSalesCallCards(filteredCards);
    } catch (error) {
      console.error("Error fetching sales call cards:", error);
      toast.error("Failed to load sales call cards");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchContainers() {
    try {
      const response = await api.get("/containers");
      setContainers(response.data);
    } catch (error) {
      console.error("Error fetching containers:", error);
    }
  }

  useEffect(() => {
    fetchArenaData();
    fetchDockData();

    socket.on("swap_bays", async ({ roomId: receivedRoomId }) => {
      if (receivedRoomId === roomId) {
        try {
          // This is where we need to ensure comprehensive config is fetched
          await fetchSwapConfig();

          setShowSwapAlert(true);
          let timer = 10;
          setCountdown(timer);

          const countdownInterval = setInterval(() => {
            timer -= 1;
            setCountdown(timer);

            if (timer === 0) {
              clearInterval(countdownInterval);
              setShowSwapAlert(false);
              handleSwapProcess();
            }
          }, 1000);
        } catch (error) {
          console.error("Error handling swap_bays event:", error);
        }
      }
    });

    socket.on("port_config_updated", ({ roomId: updatedRoomId }) => {
      if (updatedRoomId === roomId) {
        // Refetch swap configuration when config is updated
        fetchSwapConfig();
      }
    });

    return () => {
      socket.off("swap_bays");
      socket.off("port_config_updated");
    };
  }, [roomId, user, token]);

  const handleSwapProcess = async () => {
    setIsSwapping(true);
    try {
      await Promise.all([fetchArenaData(), fetchDockData(), fetchSalesCallCards()]);

      // Reset states
      setSection(1);
      setIsLimitExceeded(false);
      setSalesCallCards([]);
      setCurrentCardIndex(0);
      setWeekSalesCalls([]);
      setWeekRevenueTotal(0);

      if (selectedTab === 2) {
        // Assuming tab index 2 is for Weekly Performance
        // This will trigger a refetch if the component is already mounted
        // The WeeklyPerformance component itself will handle fetching data on mount
      }

      // Refetch sales cards after a short delay
      setTimeout(() => {
        fetchSalesCallCards();
      }, 500);
    } catch (error) {
      console.error("Error updating after swap:", error);
      toast.error("Failed to update bay data");
    } finally {
      setIsSwapping(false);
    }
  };

  async function fetchArenaData() {
    if (!user || !user.id) {
      console.log("User not available yet");
      return;
    }

    try {
      const roomResponse = await api.get(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTotalRounds(roomResponse.data.total_rounds);
      console.log("Total Rounds:", roomResponse.data.total_rounds);

      const response = await api.get(`ship-bays/${roomId}/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCurrentRound(response.data.current_round);
      console.log("Current Round:", response.data.current_round);

      // Initialize empty arena if none exists
      const savedArena = response.data.arena
        ? JSON.parse(response.data.arena)
        : Array(bayCount)
            .fill()
            .map(() =>
              Array(baySize.rows)
                .fill()
                .map(() => Array(baySize.columns).fill(null))
            );

      // Get revenue from response
      setRevenue(response.data.revenue || 0);
      setPort(response.data.port);
      setSection(response.data.section === "section1" ? 1 : 2);

      const containersResponse = await api.get("/containers");
      const containerData = containersResponse.data;

      // Process bay items
      const newDroppedItems = [];
      savedArena.forEach((bay, bayIndex) => {
        bay.forEach((row, rowIndex) => {
          row.forEach((item, colIndex) => {
            if (item) {
              const container = containerData.find((c) => c.id === item);
              if (container) {
                newDroppedItems.push({
                  id: item,
                  area: `bay-${bayIndex}-${rowIndex * bay[0].length + colIndex}`,
                  color: container.color,
                });
              }
            }
          });
        });
      });

      // Process dock items
      const dockResponse = await api.get(`ship-docks/${roomId}/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dockArena = dockResponse.data.arena
        ? JSON.parse(dockResponse.data.arena)
        : Array(dockSize.rows)
            .fill()
            .map(() => Array(dockSize.columns).fill(null));

      const dockItems = dockArena
        .flat()
        .map((item, index) => {
          if (item) {
            const container = containerData.find((c) => c.id === item);
            if (container) {
              return {
                id: item,
                area: `docks-${index}`,
                color: container.color,
              };
            }
          }
          return null;
        })
        .filter(Boolean);

      setDroppedItems([...dockItems, ...newDroppedItems]);

      const currentSection = response.data.section;
      if (currentSection) {
        setSection(currentSection === "section1" ? 1 : 2);
      }
    } catch (error) {
      console.error("Error fetching arena data:", error);
      const emptyBayData = Array(bayCount)
        .fill()
        .map(() =>
          Array(baySize.rows)
            .fill()
            .map(() => Array(baySize.columns).fill(null))
        );
      setBayData(emptyBayData);
      setDroppedItems([]);
    }
  }

  async function fetchDockData() {
    if (!user || !user.id) {
      console.log("User not available yet");
      return;
    }

    try {
      const response = await api.get(`ship-docks/${roomId}/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const dockSize = JSON.parse(response.data.dock_size || '{"rows": 6, "columns": 6}');
      console.log("Dock Size:", dockSize);

      setDockSize(dockSize);
    } catch (error) {
      console.error("Error fetching dock data:", error);
    }
  }

  useEffect(() => {
    fetchConfig();
  }, [roomId, token]);

  async function fetchConfig() {
    try {
      const response = await api.get(`/rooms/${roomId}/config`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { baySize, bayCount, bayTypes, section } = response.data;
      setBaySize(baySize);
      setBayCount(bayCount);
      setBayTypes(bayTypes || Array(bayCount).fill("dry"));
    } catch (error) {
      console.error("There was an error fetching the configuration!", error);
    }
  }

  useEffect(() => {
    if (currentCardIndex >= salesCallCards.length) {
      setCurrentCardIndex(0);
    }
  }, [salesCallCards, currentCardIndex]);

  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(true);

  async function fetchRankings() {
    const rankResponse = await api.get(`/rooms/${roomId}/rankings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    socket.emit("rankings_updated", {
      roomId,
      rankings: rankResponse.data,
    });
  }

  async function handleAcceptCard(cardId) {
    if (section !== 2) {
      toast.error("Please complete section 1 first!");
      return;
    }

    if (isLimitExceeded) {
      toast.error("Card limit reached for this round!");
      return;
    }

    if (isProcessingCard) {
      return;
    }

    try {
      setIsProcessingCard(true);
      setIsCardVisible(false);

      await api.post(
        `/ship-bays/${roomId}/${user.id}/cards`,
        {
          card_action: "accept",
          count: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Add the card to weekSalesCalls with status "accepted"
      const card = salesCallCards[currentCardIndex];
      setWeekSalesCalls((prev) => [
        ...prev,
        {
          ...card,
          status: "accepted",
          totalContainers: card.quantity,
          dryContainers: card.type.toLowerCase() === "dry" ? card.quantity : 0,
          reeferContainers: card.type.toLowerCase() === "reefer" ? card.quantity : 0,
        },
      ]);

      // Update total revenue
      setWeekRevenueTotal((prev) => prev + card.revenue);

      const currentCard = salesCallCards.find((card) => card.id === cardId);
      setSalesCallCards((prevCards) => prevCards.filter((card) => card.id !== cardId));

      const cardRevenue = parseFloat(currentCard.revenue) || 0;
      const newRevenue = parseFloat(revenue) + cardRevenue;

      await api.post(
        "/card-temporary/accept",
        {
          room_id: roomId,
          card_temporary_id: cardId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRevenue(newRevenue);

      const newContainers = containers.filter((container) => container.card_id === cardId);
      const updatedDroppedItems = [...droppedItems];
      let dockIndex = 0;

      const findNextAvailableCell = () => {
        while (updatedDroppedItems.some((item) => item.area === `docks-${dockIndex}`)) {
          dockIndex++;
        }
        return `docks-${dockIndex}`;
      };

      newContainers.forEach((container) => {
        const dockCellId = findNextAvailableCell();
        updatedDroppedItems.push({
          id: container.id,
          area: dockCellId,
          color: container.color,
        });
      });

      setDroppedItems(updatedDroppedItems);

      const newBayData = Array.from({ length: bayCount }).map((_, bayIndex) => {
        return Array.from({ length: baySize.rows }).map((_, rowIndex) => {
          return Array.from({ length: baySize.columns }).map((_, colIndex) => {
            const cellId = `bay-${bayIndex}-${rowIndex * baySize.columns + colIndex}`;
            const item = updatedDroppedItems.find((item) => item.area === cellId);
            return item ? item.id : null;
          });
        });
      });

      const newDockData = Array.from({ length: dockSize.rows }).map((_, rowIndex) => {
        return Array.from({ length: dockSize.columns }).map((_, colIndex) => {
          const cellId = `docks-${rowIndex * dockSize.columns + colIndex}`;
          const item = updatedDroppedItems.find((item) => item.area === cellId);
          return item ? item.id : null;
        });
      });

      // Update states
      setBayData(newBayData);
      setDockData(newDockData);
      setCurrentCardIndex((prevIndex) => (prevIndex < salesCallCards.length - 1 ? prevIndex : 0));

      await api.put(
        `/ship-bays/${roomId}/${user.id}/section`,
        {
          section: "section2",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await Promise.all([
        api.post("/ship-bays", {
          arena: newBayData,
          user_id: user.id,
          room_id: roomId,
          revenue: newRevenue,
          section: "section2",
        }),
        api.post("/ship-docks", {
          arena: newDockData,
          user_id: user.id,
          room_id: roomId,
          dock_size: dockSize,
        }),
      ]);

      await checkLimitCard();

      setTimeout(() => {
        setCurrentCardIndex((prevIndex) => (prevIndex < salesCallCards.length - 1 ? prevIndex : 0));
        setIsCardVisible(true);
      }, 1500);

      toast.success(`Containers added and revenue increased by ${formatIDR(cardRevenue)}!`);

      fetchRankings();

      socket.emit("stats_requested", {
        roomId,
        userId: user.id,
      });
    } catch (error) {
      console.error("Error accepting card:", error);
      toast.error("Failed to process card");
      setIsCardVisible(true);
    } finally {
      setIsProcessingCard(false);
      setTimeout(() => {
        setIsCardVisible(true);
      }, 300);
    }
  }

  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  // Update check limit function
  const checkLimitCard = async () => {
    try {
      const [shipBayResponse, roomResponse] = await Promise.all([
        api.get(`ship-bays/${roomId}/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const shipBay = shipBayResponse.data;
      const room = roomResponse.data;

      const isExceeded = shipBay.current_round_cards >= room.cards_limit_per_round;
      console.log("Is limit exceeded:", isExceeded);
      setIsLimitExceeded(isExceeded);
      return isExceeded;
    } catch (error) {
      console.error("Error checking card limit:", error);
      return false;
    }
  };

  useEffect(() => {
    if (section === 2) {
      fetchSalesCallCards();
      checkLimitCard();
    }
  }, [section, moveStats.acceptedCards, moveStats.rejectedCards]);

  async function handleRejectCard(cardId) {
    try {
      if (section !== 2) {
        toast.error("Please complete section 1 first!");
        return;
      }

      if (isLimitExceeded) {
        toast.error("Card limit reached for this round!");
        return;
      }

      setIsCardVisible(false);

      await api.post(
        `/ship-bays/${roomId}/${user.id}/cards`,
        {
          card_action: "reject",
          count: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await api.post(
        "/card-temporary/reject",
        {
          room_id: roomId,
          card_temporary_id: cardId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await api.put(
        `/ship-bays/${roomId}/${user.id}/section`,
        {
          section: "section2",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await checkLimitCard();

      const card = salesCallCards[currentCardIndex];
      setWeekSalesCalls((prev) => [
        ...prev,
        {
          ...card,
          status: "rejected",
          totalContainers: card.quantity,
          dryContainers: card.type.toLowerCase() === "dry" ? card.quantity : 0,
          reeferContainers: card.type.toLowerCase() === "reefer" ? card.quantity : 0,
        },
      ]);

      setSalesCallCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
      setCurrentCardIndex((prevIndex) => (prevIndex < salesCallCards.length - 1 ? prevIndex : 0));

      setTimeout(() => {
        setCurrentCardIndex((prevIndex) => (prevIndex < salesCallCards.length - 1 ? prevIndex : 0));
        setIsCardVisible(true);
      }, 1500);

      socket.emit("stats_requested", {
        roomId,
        userId: user.id,
      });
    } catch (error) {
      console.error("Error rejecting card:", error);
    } finally {
      setIsProcessingCard(false);
      setTimeout(() => {
        setIsCardVisible(true);
      }, 300);
    }
  }

  const handleDragStart = (event) => {
    const sourceItem = droppedItems.find((item) => item.id === event.active.id);

    if (sourceItem) {
      const isBlocked = isBlockedByContainerAbove(droppedItems, sourceItem.area);

      if (isBlocked) {
        event.preventDefault();
        return;
      }

      // If in section 1, check if this is a target container that needs unloading
      if (section === 1) {
        const isTargetContainer = targetContainers.some((target) => target.id === sourceItem.id);

        // If it's a target container, show a toast hint
        if (isTargetContainer) {
          toast.info("Drag this container to the ship dock to unload it", {
            position: "top-center",
            autoClose: 2000,
          });
        }
      }
    }

    setDraggingItem(event.active.id);
  };

  const checkAbove = (droppedItems, baySize, targetArea) => {
    const [type, bayIndex, cellIndex] = targetArea.split("-");
    if (type !== "bay") return true;

    const row = Math.floor(cellIndex / baySize.columns);
    const col = cellIndex % baySize.columns;

    if (row === 0) return true;

    const aboveCellId = `bay-${bayIndex}-${(row - 1) * baySize.columns + col}`;
    const containerAbove = droppedItems.find((item) => item.area === aboveCellId);

    return !containerAbove;
  };

  const checkSpace = (droppedItems, baySize, targetArea) => {
    const [type, bayIndex, cellIndex] = targetArea.split("-");

    const isOccupied = droppedItems.some((item) => item.area === targetArea);
    if (isOccupied) return false;

    if (type === "docks") {
      return true;
    }

    if (type === "bay") {
      const row = Math.floor(cellIndex / baySize.columns);
      const col = cellIndex % baySize.columns;

      // const sourceItem = droppedItems.find((item) => item.id === draggingItem);
      // if (sourceItem && isBottomContainer(sourceItem.area, targetArea)) {
      //   // toast.error("Cannot move bottom container upward", {
      //   //   position: "top-right",
      //   //   autoClose: 3000,
      //   // });
      //   return false;
      // }

      if (row < baySize.rows - 1) {
        const belowCellId = `bay-${bayIndex}-${(row + 1) * baySize.columns + col}`;
        const containerBelow = droppedItems.find((item) => item.area === belowCellId);
        if (!containerBelow) return false;
      }
    }

    return true;
  };

  const isBlockedByContainerAbove = (droppedItems, sourceArea) => {
    const [type, bayIndex, cellIndex] = sourceArea.split("-");

    if (type !== "bay") return false;

    const row = Math.floor(cellIndex / baySize.columns);
    const col = cellIndex % baySize.columns;

    if (row > 0) {
      const aboveCellId = `bay-${bayIndex}-${(row - 1) * baySize.columns + col}`;
      return droppedItems.some((item) => item.area === aboveCellId);
    }

    return false;
  };

  const isValidContainerForBay = (container, bayIndex) => {
    if (!container || bayIndex === undefined) return false;

    const bayType = bayTypes[bayIndex];
    const containerType = container.type?.toLowerCase();

    if (containerType === "dry") return true;

    if (containerType === "reefer") {
      return bayType === "reefer";
    }

    return false;
  };

  function isDirectUpperMove(fromArea, toArea, baySize) {
    const [fromType, fromBayIndex, fromCellIndex] = fromArea.split("-");
    const [toType, toBayIndex, toCellIndex] = toArea.split("-");

    if (fromType !== "bay" || toType !== "bay" || fromBayIndex !== toBayIndex) {
      return false;
    }

    const fromRow = Math.floor(parseInt(fromCellIndex, 10) / baySize.columns);
    const fromCol = parseInt(fromCellIndex, 10) % baySize.columns;
    const toRow = Math.floor(parseInt(toCellIndex, 10) / baySize.columns);
    const toCol = parseInt(toCellIndex, 10) % baySize.columns;

    return toRow === fromRow - 1 && toCol === fromCol;
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setDraggingItem(null);

    if (!over) return;

    const container = containers.find((c) => c.id === active.id);
    if (!container) return;

    const activeItem = droppedItems.find((item) => item.id === active.id);
    if (activeItem && activeItem.area === over.id) return;

    // Special handling for Section 1: Remove containers destined for current port
    if (section === 1) {
      // Check if this is a move from bay to dock
      const isFromBay = activeItem?.area?.startsWith("bay-");
      const isToDock = over.id.startsWith("docks-");

      if (isFromBay && isToDock) {
        // Check if container destination matches current port
        try {
          const containerResponse = await api.get(`/containers/${active.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (containerResponse.data.card && containerResponse.data.card.destination === port) {
            // This container should be unloaded at current port

            // Remove from dropped items (visual effect of container being removed)
            const updatedDroppedItems = droppedItems.filter((item) => item.id !== active.id);
            setDroppedItems(updatedDroppedItems);

            // Update bay data to reflect removal
            const newBayData = Array.from({ length: bayCount }).map((_, bayIndex) => {
              return Array.from({ length: baySize.rows }).map((_, rowIndex) => {
                return Array.from({ length: baySize.columns }).map((_, colIndex) => {
                  const cellId = `bay-${bayIndex}-${rowIndex * baySize.columns + colIndex}`;
                  const item = updatedDroppedItems.find((item) => item.area === cellId);
                  return item ? item.id : null;
                });
              });
            });
            setBayData(newBayData);

            toast.success("Container unloaded successfully!", {
              position: "top-right",
              autoClose: 2000,
            });

            // Track discharge move
            try {
              await api.post(
                `/ship-bays/${roomId}/${user.id}/moves`,
                {
                  move_type: "discharge",
                  count: 1,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              // Save updated bay state
              await api.post("/ship-bays", {
                arena: newBayData,
                user_id: user.id,
                room_id: roomId,
                revenue: revenue,
                section: "section1",
              });

              // Update section state to match the API
              await api.put(
                `/ship-bays/${roomId}/${user.id}/section`,
                {
                  section: "section1",
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              // Request updated stats
              socket.emit("stats_requested", {
                roomId,
                userId: user.id,
              });

              fetchRankings();

              return; // Exit early since we've handled this special case
            } catch (error) {
              console.error("API call failed", error);
              toast.error("Failed to update container status");
            }
          }
        } catch (error) {
          console.error("Error checking container destination:", error);
        }
      }
    }

    const [type, bayIndex] = over.id.split("-");

    if (type === "bay") {
      console.log("Container:", container);
      if (!isValidContainerForBay(container, parseInt(bayIndex))) {
        toast.error(container.type?.toLowerCase() === "reefer" ? "Reefer containers can only be placed in reefer bays" : "Invalid container placement", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
    }

    if (activeItem && isDirectUpperMove(activeItem.area, over.id, baySize)) {
      toast.error("Invalid placement - container cannot float", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const isSourceBlocked = isBlockedByContainerAbove(droppedItems, activeItem.area);
    if (isSourceBlocked) {
      toast.error("Cannot move container - blocked by container above", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const isAboveClear = checkAbove(droppedItems, baySize, over.id);
    const isSpaceValid = checkSpace(droppedItems, baySize, over.id);

    if (!isAboveClear) {
      toast.error("Cannot place container - blocked by container above", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    if (!isSpaceValid) {
      toast.error("Invalid placement - container cannot float", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const updatedDroppedItems = droppedItems.map((item) => (item.id === active.id ? { ...item, area: over.id } : item));
    setDroppedItems(updatedDroppedItems);

    toast.success("Container placed successfully!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    const newBayData = Array.from({ length: bayCount }).map((_, bayIndex) => {
      return Array.from({ length: baySize.rows }).map((_, rowIndex) => {
        return Array.from({ length: baySize.columns }).map((_, colIndex) => {
          const cellId = `bay-${bayIndex}-${rowIndex * baySize.columns + colIndex}`;
          const item = updatedDroppedItems.find((item) => item.area === cellId);
          return item ? item.id : null;
        });
      });
    });
    setBayData(newBayData);

    const newDockData = Array.from({ length: dockSize.rows }).map((_, rowIndex) => {
      return Array.from({ length: dockSize.columns }).map((_, colIndex) => {
        const cellId = `docks-${rowIndex * dockSize.columns + colIndex}`;
        const item = updatedDroppedItems.find((item) => item.area === cellId);
        return item ? item.id : null;
      });
    });
    setDockData(newDockData);

    console.log("User:", user);
    console.log("Room ID:", roomId);

    try {
      // Determine move type
      const fromArea = activeItem.area;
      const toArea = over.id;
      const moveType = fromArea.startsWith("bay") ? "discharge" : "load";

      // Track the move
      await api.post(
        `/ship-bays/${roomId}/${user.id}/moves`,
        {
          move_type: moveType,
          count: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Revenue:", revenue);
      const resBay = await api.post("/ship-bays", {
        arena: newBayData,
        user_id: user.id,
        room_id: roomId,
        revenue: revenue,
      });

      await api.put(
        `/ship-bays/${roomId}/${user.id}/section`,
        {
          section: section === 1 ? "section1" : "section2",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("API call successful for bays", resBay.data);

      const resDock = await api.post("/ship-docks", {
        arena: newDockData,
        user_id: user.id,
        room_id: roomId,
        dock_size: dockSize,
      });
      console.log("API call successful for docks", resDock.data);

      const resLog = await api.post(
        "/simulation-logs",
        {
          arena: newBayData,
          user_id: user.id,
          room_id: roomId,
          revenue: revenue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Request updated stats after move
      socket.emit("stats_requested", {
        roomId,
        userId: user.id,
      });

      fetchRankings();

      console.log("API call successful for logs", resLog.data);
    } catch (error) {
      console.error("API call failed", error);
    }
  }

  useEffect(() => {
    const newBayData = Array.from({ length: bayCount }).map((_, bayIndex) => {
      return Array.from({ length: baySize.rows }).map((_, rowIndex) => {
        return Array.from({ length: baySize.columns }).map((_, colIndex) => {
          const cellId = `bay-${bayIndex}-${rowIndex * baySize.columns + colIndex}`;
          const item = droppedItems.find((item) => item.area === cellId);
          return item ? item.id : 0;
        });
      });
    });
    setBayData(newBayData);
    console.log("Bay Data:", newBayData);

    const newDockData = Array.from({ length: 3 }).map((_, rowIndex) => {
      return Array.from({ length: 5 }).map((_, colIndex) => {
        const cellId = `docks-${rowIndex * 5 + colIndex}`;
        const item = droppedItems.find((item) => item.area === cellId);
        return item ? item.id : 0;
      });
    });
    setDockData(newDockData);
    console.log("Dock Data:", newDockData);
  }, [droppedItems, baySize, bayCount]);

  useEffect(() => {
    socket.on("end_simulation", ({ roomId: endedRoomId }) => {
      if (endedRoomId === roomId) {
        navigate("/user-home");
      }
    });

    return () => {
      socket.off("end_simulation");
    };
  }, [roomId, navigate]);

  const fetchSwapConfig = async () => {
    try {
      const roomResponse = await api.get(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let swapConfig = {};
      if (roomResponse.data.swap_config) {
        try {
          swapConfig = typeof roomResponse.data.swap_config === "string" ? JSON.parse(roomResponse.data.swap_config) : roomResponse.data.swap_config;
        } catch (e) {
          console.error("Error parsing swap config");
        }
      }

      const receivesFrom = Object.entries(swapConfig).find(([from, to]) => to === port)?.[0] || "Unknown";
      const sendsTo = swapConfig[port] || "Unknown";

      const allPorts = [];
      let startPort = null;

      for (const portKey in swapConfig) {
        const isReceiver = Object.values(swapConfig).includes(portKey);
        if (!isReceiver) {
          startPort = portKey;
          break;
        }
      }

      if (!startPort && Object.keys(swapConfig).length > 0) {
        startPort = Object.keys(swapConfig)[0];
      }

      if (startPort) {
        let currentPort = startPort;
        const maxPorts = Object.keys(swapConfig).length + 1;
        let count = 0;

        while (currentPort && count < maxPorts) {
          allPorts.push(currentPort);
          currentPort = swapConfig[currentPort];
          count++;
        }
      }

      setSwapInfo({
        receivesFrom,
        sendsTo,
        allPorts: allPorts.reverse(), // Reverse to show in proper order
      });
    } catch (error) {
      console.error("Error fetching swap configuration:", error);
    }
  };

  useEffect(() => {
    if (user && token) {
      // Initial fetch
      fetchStats();

      socket.on("stats_requested", async ({ roomId: requestedRoomId, userId: requestedUserId }) => {
        if (roomId === requestedRoomId && user.id === requestedUserId) {
          const stats = await fetchStats();
          socket.emit("stats_updated", {
            roomId,
            userId: user.id,
            stats,
          });
        }
      });

      // Update socket handler with null check
      socket.on("stats_updated", ({ roomId: updatedRoomId, userId: updatedUserId, stats }) => {
        if (roomId === updatedRoomId && user.id === updatedUserId && stats) {
          setMoveStats({
            loadMoves: stats.load_moves || 0,
            dischargeMoves: stats.discharge_moves || 0,
            acceptedCards: stats.accepted_cards || 0,
            rejectedCards: stats.rejected_cards || 0,
            loadPenalty: stats.load_penalty || 0,
            dischargePenalty: stats.discharge_penalty || 0,
          });
          setPenalties(stats.penalty || 0);
          setRank(stats.rank || 1);
        }
      });

      socket.on("port_config_updated", ({ roomId: updatedRoomId }) => {
        if (updatedRoomId === roomId) {
          // Update swap info
          fetchSwapConfig();
        }
      });

      return () => {
        socket.off("stats_requested");
        socket.off("stats_updated");
        socket.off("port_config_updated");
      };
    }
  }, [user, token, roomId]);

  // Add new function to fetch stats
  const fetchStats = async () => {
    try {
      const shipBayResponse = await api.get(`/ship-bays/${roomId}/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const stats = shipBayResponse.data;
      setMoveStats({
        loadMoves: stats.load_moves || 0,
        dischargeMoves: stats.discharge_moves || 0,
        acceptedCards: stats.accepted_cards || 0,
        rejectedCards: stats.rejected_cards || 0,
        loadPenalty: stats.load_penalty || 0,
        dischargePenalty: stats.discharge_penalty || 0,
      });
      setPenalties(stats.penalty || 0);

      // Fetch rankings to determine user's rank
      const rankingsResponse = await api.get(`/rooms/${roomId}/rankings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const rankings = rankingsResponse.data || [];
      const userRank = rankings.findIndex((r) => r.user_id === user.id) + 1;
      setRank(userRank || 1);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Add new function to fetch card
  const fetchCardById = async (cardId) => {
    try {
      const response = await api.get(`/cards/${cardId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching card:", error);
      return null;
    }
  };

  // Update useEffect
  useEffect(() => {
    const fetchTargetContainers = async () => {
      if (section === 1) {
        const targets = [];

        for (const item of droppedItems) {
          // Only check items in bay
          const isInBay = item.area.startsWith("bay-");
          if (!isInBay) continue;

          const container = containers.find((c) => c.id === item.id);
          if (!container) continue;

          const card = await fetchCardById(container.card_id);
          if (!card) continue;

          if (card.destination === port) {
            targets.push(item);
          }
        }

        console.log("Target Bay Containers:", targets);
        setTargetContainers(targets);
      }
    };

    fetchTargetContainers();
  }, [droppedItems, containers, port, section, token]);

  // Update validation
  const canProceedToSectionTwo = async () => {
    for (const item of droppedItems) {
      const isInBay = item.area.startsWith("bay-");
      if (!isInBay) continue;

      const container = containers.find((c) => c.id === item.id);
      if (!container) continue;

      const card = await fetchCardById(container.card_id);
      if (!card) continue;

      if (card.destination === port) {
        return false;
      }
    }
    return true;
  };

  // Update handleNextSection to save section to database
  const handleNextSection = async () => {
    const canProceed = await canProceedToSectionTwo();
    if (!canProceed) {
      toast.error("Please unload all containers destined for your port first!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      // Update section in database
      await api.put(
        `/ship-bays/${roomId}/${user.id}/section`,
        {
          section: "section2",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setSection(2);
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error("Failed to update section", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-6">
      {showSwapAlert && swapInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-2xl font-bold text-red-600 animate-pulse mb-1">SWAP ALERT!</div>
              <div className="text-5xl font-bold text-blue-600">{countdown}</div>

              {/* Port linked list visualization - now enhanced with full route */}
              <div className="w-full bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-lg text-center mb-3 text-blue-800">Container Flow Update</h3>

                {/* Complete port route visualization */}
                {swapInfo.allPorts && swapInfo.allPorts.length > 0 && (
                  <div className="mb-4 overflow-x-auto py-2">
                    <div className="flex items-center justify-center gap-1 min-w-max">
                      {swapInfo.allPorts.map((portName, index) => (
                        <React.Fragment key={`port-${index}`}>
                          {index > 0 && (
                            <svg className="w-6 h-5 text-gray-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          )}

                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs
                        ${portName === port ? "w-10 h-10 border-3 border-yellow-400 shadow-md scale-110 z-10" : ""}`}
                              style={{ backgroundColor: PORT_COLORS[portName?.substring(0, 3)?.toUpperCase()] || "#64748B" }}
                            >
                              {portName.substring(0, 1).toUpperCase()}
                            </div>
                            <span className={`text-xs mt-1 ${portName === port ? "font-bold" : ""}`}>
                              {portName}
                              {portName === port && <span className="block text-[10px] text-blue-700">(You)</span>}
                            </span>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct connections visualization (keep this part too for clarity) */}
                <div className="flex items-center justify-center gap-2 mt-2">
                  {/* Port that sends TO user */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: PORT_COLORS[swapInfo.sendsTo?.substring(0, 3)?.toUpperCase()] || "#64748B" }}>
                      {swapInfo.sendsTo?.substring(0, 1)?.toUpperCase() || "-"}
                    </div>
                    <span className="text-xs font-medium mt-1 block">{(swapInfo && swapInfo.sendsTo) || "Unknown"}</span>
                  </div>

                  {/* First arrow */}
                  <svg className="w-8 h-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>

                  {/* User's port (highlighted) */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
border-4 border-yellow-300 outline outline-2 outline-yellow-500 shadow-lg"
                      style={{ backgroundColor: PORT_COLORS[port?.substring(0, 3)?.toUpperCase()] || "#64748B" }}
                    >
                      {port?.substring(0, 1)?.toUpperCase()}
                    </div>
                    <span className="text-sm font-bold mt-1 block text-blue-900">{port}</span>
                    <span className="text-xs font-medium text-blue-800">(Your Port)</span>
                  </div>

                  {/* Second arrow */}
                  <svg className="w-8 h-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>

                  {/* Port that user sends TO (receivesFrom in variable naming) */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: PORT_COLORS[swapInfo.receivesFrom?.substring(0, 3)?.toUpperCase()] || "#64748B" }}>
                      {swapInfo.receivesFrom?.substring(0, 1)?.toUpperCase() || "-"}
                    </div>
                    <span className="text-xs font-medium mt-1 block">{swapInfo.receivesFrom || "Unknown"}</span>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-blue-200">
                  <p className="text-sm text-center text-blue-800 font-medium">
                    After swapping, containers from <span className="font-bold">{swapInfo.sendsTo}</span> will arrive at your port, and you will send containers to <span className="font-bold">{swapInfo.receivesFrom}</span>.
                  </p>
                </div>
              </div>

              <p className="text-red-600 font-bold text-center">Please wait while containers are being swapped!</p>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" theme="light" autoClose={3000} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="container mx-auto px-6 space-y-6">
          <HeaderCards port={port} revenue={revenue} penalties={penalties} rank={rank} section={section} formatIDR={formatIDR} moves={moveStats} currentRound={currentRound} totalRounds={totalRounds} />

          <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
            <TabList className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                  ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Capacity & Uptake
                </div>
              </Tab>

              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                  ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Stowage
                </div>
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5
    ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Weekly Performance
                </div>
              </Tab>

              {/* <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                  ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Market Intelligence
                </div>
              </Tab> */}
            </TabList>

            <TabPanels className="mt-4">
              {/* Capacity & Uptake Tab */}
              <TabPanel>
                <CapacityUptake
                  port={port}
                  capacityData={{
                    ...capacityData,
                    week: currentRound,
                    totalRounds: totalRounds,
                    roomId: roomId, // Add this line
                  }}
                  isLoading={isCapacityLoading}
                  refreshData={fetchCapacityData}
                  salesCallsData={{
                    weekSalesCalls,
                    weekRevenueTotal,
                  }}
                />
              </TabPanel>

              <TabPanel>
                <Stowage
                  bayCount={bayCount}
                  baySize={baySize}
                  bayTypes={bayTypes}
                  droppedItems={droppedItems}
                  draggingItem={draggingItem}
                  dockSize={dockSize}
                  paginatedItems={paginatedItems}
                  isLimitExceeded={isLimitExceeded}
                  salesCallCards={isLimitExceeded ? [] : salesCallCards}
                  currentCardIndex={currentCardIndex}
                  containers={containers}
                  formatIDR={formatIDR}
                  handleAcceptCard={handleAcceptCard}
                  handleRejectCard={handleRejectCard}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                  section={section}
                  onNextSection={handleNextSection}
                  targetContainers={targetContainers}
                  isProcessingCard={isProcessingCard}
                  isCardVisible={isCardVisible}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                />
              </TabPanel>

              {/* Weekly Performance Tab */}
              <TabPanel>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  {/* <WeeklyPerformance port={port} currentRound={currentRound} totalRounds={totalRounds} /> */}
                </div>
              </TabPanel>

              {/* Market Intelligence Tab */}
              {/* <TabPanel>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Market Intelligence</h3>
                  <MarketIntelligence port={port} />
                </div>
              </TabPanel> */}
            </TabPanels>
          </TabGroup>
        </div>
      )}
    </div>
  );
};

export default Simulation;
