import { useState, useEffect, useContext } from "react";
import { api, socket } from "../axios/axios";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import CapacityUptake from "../components/simulations/CapaticyUptake";
import HeaderCards from "../components/simulations/stowages/HeaderCards";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "../components/simulations/LoadingSpinner";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import WeeklyPerformance from "../components/simulations/WeeklyPerformance";
import MarketIntelligence from "../components/simulations/MarketIntelligence";
import Stowage from "../components/simulations/Stowage";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
};

const Simulation = () => {
  const { roomId } = useParams();
  const { user, token } = useContext(AppContext);
  const [port, setPort] = useState("");
  const navigate = useNavigate();
  const [droppedItems, setDroppedItems] = useState([]);
  const [baySize, setBaySize] = useState({ rows: 1, columns: 1 });
  const [bayCount, setBayCount] = useState(1);
  const [bayData, setBayData] = useState([]);
  const [dockData, setDockData] = useState([]);
  const [dockSize, setDockSize] = useState({ rows: 3, columns: 5 });
  const [currentPage, setCurrentPage] = useState(0);
  const [draggingItem, setDraggingItem] = useState(null);
  const itemsPerPage = 15;

  const [salesCallCards, setSalesCallCards] = useState([]);
  const [containers, setContainers] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectedTab, setSelectedTab] = useState(1);

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
      const roomResponse = await api.get(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const deckId = roomResponse.data.deck_id;

      if (!user.id) {
        toast.error("User session invalid");
        navigate("/");
        return;
      }

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
        .filter((card) => card.origin === userPort)
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

    socket.on("swap_bays", () => {
      setIsSwapping(true);
      setTimeout(() => {
        setIsSwapping(false);
        setSection(1);
        fetchArenaData();
        fetchDockData();
      }, 3000);
    });

    return () => {
      socket.off("swap_bays");
    };
  }, [roomId, user, token]);

  async function fetchArenaData() {
    if (!user || !user.id) {
      console.log("User not available yet");
      return;
    }

    try {
      const response = await api.get(`ship-bays/${roomId}/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      console.log("Port:", response.data.port);

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
      const dockSize = JSON.parse(response.data.dock_size || '{"rows": 3, "columns": 5}');
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
      const { baySize, bayCount } = response.data;
      setBaySize(baySize);
      setBayCount(bayCount);
    } catch (error) {
      console.error("There was an error fetching the configuration!", error);
    }
  }

  useEffect(() => {
    if (currentCardIndex >= salesCallCards.length) {
      setCurrentCardIndex(0);
    }
  }, [salesCallCards, currentCardIndex]);

  async function handleAcceptCard(cardId) {
    if (section !== 2) {
      toast.error("Please complete section 1 first!");
      return;
    }

    try {
      const currentCard = salesCallCards.find((card) => card.id === cardId);
      const cardRevenue = parseFloat(currentCard.revenue) || 0;
      const newRevenue = parseFloat(revenue) + cardRevenue;

      await api.post(
        "/card-temporary/accept",
        {
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

      const response = await api.get(`/rooms/${roomId}/rankings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      socket.emit("rankings_updated", {
        roomId,
        rankings: response.data,
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

      const newDockData = Array.from({ length: dockSize.rows }).map((_, rowIndex) => {
        return Array.from({ length: dockSize.columns }).map((_, colIndex) => {
          const cellId = `docks-${rowIndex * dockSize.columns + colIndex}`;
          const item = updatedDroppedItems.find((item) => item.area === cellId);
          return item ? item.id : null;
        });
      });

      const tempRes = await api.post(
        "/ship-bays",
        {
          arena: newBayData,
          user_id: user.id,
          room_id: roomId,
          revenue: newRevenue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Temp res:", tempRes);

      // Update dock
      await api.post(
        "/ship-docks",
        {
          arena: newDockData,
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

      // Update states
      setBayData(newBayData);
      setDockData(newDockData);
      setSalesCallCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
      setCurrentCardIndex((prevIndex) => (prevIndex < salesCallCards.length - 1 ? prevIndex : 0));

      toast.success(`Containers added and revenue increased by ${formatIDR(cardRevenue)}!`);
    } catch (error) {
      console.error("Error accepting sales call card:", error);
      toast.error("Failed to add containers to dock");
    }
  }

  async function handleRejectCard(cardId) {
    try {
      await api.post(
        "/card-temporary/reject",
        {
          card_temporary_id: cardId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSalesCallCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
      setCurrentCardIndex((prevIndex) => (prevIndex < salesCallCards.length - 1 ? prevIndex : 0));
    } catch (error) {
      console.error("Error rejecting sales call card:", error);
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

  // Add new helper function to check if container is at bottom row
  const isBottomContainer = (sourceArea, targetArea) => {
    const [srcType, srcBayIndex, srcCellIndex] = sourceArea.split("-");
    const [targetType, targetBayIndex, targetCellIndex] = targetArea.split("-");

    if (srcType !== "bay" || targetType !== "bay") return false;

    const srcRow = Math.floor(srcCellIndex / baySize.columns);
    const srcCol = srcCellIndex % baySize.columns;

    // Check if source is bottom row
    if (srcRow === baySize.rows - 1) {
      const targetRow = Math.floor(targetCellIndex / baySize.columns);
      // Prevent moving up if source is bottom container
      if (targetRow < srcRow) {
        return true;
      }
    }

    return false;
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

  // Add this helper function after other helper functions
  const isBlockedByContainerAbove = (droppedItems, sourceArea) => {
    const [type, bayIndex, cellIndex] = sourceArea.split("-");

    if (type !== "bay") return false;

    const row = Math.floor(cellIndex / baySize.columns);
    const col = cellIndex % baySize.columns;

    // Check if there's a container above
    if (row > 0) {
      const aboveCellId = `bay-${bayIndex}-${(row - 1) * baySize.columns + col}`;
      return droppedItems.some((item) => item.area === aboveCellId);
    }

    return false;
  };

  async function handleDragEnd(event) {
    const { active, over } = event;
    setDraggingItem(null);

    if (!over) return;

    const activeItem = droppedItems.find((item) => item.id === active.id);
    if (activeItem && activeItem.area === over.id) return;

    // Check if source container is blocked by containers above
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

    // Existing update logic...
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
      console.log("Revenue:", revenue);
      const resBay = await api.post("/ship-bays", {
        arena: newBayData,
        user_id: user.id,
        room_id: roomId,
        revenue: revenue,
      });
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
      console.log("API call successful for logs", resLog.data);
    } catch (error) {
      console.error("API call failed", error);
    }
  }

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => prevPage + direction);
  };

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
    socket.on("end_simulation", (endedRoomId) => {
      if (endedRoomId === roomId) {
        navigate("/user-home");
      }
    });

    return () => {
      socket.off("end_simulation");
    };
  }, [roomId, navigate]);

  const paginatedItems = droppedItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const [penalties, setPenalties] = useState(0);
  const [rank, setRank] = useState(1);
  const [section, setSection] = useState(1);
  const [targetContainers, setTargetContainers] = useState([]);

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

  // Update handler
  const handleNextSection = async () => {
    const canProceed = await canProceedToSectionTwo();
    if (!canProceed) {
      toast.error("Please unload all containers destined for your port first!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    setSection(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-6">
      {/* Overlay Modal */}
      {isSwapping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <h3 className="text-xl font-semibold text-gray-800">Swapping Bays</h3>
              <p className="text-gray-500 text-center">Please wait while the bays are being swapped...</p>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" theme="light" autoClose={3000} />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="container mx-auto px-6 space-y-6">
          <HeaderCards port={port} revenue={revenue} penalties={penalties} rank={rank} section={section} formatIDR={formatIDR} />

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
              {/* Capacity & Uptake Tab */}
              <TabPanel>
                <CapacityUptake />
              </TabPanel>

              <TabPanel>
                <Stowage
                  bayCount={bayCount}
                  baySize={baySize}
                  droppedItems={droppedItems}
                  draggingItem={draggingItem}
                  dockSize={dockSize}
                  paginatedItems={paginatedItems}
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
                />
              </TabPanel>

              {/* Weekly Performance Tab */}
              <TabPanel>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Weekly Performance Report</h3>
                  <WeeklyPerformance port={port} />
                </div>
              </TabPanel>

              {/* Market Intelligence Tab */}
              <TabPanel>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Market Intelligence</h3>
                  <MarketIntelligence port={port} />
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
