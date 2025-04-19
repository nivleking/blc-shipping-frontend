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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(1);

  // Market Intelligence states
  const [moveCost, setMoveCost] = useState(0);
  const [dockWarehouseCost, setDockWarehouseCost] = useState(0);
  const [restowageCost, setRestowageCost] = useState(0);

  // const [extraMovesCost, setExtraMovesCost] = useState(0);
  // const fetchRankings = async () => {
  //   try {
  //     const response = await api.get(`/rooms/${roomId}/rankings`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     return response.data;
  //   } catch (error) {
  //     console.error("Error fetching rankings:", error);
  //     return [];
  //   }
  // };

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
  const [dockWarehouseContainers, setDockWarehouseContainers] = useState([]);

  const [targetContainers, setTargetContainers] = useState([]);
  const [containerDestinationsCache, setContainerDestinationsCache] = useState({});

  const [unfulfilledContainers, setUnfulfilledContainers] = useState({});
  // const [destinationsFetched, setDestinationsFetched] = useState(false);

  const [penalties, setPenalties] = useState(0);
  const [rank, setRank] = useState(1);
  const [moveStats, setMoveStats] = useState({
    loadMoves: 0,
    dischargeMoves: 0,
    acceptedCards: 0,
    rejectedCards: 0,
    loadPenalty: 0,
    dischargePenalty: 0,
    dockWarehousePenalty: 0,
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

  const fetchBayStatistics = async () => {
    try {
      const response = await api.get(`/ship-bays/${roomId}/${user.id}/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      // console.log("Bay Statistics:", data);
      setBayMoves(data.bay_moves || {});
      setDockWarehouseContainers(data.dock_warehouse_containers || []);

      // setBayPairs(data.bay_pairs || []);
      // setLongCraneMoves(data.long_crane_moves || 0);
      // setExtraMovesOnLongCrane(data.extra_moves_on_long_crane || 0);
    } catch (error) {
      console.error("Error fetching bay statistics:", error);
    }
  };

  // Call this in useEffect after data changes
  useEffect(() => {
    if (user && token && roomId) {
      fetchBayStatistics();
    }
  }, [droppedItems, section, moveStats.loadMoves, moveStats.dischargeMoves]);

  const [selectedHistoricalWeek, setSelectedHistoricalWeek] = useState(currentRound);
  const [historicalStats, setHistoricalStats] = useState(null);
  const [showHistorical, setShowHistorical] = useState(false);

  const fetchHistoricalStats = async (week) => {
    try {
      setIsLoading(true);
      console.log("Fetching historical statistics for week:", week);

      const url = `/rooms/${roomId}/users/${user.id}/bay-statistics-history/${week}`;
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Object.keys(response.data).length > 0) {
        setHistoricalStats(response.data);
      } else {
        console.warn("No historical data found or empty response:", response.data);
        setHistoricalStats(null);
      }
    } catch (error) {
      console.error("Error fetching historical statistics:", error);
      setHistoricalStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showHistorical && selectedHistoricalWeek && selectedHistoricalWeek !== currentRound) {
      fetchHistoricalStats(selectedHistoricalWeek);
    } else {
      setHistoricalStats(null);
    }
  }, [selectedHistoricalWeek, showHistorical, currentRound, roomId, user?.id, token]);

  const [weekSalesCalls, setWeekSalesCalls] = useState([]);
  const [weekRevenueTotal, setWeekRevenueTotal] = useState(0);

  useEffect(() => {
    fetchConfig();
    fetchContainers();
    fetchSalesCallCards();
  }, [roomId, token]);

  async function fetchConfig() {
    try {
      const response = await api.get(`/rooms/${roomId}/config`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { baySize, bayCount, bayTypes } = response.data;
      setBaySize(baySize);
      setBayCount(bayCount);
      setBayTypes(bayTypes);
    } catch (error) {
      console.error("There was an error fetching the configuration!", error);
    }
  }

  useEffect(() => {
    if (roomId && token && user) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          await fetchStats();
          await fetchArenaData();
          await fetchDockData();
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

  async function fetchSalesCallCards(isRefresh = false) {
    if (!user || !token) {
      console.log("User not authenticated");
      return;
    }

    setIsLoading(true);
    try {
      // Check if card limit is exceeded first
      const isExceeded = await checkLimitCard();
      console.log("Limit check result before fetching cards:", isExceeded);

      if (isExceeded) {
        console.log("Card limit exceeded, not fetching new cards");
        setSalesCallCards([]);
        setIsLimitExceeded(true);
        setIsLoading(false);
        return;
      }

      // Get room data
      const roomResponse = await api.get(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const deckId = roomResponse.data.deck_id;
      setDeckId(deckId);
      setMoveCost(roomResponse.data.move_cost);
      // setExtraMovesCost(roomResponse.data.extra_moves_cost);
      // setIdealCraneSplit(roomResponse.data.ideal_crane_split);

      setMustProcessCards(roomResponse.data.cards_must_process_per_round);
      setCardsLimit(roomResponse.data.cards_limit_per_round);

      // Get port data
      const portResponse = await api.get(`/rooms/${roomId}/user-port`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userPort = portResponse.data.port;
      setPort(userPort);

      // Get all cards from deck
      const deckResponse = await api.get(`/decks/${deckId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Get temporary cards
      const cardTemporaryResponse = await api.get(`/card-temporary/${roomId}/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const cardTemporaries = cardTemporaryResponse.data.cards;
      // console.log("Card temp", cardTemporaries);

      // These cards already have the proper card data via eager loading
      console.log("Card Temporaries:", cardTemporaries);
      const availableCards = cardTemporaries.map((cardTemp) => {
        // Combine card temporary data with its related card data
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

      console.log("Sorted cards by ID:", sortedByCardId);

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

      fetchSalesCallCards(true);
      showInfo("Fetching available cards for this round...");
    } else {
      showInfo("Cards are still available. Refresh is only possible when no cards are available.");
    }
  };

  async function fetchContainers() {
    try {
      const response = await api.get("/containers");
      setContainers(response.data);
    } catch (error) {
      console.error("Error fetching containers:", error);
    }
  }

  useEffect(() => {
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
          dockWarehousePenalty: stats.dock_warehouse_penalty || 0,
        });
        setPenalties(stats.penalty || 0);
        setRank(stats.rank || 1);
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
      await Promise.all([fetchArenaData(), fetchDockData(), fetchSalesCallCards()]);

      // Reset states
      setSection(1);
      setIsLimitExceeded(false);
      setSalesCallCards([]);
      setCurrentCardIndex(0);
      setWeekSalesCalls([]);
      setWeekRevenueTotal(0);
      setProcessedCards(0);

      // Update weekly performance data for the previous round
      try {
        await api.post(
          `/rooms/${roomId}/users/${user.id}/weekly-performance/${currentRound}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Weekly performance data updated for round", currentRound);
      } catch (error) {
        console.error("Error updating weekly performance:", error);
      }

      // Refetch sales cards after a short delay
      setTimeout(() => {
        fetchSalesCallCards();
        fetchStats();
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

    try {
      const roomResponse = await api.get(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const deckId = roomResponse.data.deck_id;
      setDeckId(deckId);
      setMoveCost(roomResponse.data.move_cost);
      setDockWarehouseCost(roomResponse.data.dock_warehouse_cost);
      setRestowageCost(roomResponse.data.restowage_cost);
      // setExtraMovesCost(roomResponse.data.extra_moves_cost);
      // setIdealCraneSplit(roomResponse.data.ideal_crane_split);

      setMustProcessCards(roomResponse.data.cards_must_process_per_round);
      setCardsLimit(roomResponse.data.cards_limit_per_round);
      setTotalRounds(roomResponse.data.total_rounds);

      console.log("Total Rounds:", roomResponse.data.total_rounds);

      const response = await api.get(`ship-bays/${roomId}/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentRound(response.data.current_round);
      setProcessedCards(response.data.processed_cards);
      console.log("Current Round:", response.data.current_round);

      const configRes = await api.get(`/rooms/${roomId}/config`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { baySize, bayCount, bayTypes } = configRes.data;
      setBaySize(baySize);
      setBayCount(bayCount);
      setBayTypes(bayTypes);

      const initialBayData = Array.from({ length: bayCount }).map(() => Array.from({ length: baySize.rows }).map(() => Array(baySize.columns).fill(null)));

      const savedArena = typeof response.data.arena === "string" ? JSON.parse(response.data.arena) : response.data.arena;
      const newDroppedItems = [];
      // console.log("ShipBayData:", response.data.arena);

      const containersRes = await api.get("/containers");
      const containerData = containersRes.data;

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
          // console.log("Cell ID:", cellId);

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
      else if (response.data.arena) {
        savedArena.forEach((bay, bayIndex) => {
          bay.forEach((row, rowIndex) => {
            row.forEach((item, colIndex) => {
              if (item) {
                const containerObj = containerData.find((c) => c.id === item);
                if (containerObj) {
                  newDroppedItems.push({
                    id: item,
                    area: `bay-${bayIndex}-${rowIndex * bay[0].length + colIndex}`,
                    color: containerObj.color,
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

      // Get revenue from response
      setRevenue(response.data.revenue || 0);
      setPort(response.data.port);
      setSection(response.data.section === "section1" ? 1 : 2);

      // Process dock items
      const dockResponse = await api.get(`ship-docks/${roomId}/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Parse arena data - handle both old and new formats
      const dockArena = dockResponse.data.arena ? JSON.parse(dockResponse.data.arena) : null;
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
                  is_restowed: container.is_restowed || false,
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
                    is_restowed: container.is_restowed || false,
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

      const restowageResponse = await api.get(`/rooms/${roomId}/restowage-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRestowageContainers(restowageResponse.data.restowage_containers || []);
      setRestowagePenalty(restowageResponse.data.restowage_penalty || 0);
      setRestowageMoves(restowageResponse.data.restowage_moves || 0);

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
      setDockSize(dockSize);

      // Process arena data - now handles both old and new formats
      const arenaData = JSON.parse(response.data.arena || "{}");
      let dockItems = [];

      if (arenaData.containers) {
        // New flat format with positions
        for (const container of arenaData.containers) {
          const containerData = containers.find((c) => c.id === container.id);
          if (containerData) {
            dockItems.push({
              id: container.id,
              area: `docks-${container.position}`,
              color: containerData.color,
            });
          }
        }
      } else {
        // Old 2D grid format (for backward compatibility)
        const flatArena = Array.isArray(arenaData) ? arenaData.flat() : [];
        flatArena.forEach((item, index) => {
          if (item) {
            const container = containers.find((c) => c.id === item);
            if (container) {
              dockItems.push({
                id: item,
                area: `docks-${index}`,
                color: container.color,
              });
            }
          }
        });
      }

      // Update dropped items with dock items
      setDroppedItems((prev) => {
        // Remove all previous dock items
        const bayItems = prev.filter((item) => !item.area.startsWith("docks-"));
        // Add new dock items
        return [...bayItems, ...dockItems];
      });
    } catch (error) {
      console.error("Error fetching dock data:", error);
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

    try {
      setIsProcessingCard(true);
      setIsCardVisible(false);

      const currentCard = salesCallCards[currentCardIndex];
      if (!currentCard) {
        console.log("No more cards to process");
        setIsProcessingCard(false);
        setIsCardVisible(true);
        return;
      }

      const shipBayResponse = await api.get(`ship-bays/${roomId}/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentProcessed = shipBayResponse.data.processed_cards;

      if (currentProcessed + 1 >= mustProcessCards) {
        setIsLimitExceeded(true);
      }

      const cardResponse = await api.post(
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

      setProcessedCards(cardResponse.data.processed_cards);

      await api.post(
        `/capacity-uptakes/${roomId}/${user.id}/${currentRound}`,
        {
          card_action: "accept",
          card: salesCallCards[currentCardIndex],
          port: port,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSalesCallCards((prevCards) => prevCards.filter((card) => card.id !== cardId));

      // const cardRevenue = parseFloat(currentCard.revenue) || 0;
      // const newRevenue = parseFloat(revenue) + cardRevenue;

      console.log("Current Round:", currentRound);
      await api.post(
        "/card-temporary/accept",
        {
          room_id: roomId,
          card_temporary_id: cardId,
          round: currentRound,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // setRevenue(newRevenue);

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

      // Update states
      setBayData(newBayData);
      setDockData(dockArenaData);

      setCurrentCardIndex((prevIndex) => {
        const nextIndex = prevIndex < salesCallCards.length - 1 ? prevIndex : 0;
        return nextIndex;
      });

      // await api.put(
      //   `/ship-bays/${roomId}/${user.id}/section`,
      //   {
      //     section: "section2",
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );

      await Promise.all([
        api.post("/ship-bays", {
          arena: newBayData,
          user_id: user.id,
          room_id: roomId,
          section: "section2",
          // revenue: newRevenue,
        }),
        api.post("/ship-docks", {
          arena: dockArenaData,
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

      showSuccess(`Card accepted! Move all containers to ship bay to earn revenue.`);

      socket.emit("stats_requested", {
        roomId,
        userId: user.id,
      });
    } catch (error) {
      console.error("Error accepting card:", error);
      showError("Failed to process card");
      setIsCardVisible(true);
    } finally {
      setIsProcessingCard(false);
      setTimeout(() => {
        setIsCardVisible(true);
      }, 300);
    }
  }

  // Perbaiki fungsi checkLimitCard
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

      // cards_must_process_per_round limit
      const hasReachedMustProcess = shipBay.processed_cards >= room.cards_must_process_per_round;

      // cards_limit_per_round limit
      const hasReachedMaxCards = shipBay.current_round_cards >= room.cards_limit_per_round;

      // Gabungkan hasil pengecekan
      const isExceeded = hasReachedMustProcess || hasReachedMaxCards;

      console.log("Limit check details:", {
        processedCards: shipBay.processed_cards,
        mustProcess: room.cards_must_process_per_round,
        currentRoundCards: shipBay.current_round_cards,
        cardsLimit: room.cards_limit_per_round,
        hasReachedMustProcess,
        hasReachedMaxCards,
        isExceeded,
      });

      // Update state dengan hasil pengecekan
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

      if (!salesCallCards[currentCardIndex]) {
        console.log("No more cards to process");
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
          round: currentRound,
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

      await api.post(
        `/capacity-uptakes/${roomId}/${user.id}/${currentRound}`,
        {
          card_action: "reject",
          card: salesCallCards[currentCardIndex],
          port: port,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

        if (isTargetContainer) {
          showInfo("Drag this container to the ship dock to unload it");
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
          const containerResponse = await api.get(`/containers/${active.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (containerResponse.data.card && containerResponse.data.card.destination === port) {
            // This container should be unloaded at current port

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
              })),
              totalContainers: newBayData.length,
            };
            setBayData(flatBayData);

            showSuccess("Container unloaded successfully!");

            // Track discharge move - Include bay_index
            try {
              await api.post(
                `/ship-bays/${roomId}/${user.id}/moves`,
                {
                  move_type: "discharge",
                  count: 1,
                  bay_index: sourceBayIndex,
                  container_id: active.id,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              // Save updated bay state
              await api.post("/ship-bays", {
                arena: flatBayData,
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

              return;
            } catch (error) {
              console.error("API call failed", error);
              showError("Failed to update container status");
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
        return;
      }
    }

    if (activeItem && isDirectUpperMove(activeItem.area, over.id, baySize)) {
      showError("Invalid placement - container cannot float");
      return;
    }

    const isSourceBlocked = isBlockedByContainerAbove(droppedItems, activeItem.area);
    if (isSourceBlocked) {
      showError("Cannot move container - blocked by container above");
      return;
    }

    const isAboveClear = checkAbove(droppedItems, baySize, over.id);
    const isSpaceValid = checkSpace(droppedItems, baySize, over.id);

    if (!isAboveClear) {
      showError("Cannot place container - blocked by container above");
      return;
    }

    if (!isSpaceValid) {
      showError("Invalid placement - container cannot float");
      return;
    }

    const updatedDroppedItems = droppedItems.map((item) => (item.id === active.id ? { ...item, area: over.id } : item));
    setDroppedItems(updatedDroppedItems);

    showSuccess("Container placed successfully!");

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

      if (isBayInvolved && relevantBayIndex !== null) {
        console.log(`Move type: ${moveType}, Source bay: ${sourceBayIndex}, Destination bay: ${destinationBayIndex}, Using bay_index: ${relevantBayIndex}`);

        // Track the move with bay_index
        await api.post(
          `/ship-bays/${roomId}/${user.id}/moves`,
          {
            move_type: moveType,
            count: 1,
            bay_index: relevantBayIndex,
            container_id: containerId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      const resBay = await api.post("/ship-bays", {
        arena: newBayData,
        user_id: user.id,
        room_id: roomId,
        moved_container: {
          id: container.id,
          from: fromArea,
          to: toArea,
        },
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

      const unfulfilledResponse = await api.get(`/card-temporary/unfulfilled/${roomId}/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Unfulfilled containers:", unfulfilledResponse.data);
      setUnfulfilledContainers(unfulfilledResponse.data);

      const shipBayResponse = await api.get(`ship-bays/${roomId}/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (shipBayResponse.data && shipBayResponse.data.revenue !== undefined) {
        setRevenue(shipBayResponse.data.revenue);
        setPenalties(shipBayResponse.data.penalty || 0);
      }

      const resDock = await api.post("/ship-docks", {
        arena: dockArenaData, // Send new format
        user_id: user.id,
        room_id: roomId,
        dock_size: dockSize,
      });
      console.log("API call successful for docks", resDock.data);

      const restowageResponse = await api.get(`/rooms/${roomId}/restowage-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRestowageContainers(restowageResponse.data.restowage_containers || []);
      setRestowagePenalty(restowageResponse.data.restowage_penalty || 0);
      setRestowageMoves(restowageResponse.data.restowage_moves || 0);

      // Request updated stats after move
      socket.emit("stats_requested", {
        roomId,
        userId: user.id,
      });

      // console.log("API call successful for logs", resLog.data);
    } catch (error) {
      console.error("API call failed", error);
    }
  }

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

  // Add new function to fetch stats
  const fetchStats = async () => {
    try {
      const shipBayResponse = await api.get(`/ship-bays/${roomId}/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const stats = shipBayResponse.data;

      console.log("Fetched stats:", stats);

      setMoveStats({
        loadMoves: stats.load_moves || 0,
        dischargeMoves: stats.discharge_moves || 0,
        acceptedCards: stats.accepted_cards || 0,
        rejectedCards: stats.rejected_cards || 0,
        loadPenalty: stats.load_penalty || 0,
        dischargePenalty: stats.discharge_penalty || 0,
        dockWarehousePenalty: stats.dock_warehouse_penalty || 0,
      });

      setProcessedCards(stats.processed_cards || 0);
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

  useEffect(() => {
    if (!droppedItems.length || !port || Object.keys(containerDestinationsCache).length === 0) {
      return;
    }

    // Filter containers whose destination matches the current port
    const containersToUnload = droppedItems.filter((item) => {
      const destination = containerDestinationsCache[item.id];

      // Debug individual container check
      // console.log(`Container ${item.id} destination: ${destination}, match with ${port}: ${destination === port}`);

      // Case-insensitive comparison to be safe
      return destination && destination.trim().toUpperCase() === port.trim().toUpperCase();
    });

    console.log("Containers to unload at this port:", containersToUnload);

    // Update the target containers state
    setTargetContainers(containersToUnload);
  }, [droppedItems, containerDestinationsCache, port, section]);

  async function fetchContainerDestinations() {
    try {
      const containerIds = droppedItems.map((item) => item.id);

      if (containerIds.length === 0) return;

      const roomResponse = await api.get(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log("Fetching container destinations for IDs:", containerIds);
      // console.log("Deck ID:", roomResponse.data.deck_id);

      const response = await api.post("/containers/destinations", { containerIds, deckId: roomResponse.data.deck_id }, { headers: { Authorization: `Bearer ${token}` } });

      // console.log("Fetched container destinations:", response.data);
      setContainerDestinationsCache(response.data);
    } catch (error) {
      console.error("Error fetching container destinations:", error);
      showError("Failed to get container destination information");
    }
  }

  useEffect(() => {
    if (droppedItems.length > 0 && token) {
      fetchContainerDestinations();
    }
  }, [droppedItems, token]);

  const canProceedToSectionTwo = () => {
    return targetContainers.length === 0;
  };

  // Update handleNextSection to use the simplified check
  const handleNextSection = async () => {
    if (!canProceedToSectionTwo()) {
      showError("Please unload all containers destined for your port first!");
      return;
    }

    try {
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

      setSection(2);
    } catch (error) {
      console.error("Error updating section:", error);
      showError("Failed to update section");
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

              <p className="text-red-600 font-bold text-center">Please wait while containers are being swapped!</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="container mx-auto px-6 space-y-6">
          <HeaderCards
            roomId={roomId}
            port={port}
            revenue={revenue}
            penalties={penalties}
            rank={rank}
            section={section}
            formatIDR={formatIDR}
            moves={moveStats}
            currentRound={currentRound}
            totalRounds={totalRounds}
            moveCost={moveCost}
            dockWarehouseCost={dockWarehouseCost}
            restowageCost={restowageCost}
            // extraMovesCost={extraMovesCost}
          />

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
                  Capacity Uptake
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

              <Tab
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
              </Tab>
            </TabList>

            <TabPanels className="mt-4">
              {/* Capacity Uptake */}
              <TabPanel>
                <CapacityUptake port={port} currentRound={currentRound} totalRounds={totalRounds} />
              </TabPanel>

              <TabPanel>
                <Stowage
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
                  selectedHistoricalWeek={selectedHistoricalWeek}
                  setSelectedHistoricalWeek={setSelectedHistoricalWeek}
                  historicalStats={historicalStats}
                  showHistorical={showHistorical}
                  setShowHistorical={setShowHistorical}
                  onRefreshCards={handleRefreshCards}
                  dockWarehouseContainers={dockWarehouseContainers}
                  restowageContainers={restowageContainers}
                  restowagePenalty={restowagePenalty}
                  restowageMoves={restowageMoves}
                  containerDestinationsCache={containerDestinationsCache}
                  unfulfilledContainers={unfulfilledContainers}
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
                  <MarketIntelligenceSimulation port={port} roomId={roomId} moveCost={moveCost} />
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      )}
    </div>
  );
};

export default Simulation;
