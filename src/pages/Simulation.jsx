import { useState, useEffect, useContext } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import api from "../axios/axios";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import ShipBay from "../components/simulations/ShipBay";
import ShipDock from "../components/simulations/ShipDock";
import SalesCallCard from "../components/simulations/SalesCallCard";
import DraggableContainer from "../components/simulations/DraggableContainer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const websocket = "http://localhost:5174";
const socket = io.connect(websocket);

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
};

const Simulation = () => {
  const { roomId } = useParams();
  const { user, token } = useContext(AppContext);
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
      fetchArenaData();
      fetchDockData();
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

  async function handleDragEnd(event) {
    const { active, over } = event;
    setDraggingItem(null);

    if (!over) return;

    const activeItem = droppedItems.find((item) => item.id === active.id);
    if (activeItem && activeItem.area === over.id) return;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-6">
      <ToastContainer position="top-right" theme="light" autoClose={3000} />

      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : (
        <div className="container mx-auto px-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Revenue Card */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm font-medium opacity-80">Total Revenue</p>
                  <h3 className="text-2xl font-bold">{formatIDR(revenue)}</h3>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Penalties Card */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm font-medium opacity-80">Penalties</p>
                  <h3 className="text-2xl font-bold">{formatIDR(penalties)}</h3>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Rank Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm font-medium opacity-80">Current Rank</p>
                  <h3 className="text-2xl font-bold">#{rank}</h3>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Section Card */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-sm font-medium opacity-80">Section</p>
                  <h3 className="text-2xl font-bold">Section {section}</h3>
                </div>
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col gap-6">
              {/* Ship Bay Section - Full Width */}
              <div className="w-full bg-white rounded-xl shadow-xl p-6 border border-gray-200">
                <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                  <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  Ship Bay
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <ShipBay bayCount={bayCount} baySize={baySize} droppedItems={droppedItems} draggingItem={draggingItem} />
                </div>
              </div>

              {/* Bottom Grid - Ship Dock and Sales Call Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ship Dock Section */}
                <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                    <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                    Ship Dock
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <ShipDock dockSize={dockSize} paginatedItems={paginatedItems} draggingItem={draggingItem} />
                  </div>
                </div>

                {/* Sales Call Cards Section */}
                <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                    <svg className="w-7 h-7 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Sales Calls
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <SalesCallCard salesCallCards={salesCallCards} currentCardIndex={currentCardIndex} containers={containers} formatIDR={formatIDR} handleAcceptCard={handleAcceptCard} handleRejectCard={handleRejectCard} />
                  </div>
                </div>
              </div>
            </div>
            <DragOverlay>
              {draggingItem && (
                <div className="rounded-lg" style={{ width: "100px", height: "60px" }}>
                  <DraggableContainer
                    id={draggingItem}
                    text={draggingItem}
                    style={{
                      zIndex: 9999,
                      transform: "scale(1.05)",
                      opacity: 0.9,
                    }}
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default Simulation;
