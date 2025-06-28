import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect, useContext } from "react";
import { api, socket } from "../axios/axios";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import HeaderCards from "../components/simulations/stowages/HeaderCards";
import LoadingSpinner from "../components/simulations/LoadingSpinner";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import WeeklyPerformance from "../components/simulations/weekly_performance/WeeklyPerformance";
import MarketIntelligenceSimulation from "../components/simulations/market_intelligence/MarketIntelligenceSimulation";
import Stowage from "../components/simulations/stowages/Stowage";
import CapacityUptake from "../components/simulations/capacity_uptake/CapacityUptake";
import useToast from "../toast/useToast";
import { PORT_COLORS, getPortColor } from "../assets/Colors";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
};

const Simulation = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { roomId } = useParams();
  const { user, token } = useContext(AppContext);
  const [port, setPort] = useState("");
  const [deckId, setDeckId] = useState("");
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(1);

  // Market Intelligence states
  const [moveCost, setMoveCost] = useState(0);
  const [dockWarehouseCost, setDockWarehouseCost] = useState(0);
  const [restowageCost, setRestowageCost] = useState(0);

  // Stowage states
  const [droppedItems, setDroppedItems] = useState([]);
  const [baySize, setBaySize] = useState({ rows: 1, columns: 1 });
  const [bayCount, setBayCount] = useState(1);
  const [bayTypes, setBayTypes] = useState([]);
  const [bayData, setBayData] = useState([]);
  const [dockData, setDockData] = useState([]);
  const [dockSize, setDockSize] = useState({ rows: 5, columns: 10 });
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
  const [dockWarehouseContainers, setDockWarehouseContainers] = useState([]);
  const [isBayFull, setIsBayFull] = useState(false);

  const [targetContainers, setTargetContainers] = useState([]);
  const [containerDestinationsCache, setContainerDestinationsCache] = useState({});

  const [unfulfilledContainers, setUnfulfilledContainers] = useState({});

  const [penalties, setPenalties] = useState(0);
  const [moveStats, setMoveStats] = useState({
    loadMoves: 0,
    dischargeMoves: 0,
    acceptedCards: 0,
    rejectedCards: 0,
  });
  const [swapInfo, setSwapInfo] = useState({
    receivesFrom: "",
    sendsTo: "",
    allPorts: [],
  });

  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(1);
  const [processedCards, setProcessedCards] = useState(0);
  const [mustProcessCards, setMustProcessCards] = useState(0);
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [cardsLimit, setCardsLimit] = useState(0);

  const [bayMoves, setBayMoves] = useState({});
  // const [bayPairs, setBayPairs] = useState([]);
  // const [idealCraneSplit, setIdealCraneSplit] = useState(2);
  // const [longCraneMoves, setLongCraneMoves] = useState(0);

  // const [extraMovesOnLongCrane, setExtraMovesOnLongCrane] = useState(0);

  const [restowageContainers, setRestowageContainers] = useState([]);
  const [restowagePenalty, setRestowagePenalty] = useState(0);
  const [restowageMoves, setRestowageMoves] = useState(0);

  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const [showFinancialModal, setShowFinancialModal] = useState(false);

  const { data: cardTemporariesData, isLoading: isLoadingCardTemporaries } = useQuery({
    queryKey: ["cardTemporaries", roomId, deckId],
    queryFn: async () => {
      if (!roomId || !deckId || !token) {
        return { cards: [] };
      }

      const response = await api.get(`card-temporary/all-cards/${roomId}/${deckId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!roomId && !!deckId && !!token,
  });

  const allCardTemporaries = cardTemporariesData?.cards || [];

  // Tambahkan function handler untuk hover container
  const handleContainerHover = (containerId, isHovering) => {
    // Don't show preview if currently dragging anything
    if (draggingItem !== null) {
      return;
    }

    if (isHovering) {
      // Find the container object
      const container = containers.find((c) => c.id.toString() === containerId.toString());
      if (container && container.card_id) {
        // Find the associated card
        const card = allCardTemporaries.find((c) => c.card_id === container.card_id);
        setHoveredCardId(container.card_id);
        setHoveredCard(card);
      }
    } else {
      setHoveredCardId(null);
      setHoveredCard(null);
    }
  };

  // Add a function to toggle the financial modal visibility
  const toggleFinancialModal = () => {
    setSelectedTab(2);
    // Toggle modal visibility
    setShowFinancialModal(!showFinancialModal);
  };

  const [weekSalesCalls, setWeekSalesCalls] = useState([]);
  const [weekRevenueTotal, setWeekRevenueTotal] = useState(0);

  useEffect(() => {
    fetchSalesCallCards();
  }, [roomId, token]);

  useEffect(() => {
    if (roomId && token && user) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          await fetchArenaData();
        } catch (error) {
          console.error("Error loading simulation data:", error);
          showError("Failed to load simulation data");
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }
  }, [roomId, user, token]);

  async function fetchSalesCallCards() {
    if (!user || !token) {
      console.log("User not authenticated");
      return;
    }

    setIsLoading(true);
    try {
      // Get temporary cards with all needed configuration data in a single API call
      const cardTemporaryResponse = await api.get(`/card-temporary/${roomId}/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Extract configuration data from response
      const responseData = cardTemporaryResponse.data;

      // Set state variables from the enriched response
      setDeckId(responseData.deck_id);
      setMoveCost(responseData.move_cost);
      setMustProcessCards(responseData.cards_must_process_per_round);
      setCardsLimit(responseData.cards_limit_per_round);
      setPort(responseData.port);
      setIsLimitExceeded(responseData.is_limit_exceeded);
      setCurrentRound(responseData.current_round);
      setTotalRounds(responseData.total_rounds);
      // setContainers(responseData.containers);

      // Process card temporaries
      const cardTemporaries = responseData.cards;

      if (responseData.is_limit_exceeded) {
        console.log("Card limit exceeded, not fetching new cards");
        setSalesCallCards([]);
        setIsLimitExceeded(true);
        setIsLoading(false);
        return;
      }

      const availableCards = cardTemporaries.map((cardTemp) => {
        return {
          ...cardTemp.card,
          is_backlog: cardTemp.is_backlog,
          original_round: cardTemp.original_round,
          round: cardTemp.round,
          status: cardTemp.status,
          card_temporary_id: cardTemp.id,
        };
      });

      const sortedByCardId = [...availableCards].sort((a, b) => {
        return parseInt(a.id) - parseInt(b.id);
      });

      console.log(`${availableCards.length} available cards for this round`);

      if (availableCards.length > 0) {
        setSalesCallCards(sortedByCardId);
        setCurrentCardIndex(0);
        console.log("Updated Sales Call Cards:", availableCards);
      } else {
        // If no cards are available, set limit exceeded
        setIsLimitExceeded(true);
        setSalesCallCards([]);
      }
    } catch (error) {
      console.error("Error fetching sales call cards:", error);
      showError("Failed to load sales call cards");
    } finally {
      setIsLoading(false);
    }
  }

  const handleRefreshCards = () => {
    if (salesCallCards.length === 0 || currentCardIndex >= salesCallCards.length) {
      // Check if limit is exceeded
      if (isLimitExceeded) {
        showWarning("You have reached the maximum card limit for this round!");
        return;
      }

      fetchSalesCallCards();
      showInfo("Fetching available cards for this round...");
    } else {
      showInfo("Cards are still available. Refresh is only possible when no cards are available.");
    }
  };

  useEffect(() => {
    socket.on("swap_bays", async ({ roomId: receivedRoomId }) => {
      if (receivedRoomId === roomId) {
        try {
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

          await fetchArenaData();
        } catch (error) {
          console.error("Error handling swap_bays event:", error);
        }
      }
    });

    socket.on("port_config_updated", ({ roomId: updatedRoomId }) => {
      if (updatedRoomId === roomId) {
        fetchArenaData();
      }
    });

    socket.on("end_simulation", ({ roomId: endedRoomId }) => {
      if (endedRoomId === roomId) {
        navigate("/user-home");
      }
    });

    socket.on("stats_requested", async ({ roomId: requestedRoomId, userId: requestedUserId }) => {
      if (roomId === requestedRoomId && user.id === requestedUserId) {
        // const response = await fetchArenaData();

        socket.emit("stats_updated", {
          roomId,
          userId: user.id,
        });
      }
    });

    // Update socket handler with null check
    socket.on("stats_updated", ({ roomId: updatedRoomId, userId: updatedUserId, stats }) => {
      if (roomId === updatedRoomId && user.id === updatedUserId && stats) {
        // setMoveStats({
        //   loadMoves: stats.load_moves || 0,
        //   dischargeMoves: stats.discharge_moves || 0,
        //   acceptedCards: stats.accepted_cards || 0,
        //   rejectedCards: stats.rejected_cards || 0,
        // });
        // setPenalties(stats.penalty || 0);
      }
    });

    return () => {
      socket.off("swap_bays");
      socket.off("port_config_updated");
      socket.off("end_simulation");
      socket.off("stats_requested");
      socket.off("stats_updated");
      socket.off("port_config_updated");
    };
  }, [roomId, user, token]);

  const handleSwapProcess = async () => {
    setIsSwapping(true);
    try {
      await Promise.all([
        fetchArenaData(),
        fetchSalesCallCards(), //
      ]);

      // Reset states
      setSection(1);
      setIsLimitExceeded(false);
      setSalesCallCards([]);
      setCurrentCardIndex(0);
      setWeekSalesCalls([]);
      setWeekRevenueTotal(0);
      setProcessedCards(0);

      // Refetch sales cards after a short delay
      setTimeout(() => {
        fetchSalesCallCards();
      }, 500);
    } catch (error) {
      console.error("Error updating after swap:", error);
      showError("Failed to update bay data");
    } finally {
      setIsSwapping(false);
    }
  };

  const getContainerColorByDestination = (destination) => {
    return getPortColor(destination);
  };

  async function fetchArenaData() {
    if (!user || !user.id) {
      console.log("User not available yet");
      return;
    }

    setIsLoading(true);
    try {
      const containerResponse = await api.get(`rooms/${roomId}/containers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let containerData = containerResponse.data;

      if (!Array.isArray(containerData)) {
        console.error("Container data is not an array:", containerData);
        containerData = [];
      } else {
        console.log(`Loaded ${containerData.length} containers successfully`);
      }

      setContainers(containerData);

      // Single API call to get all arena data
      const response = await api.get(`/rooms/${roomId}/ship-bays/arena-data/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      // Process room data
      const roomData = data.room;
      setDeckId(roomData.deck_id);
      setMoveCost(roomData.move_cost);
      setDockWarehouseCost(roomData.dock_warehouse_cost);
      setRestowageCost(roomData.restowage_cost);
      setMustProcessCards(roomData.cards_must_process_per_round);
      setCardsLimit(roomData.cards_limit_per_round);
      setTotalRounds(roomData.total_rounds);

      // Process swap configuration
      if (roomData.swap_config) {
        let swapConfig = {};
        swapConfig = roomData.swap_config;

        if (swapConfig) {
          try {
            swapConfig = typeof swapConfig === "string" ? JSON.parse(swapConfig) : swapConfig;
          } catch (e) {
            console.error("Error parsing swap config");
          }
        }

        // Process swap configuration exactly as fetchSwapConfig would
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
      }

      console.log("Total Rounds:", roomData.total_rounds);

      // Process ship bay data
      const shipBayData = data.ship_bay;
      setCurrentRound(shipBayData.current_round);
      setProcessedCards(shipBayData.processed_cards);
      setMoveStats({
        loadMoves: shipBayData.load_moves || 0,
        dischargeMoves: shipBayData.discharge_moves || 0,
        acceptedCards: shipBayData.accepted_cards || 0,
        rejectedCards: shipBayData.rejected_cards || 0,
      });
      setPenalties(shipBayData.penalty || 0);

      if (data.bay_statistics) {
        setBayMoves(data.bay_statistics.bay_moves || {});
        setDockWarehouseContainers(data.bay_statistics.dock_warehouse_containers || []);
      }

      // Process config data
      const configData = data.config;
      const { baySize, bayCount, bayTypes } = configData;
      setBaySize(baySize);
      setBayCount(bayCount);
      setBayTypes(bayTypes);

      // Initialize bay data
      const initialBayData = Array.from({ length: bayCount }).map(() => Array.from({ length: baySize.rows }).map(() => Array(baySize.columns).fill(null)));

      // Process arena data for ship bay
      const savedArena = typeof shipBayData.arena === "string" ? JSON.parse(shipBayData.arena) : shipBayData.arena;

      const newDroppedItems = [];

      if (savedArena && savedArena.containers) {
        // Process containers from flat format
        console.log("Processing flat format containers");

        savedArena.containers.forEach((container) => {
          // Use the container's existing bay, row, col properties directly if available
          const bayIndex = container.bay;
          const rowIndex = container.row;
          const colIndex = container.col;

          // Create a unique cell identifier
          const cellId = `bay-${bayIndex}-${rowIndex * baySize.columns + colIndex}`;

          // Update the bayData structure
          if (initialBayData[bayIndex] && initialBayData[bayIndex][rowIndex]) {
            initialBayData[bayIndex][rowIndex][colIndex] = container.id;
          }

          // Find container in existing containers array
          const containerObj = containerData.find((c) => c.id === container.id);
          newDroppedItems.push({
            id: container.id,
            area: cellId,
            _position: {
              bay: bayIndex,
              row: rowIndex,
              col: colIndex,
              originalPos: container.position,
            },
            color: containerObj?.color || getContainerColorByDestination(containerObj?.destination),
          });
        });

        setBayData(initialBayData);
        setDroppedItems((prevItems) => [...newDroppedItems, ...prevItems.filter((item) => !item.area.startsWith("bay-"))]);
      }
      // Check if savedArena is a 2D array
      else if (shipBayData.arena) {
        savedArena.forEach((bay, bayIndex) => {
          bay.forEach((row, rowIndex) => {
            row.forEach((item, colIndex) => {
              if (item) {
                const containerObj = containerData.find((c) => c.id === item);
                if (containerObj) {
                  newDroppedItems.push({
                    id: item,
                    area: `bay-${bayIndex}-${rowIndex * bay[0].length + colIndex}`,
                    color: containerObj?.color || getContainerColorByDestination(containerObj?.destination),
                  });
                }
              }
            });
          });
        });

        // Make sure to set the dropped items here too
        setBayData(initialBayData);
        setDroppedItems((prevItems) => [...newDroppedItems, ...prevItems.filter((item) => !item.area.startsWith("bay-"))]);
      }

      // Set revenue, port, and section
      setRevenue(shipBayData.revenue || 0);
      setPort(shipBayData.port);
      setSection(shipBayData.section === "section1" ? 1 : 2);

      // Process dock items
      const dockArena = data.ship_dock?.arena ? (typeof data.ship_dock.arena === "string" ? JSON.parse(data.ship_dock.arena) : data.ship_dock.arena) : null;

      let dockItems = [];

      console.log("Dock arena:", dockArena);
      if (dockArena) {
        // Check if we have the new format with containers property
        if (dockArena.containers) {
          // New format - already flat with positions
          dockItems = dockArena.containers
            .map((container) => {
              const containerInfo = containerData.find((c) => c.id === container.id);
              if (containerInfo) {
                return {
                  id: container.id,
                  area: `docks-${container.position}`,
                  color: containerInfo.color,
                  is_restowed: container.is_restowed,
                };
              }
              return null;
            })
            .filter(Boolean);
        } else if (Array.isArray(dockArena)) {
          // Old format - 2D array that needs flattening
          dockItems = dockArena
            .flat()
            .map((item, index) => {
              if (item) {
                const container = containerData.find((c) => c.id === item);
                if (container) {
                  return {
                    id: item,
                    area: `docks-${index}`,
                    color: container.color,
                    is_restowed: container.is_restowed,
                  };
                }
              }
              return null;
            })
            .filter(Boolean);
        } else {
          console.warn("Unrecognized dock arena format:", dockArena);
        }
      }

      setDroppedItems([...dockItems, ...newDroppedItems]);

      // Process unfulfilled containers data
      setUnfulfilledContainers(data.unfulfilled_containers || {});
      console.log("Unfulfilled containers arena data:", data.unfulfilled_containers);

      // Process restowage data
      const restowageData = data.restowage;
      setRestowageContainers(restowageData.restowage_containers || []);
      setRestowagePenalty(restowageData.restowage_penalty || 0);
      setRestowageMoves(restowageData.restowage_moves || 0);

      // Process bay capacity data
      setIsBayFull(data.bay_capacity.is_full);

      // Process target containers data
      setContainerDestinationsCache(data.container_destinations);

      // Get section from ship bay data
      const currentSection = shipBayData.section;
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
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (currentCardIndex >= salesCallCards.length) {
      setCurrentCardIndex(0);
    }

    if (salesCallCards.length === 0) {
      setIsLimitExceeded(true);
      setCurrentCardIndex(0);
    }
  }, [salesCallCards, currentCardIndex]);

  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(true);

  async function handleAcceptCard(cardId) {
    if (section !== 2) {
      showError("Please complete section 1 first!");
      return;
    }

    if (isLimitExceeded) {
      showError("Card limit reached for this round!");
      return;
    }

    if (isProcessingCard) {
      return;
    }

    setIsLoading(true);
    try {
      setIsProcessingCard(true);
      setIsCardVisible(false);

      const currentCard = salesCallCards[currentCardIndex];
      if (!currentCard) {
        console.log("No more cards to process");
        setIsProcessingCard(false);
        setIsCardVisible(true);
        setIsLoading(false);
        return;
      }

      if (processedCards + 1 >= mustProcessCards) {
        setIsLimitExceeded(true);
      }

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

      const dockItems = updatedDroppedItems
        .filter((item) => item.area && item.area.startsWith("docks-"))
        .map((item) => ({
          id: item.id,
          position: parseInt(item.area.split("-")[1]),
        }));

      const dockArenaData = {
        containers: dockItems,
        totalContainers: dockItems.length,
      };

      const cardResponse = await api.post(
        `/rooms/${roomId}/ship-bays/${user.id}/cards`,
        {
          card_action: "accept",
          count: 1,
          card_temporary_id: cardId,
          card: salesCallCards[currentCardIndex],
          port: port,
          dock_arena: dockArenaData,
          dock_size: dockSize,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProcessedCards(cardResponse.data.processed_cards);
      setUnfulfilledContainers(cardResponse.data.unfulfilled_containers);
      setSalesCallCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
      setDroppedItems(updatedDroppedItems);
      setDockData(dockArenaData);

      setTimeout(() => {
        setCurrentCardIndex((prevIndex) => (prevIndex < salesCallCards.length - 1 ? prevIndex : 0));
        setIsCardVisible(true);
      }, 2000);

      showSuccess(`Card accepted! Move all containers to ship bay to earn revenue.`);

      socket.emit("stats_requested", {
        roomId,
        userId: user.id,
      });
    } catch (error) {
      console.error("Error accepting card:", error);
      showError("Failed to process card");
    } finally {
      await fetchArenaData();
      setIsProcessingCard(false);
      setSelectedTab(0);
      showInfo("Redirecting to Capacity Uptake to check available capacity");
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (section === 2) {
      fetchSalesCallCards();
    }
  }, [section, moveStats.acceptedCards, moveStats.rejectedCards]);

  async function handleRejectCard(cardId) {
    setIsLoading(true);
    try {
      if (section !== 2) {
        showError("Please complete section 1 first!");
        setIsLoading(false);
        return;
      }

      if (isLimitExceeded) {
        showError("Card limit reached for this round!");
        setIsLoading(false);
        return;
      }

      if (isProcessingCard) {
        setIsLoading(false);
        return;
      }

      if (!salesCallCards[currentCardIndex]) {
        console.log("No more cards to process");
        setIsLoading(false);
        return;
      }

      setIsProcessingCard(true);
      setIsCardVisible(false);

      const response = await api.post(
        `/rooms/${roomId}/ship-bays/${user.id}/cards`,
        {
          card_action: "reject",
          count: 1,
          card_temporary_id: cardId,
          card: salesCallCards[currentCardIndex],
          port: port,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLimitExceeded(response.data.is_limit_exceeded);

      setSalesCallCards((prevCards) => {
        const updatedCards = prevCards.filter((card) => card.id !== cardId);
        if (updatedCards.length === 0) {
          setIsLimitExceeded(true);
        }
        return updatedCards;
      });

      setCurrentCardIndex((prevIndex) => {
        const nextIndex = prevIndex < salesCallCards.length - 1 ? prevIndex : 0;
        return nextIndex;
      });

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
      setSelectedTab(0);
      showInfo("Redirecting to Capacity Uptake to check available capacity");
      setIsLoading(false);
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

      // If in section 1, check if this is a target container that needs discharging
      if (section === 1) {
        const isTargetContainer = targetContainers.some((target) => target.id === sourceItem.id);

        if (isTargetContainer) {
          showInfo("Drag this container to the ship dock to discharge it");
        }
      }
    }

    setDraggingItem(event.active.id);
    setHoveredCardId(null);
    setHoveredCard(null);
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
    setIsLoading(true);
    const { active, over } = event;
    setDraggingItem(null);

    if (!over) {
      setIsLoading(false);
      return;
    }

    const container = containers.find((c) => c.id === active.id);
    if (!container) {
      setIsLoading(false);
      return;
    }

    const activeItem = droppedItems.find((item) => item.id === active.id);
    if (activeItem && activeItem.area === over.id) {
      setIsLoading(false);
      return;
    }

    // Extract bay indexes for tracking
    let sourceBayIndex = null;
    let destinationBayIndex = null;

    // Parse source bay index if it's a bay area
    if (activeItem?.area?.startsWith("bay-")) {
      sourceBayIndex = parseInt(activeItem.area.split("-")[1]);
    }

    // Parse destination bay index if it's a bay area
    if (over.id.startsWith("bay-")) {
      destinationBayIndex = parseInt(over.id.split("-")[1]);
    }

    if (section === 1) {
      // Check if this is a move from bay to dock
      const isFromBay = activeItem?.area?.startsWith("bay-");
      const isToDock = over.id.startsWith("docks-");

      if (isFromBay && isToDock) {
        // Check if container destination matches current port
        try {
          const containerResponse = await api.get(`/rooms/${roomId}/containers/${active.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (containerResponse.data.card && containerResponse.data.card.destination === port) {
            // This container should be dischargeed at current port

            // Remove from dropped items (visual effect of container being removed)
            const updatedDroppedItems = droppedItems.filter((item) => item.id !== active.id);
            setDroppedItems(updatedDroppedItems);

            const newBayData = [];
            for (let bayIdx = 0; bayIdx < bayCount; bayIdx++) {
              for (let rowIdx = 0; rowIdx < baySize.rows; rowIdx++) {
                for (let colIdx = 0; colIdx < baySize.columns; colIdx++) {
                  const cellId = `bay-${bayIdx}-${rowIdx * baySize.columns + colIdx}`;
                  const containerItem = updatedDroppedItems.find((item) => item.area === cellId);
                  if (containerItem) {
                    newBayData.push({
                      bay: bayIdx,
                      row: rowIdx,
                      col: colIdx,
                      id: containerItem.id,
                      cardId: containerItem.cardId,
                      type: containerItem.type,
                      origin: containerItem.card?.origin,
                      destination: containerItem.card?.destination,
                    });
                  }
                }
              }
            }
            const flatBayData = {
              containers: newBayData.map((item) => ({
                id: item.id,
                position: item.bay * baySize.rows * baySize.columns + item.row * baySize.columns + item.col,
                bay: item.bay,
                row: item.row,
                col: item.col,
                type: item.type,
                cardId: item.cardId,
                origin: item.origin,
                destination: item.destination,
              })),
              totalContainers: newBayData.length,
            };
            setBayData(flatBayData);

            showSuccess("Container dischargeed successfully!");

            try {
              // Save updated bay state
              const bayResponse = await api.post(
                `/rooms/${roomId}/ship-bays`,
                {
                  arena: flatBayData,
                  user_id: user.id,
                  room_id: roomId,
                  section: "section1",
                  moved_container: {
                    id: container.id,
                    from: activeItem.area,
                    to: over.id,
                  },
                  move_type: "discharge",
                  count: 1,
                  bay_index: sourceBayIndex,
                  container_id: active.id,
                  isLog: true,
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

              socket.emit("rankings_updated", {
                roomId,
                rankings: bayResponse.data.rankings,
              });

              await fetchArenaData();
              return;
            } catch (error) {
              console.error("API call failed", error);
              showError("Failed to update container status");
            } finally {
              setIsLoading(false);
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
        showError(container.type?.toLowerCase() === "reefer" ? "Reefer containers can only be placed in reefer bays" : "Invalid container placement");
        setIsLoading(false);
        return;
      }
    }

    if (activeItem && isDirectUpperMove(activeItem.area, over.id, baySize)) {
      showError("Invalid placement - container cannot float");
      setIsLoading(false);
      return;
    }

    const isSourceBlocked = isBlockedByContainerAbove(droppedItems, activeItem.area);
    if (isSourceBlocked) {
      showError("Cannot move container - blocked by container above");
      setIsLoading(false);
      return;
    }

    const isAboveClear = checkAbove(droppedItems, baySize, over.id);
    const isSpaceValid = checkSpace(droppedItems, baySize, over.id);

    if (!isAboveClear) {
      showError("Cannot place container - blocked by container above");
      setIsLoading(false);
      return;
    }

    if (!isSpaceValid) {
      showError("Cannot place container - insufficient space");
      setIsLoading(false);
      return;
    }

    const updatedDroppedItems = droppedItems.map((item) => (item.id === active.id ? { ...item, area: over.id } : item));
    setDroppedItems(updatedDroppedItems);

    showSuccess("Container placed successfully!");

    const newBayData = [];
    for (let bayIdx = 0; bayIdx < bayCount; bayIdx++) {
      for (let rowIdx = 0; rowIdx < baySize.rows; rowIdx++) {
        for (let colIdx = 0; colIdx < baySize.columns; colIdx++) {
          const cellId = `bay-${bayIdx}-${rowIdx * baySize.columns + colIdx}`;
          const containerItem = updatedDroppedItems.find((item) => item.area === cellId);
          if (containerItem) {
            const containerObj = containers.find((c) => c.id === containerItem.id);
            if (containerObj) {
              newBayData.push({
                bay: bayIdx,
                row: rowIdx,
                col: colIdx,
                id: containerItem.id,
                cardId: containerObj.card_id,
                type: containerObj.type || "dry",
                origin: containerObj.origin,
                destination: containerObj.destination,
              });
            }
          }
        }
      }
    }

    const flatBayData = {
      containers: newBayData.map((item) => ({
        id: item.id,
        position: item.bay * baySize.rows * baySize.columns + item.row * baySize.columns + item.col,
        bay: item.bay,
        row: item.row,
        col: item.col,
        type: item.type,
        cardId: item.cardId,
        origin: item.origin,
        destination: item.destination,
      })),
      totalContainers: newBayData.length,
    };
    setBayData(flatBayData);

    const dockItems = updatedDroppedItems
      .filter((item) => item.area && item.area.startsWith("docks-"))
      .map((item) => ({
        id: item.id,
        position: parseInt(item.area.split("-")[1]),
      }));

    const dockArenaData = {
      containers: dockItems,
      totalContainers: dockItems.length,
    };

    console.log("User:", user);
    console.log("Room ID:", roomId);

    try {
      // Determine move type
      const fromArea = activeItem.area;
      const toArea = over.id;
      const moveType = fromArea.startsWith("bay") ? "discharge" : "load";
      const containerId = active.id;

      // Determine which bay index to use for tracking
      let relevantBayIndex = moveType === "discharge" ? sourceBayIndex : destinationBayIndex;

      // For moves between bays, use destination bay index
      if (fromArea.startsWith("bay") && toArea.startsWith("bay")) {
        relevantBayIndex = destinationBayIndex;
      }

      // Only track moves if they involve a bay (not just within dock)
      const isBayInvolved = fromArea.startsWith("bay") || toArea.startsWith("bay");

      try {
        const resBay = await api.post(
          `/rooms/${roomId}/ship-bays`,
          {
            arena: flatBayData,
            user_id: user.id,
            room_id: roomId,
            moved_container: {
              id: container.id,
              from: fromArea,
              to: toArea,
            },
            section: section === 1 ? "section1" : "section2",
            ...(isBayInvolved && relevantBayIndex !== null
              ? {
                  move_type: moveType,
                  count: 1,
                  bay_index: relevantBayIndex,
                  container_id: containerId,
                }
              : {}),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const resDock = await api.post(
          `/rooms/${roomId}/ship-docks`,
          {
            arena: dockArenaData, // Send new format
            user_id: user.id,
            room_id: roomId,
            dock_size: dockSize,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const fromDock = fromArea.startsWith("docks-");
        const toDock = toArea.startsWith("docks-");

        if (!(fromDock && toDock)) {
          // If not a dock-to-dock move, request stats update
          socket.emit("stats_requested", {
            roomId,
            userId: user.id,
          });
        }

        socket.emit("rankings_updated", { roomId, rankings: resBay.data.rankings });
      } catch (error) {
        console.error("Error during container movement:", error);
        showError("Failed to move container. Please try again.");
      } finally {
        await fetchArenaData();
        setIsLoading(false);
      }
    } catch (error) {
      console.error("API call failed", error);
    }
  }

  useEffect(() => {
    if (!droppedItems.length || !port || Object.keys(containerDestinationsCache).length === 0) {
      return;
    }

    // Filter containers whose destination matches the current port
    const containersToDischarge = droppedItems.filter((item) => {
      const destination = containerDestinationsCache[item.id];

      // Debug individual container check
      // console.log(`Container ${item.id} destination: ${destination}, match with ${port}: ${destination === port}`);

      // Case-insensitive comparison to be safe
      return destination && destination.trim().toUpperCase() === port.trim().toUpperCase();
    });

    console.log("Containers to discharge at this port:", containersToDischarge);

    // Update the target containers state
    setTargetContainers(containersToDischarge);
  }, [droppedItems, containerDestinationsCache, port, section]);

  const canProceedToSectionTwo = () => {
    return targetContainers.length === 0;
  };

  // Update handleNextSection to use the simplified check
  const handleNextSection = async () => {
    if (!canProceedToSectionTwo()) {
      showError("Please discharge all containers destined for your port first!");
      return;
    }

    try {
      await api.put(
        `/rooms/${roomId}/ship-bays/${user.id}/section`,
        {
          section: "section2",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSection(2);
    } catch (error) {
      console.error("Error updating section:", error);
      showError("Failed to update section");
    }
  };

  return (
    <div className="min-h-screen max-w-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      {showSwapAlert && swapInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-xl p-12 shadow-1xl max-w-lg w-full mx-2">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-3xl font-bold text-red-600 animate-pulse mb-1">SWAP ALERT!</div>
              <div className="text-3xl font-bold text-blue-600">{countdown}</div>

              {/* Port linked list visualization - now enhanced with full route */}
              <div className="w-full bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-sm text-center mb-3 text-blue-800">Container Flow Update</h3>

                {/* Complete port route visualization */}
                {swapInfo.allPorts && swapInfo.allPorts.length > 0 && (
                  <div className="mb-2 overflow-x-auto py-1">
                    <div className="flex items-center justify-center gap-1 min-w-max">
                      {swapInfo.allPorts
                        .slice()
                        .reverse()
                        .map((portName, index) => (
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
              </div>

              <p className="text-red-600 font-bold text-center text-sm">Please wait while containers are being swapped!</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-2 space-y-2">
        <HeaderCards
          roomId={roomId}
          port={port}
          revenue={revenue}
          penalties={penalties}
          section={section}
          formatIDR={formatIDR}
          moves={moveStats}
          currentRound={currentRound}
          totalRounds={totalRounds}
          moveCost={moveCost}
          dockWarehouseCost={dockWarehouseCost}
          restowageCost={restowageCost}
        />

        <TabGroup selectedIndex={selectedTab} onChange={setSelectedTab}>
          <div className="sticky top-24 z-10 bg-gradient-to-br from-blue-50 to-blue-100 pt-2 pb-2">
            <TabList className="flex w-full h-6 items-center rounded-md bg-gray-200 p-0.5 shadow-inner">
              <Tab
                className={({ selected }) =>
                  `w-full flex items-center justify-center h-5 px-2 text-[11px] font-medium rounded-md transition-all duration-150 ${
                    selected ? "bg-white text-blue-600 shadow-sm transform scale-105" : "text-gray-600 hover:text-blue-500 hover:bg-white/40"
                  }`
                }
              >
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span>Capacity & Uptake Management</span>
              </Tab>

              <Tab
                className={({ selected }) =>
                  `w-full flex items-center justify-center h-5 px-2 text-[11px] font-medium rounded-md transition-all duration-150 ${
                    selected ? "bg-white text-blue-600 shadow-sm transform scale-105" : "text-gray-600 hover:text-blue-500 hover:bg-white/40"
                  }`
                }
              >
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Stowage</span>
              </Tab>

              <Tab
                className={({ selected }) =>
                  `w-full flex items-center justify-center h-5 px-2 text-[11px] font-medium rounded-md transition-all duration-150 ${
                    selected ? "bg-white text-blue-600 shadow-sm transform scale-105" : "text-gray-600 hover:text-blue-500 hover:bg-white/40"
                  }`
                }
              >
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Weekly Performance</span>
              </Tab>

              <Tab
                className={({ selected }) =>
                  `w-full flex items-center justify-center h-5 px-2 text-[11px] font-medium rounded-md transition-all duration-150 ${
                    selected ? "bg-white text-blue-600 shadow-sm transform scale-105" : "text-gray-600 hover:text-blue-500 hover:bg-white/40"
                  }`
                }
              >
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Market Intelligence</span>
              </Tab>
            </TabList>
          </div>

          <TabPanels className="mt-4">
            {/* Capacity Uptake */}
            <TabPanel>
              <CapacityUptake
                currentRound={currentRound}
                totalRounds={totalRounds}
                containers={containers}
                unfulfilledContainers={unfulfilledContainers} //
              />
            </TabPanel>

            <TabPanel>
              <Stowage
                revenue={revenue}
                bayCount={bayCount}
                baySize={baySize}
                bayTypes={bayTypes}
                droppedItems={droppedItems}
                draggingItem={draggingItem}
                dockSize={dockSize}
                isLimitExceeded={isLimitExceeded}
                salesCallCards={salesCallCards}
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
                processedCards={processedCards}
                mustProcessCards={mustProcessCards}
                cardsLimit={cardsLimit}
                port={port}
                bayMoves={bayMoves}
                totalMoves={moveStats.loadMoves + moveStats.dischargeMoves}
                onRefreshCards={handleRefreshCards}
                dockWarehouseContainers={dockWarehouseContainers}
                restowageContainers={restowageContainers}
                restowagePenalty={restowagePenalty}
                restowageMoves={restowageMoves}
                containerDestinationsCache={containerDestinationsCache}
                unfulfilledContainers={unfulfilledContainers}
                hoveredCardId={hoveredCardId}
                hoveredCard={hoveredCard}
                onContainerHover={handleContainerHover}
                toggleFinancialModal={toggleFinancialModal}
                isBayFull={isBayFull}
                // bayPairs={bayPairs}
                // idealCraneSplit={idealCraneSplit}
                // longCraneMoves={longCraneMoves}
                // extraMovesOnLongCrane={extraMovesOnLongCrane}
              />
            </TabPanel>

            {/* Weekly Performance Tab */}
            <TabPanel>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <WeeklyPerformance
                  port={port}
                  currentRound={currentRound}
                  totalRounds={totalRounds}
                  totalMoves={moveStats.loadMoves + moveStats.dischargeMoves}
                  bayMoves={bayMoves}
                  showFinancialModal={showFinancialModal}
                  toggleFinancialModal={toggleFinancialModal}
                  // bayPairs={bayPairs}
                  // extraMovesOnLongCrane={extraMovesOnLongCrane}
                  // longCraneMoves={longCraneMoves}
                  // extraMovesCost={extraMovesCost}
                  // idealCraneSplit={idealCraneSplit}
                />
              </div>
            </TabPanel>

            {/* Market Intelligence Tab */}
            <TabPanel>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <MarketIntelligenceSimulation port={port} roomId={roomId} />
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>

      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default Simulation;
