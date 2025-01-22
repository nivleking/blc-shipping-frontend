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
      // Initialize with empty data instead of showing error
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
      // Get current card first to validate revenue
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

      // Update dropped items with new containers
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

      // Create new bay data array
      const newBayData = Array.from({ length: bayCount }).map((_, bayIndex) => {
        return Array.from({ length: baySize.rows }).map((_, rowIndex) => {
          return Array.from({ length: baySize.columns }).map((_, colIndex) => {
            const cellId = `bay-${bayIndex}-${rowIndex * baySize.columns + colIndex}`;
            const item = updatedDroppedItems.find((item) => item.area === cellId);
            return item ? item.id : null;
          });
        });
      });

      // Create new dock data array
      const newDockData = Array.from({ length: dockSize.rows }).map((_, rowIndex) => {
        return Array.from({ length: dockSize.columns }).map((_, colIndex) => {
          const cellId = `docks-${rowIndex * dockSize.columns + colIndex}`;
          const item = updatedDroppedItems.find((item) => item.area === cellId);
          return item ? item.id : null;
        });
      });

      // Update bay with new revenue
      console.log("New revenue", newRevenue);
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
    if (type !== "bay") return true;

    const row = Math.floor(cellIndex / baySize.columns);
    const col = cellIndex % baySize.columns;

    const isOccupied = droppedItems.some((item) => item.area === targetArea);
    if (isOccupied) return false;

    if (row < baySize.rows - 1) {
      const belowCellId = `bay-${bayIndex}-${(row + 1) * baySize.columns + col}`;
      const containerBelow = droppedItems.find((item) => item.area === belowCellId);
      if (!containerBelow) return false;
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

  return (
    <>
      <ToastContainer />
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Add Revenue Display */}
          <div className="bg-green-100 p-4 shadow-md mb-4">
            <h2 className="text-xl font-bold text-center">Total Revenue: {formatIDR(revenue)}</h2>
          </div>
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {/* Ship Bay */}
            <ShipBay bayCount={bayCount} baySize={baySize} droppedItems={droppedItems} draggingItem={draggingItem} />

            {/* Ship Dock */}
            <div className="flex flex-row justify-center items-center gap-4" style={{ height: "100%", width: "100%", backgroundColor: "#e0e0e0" }}>
              <ShipDock dockSize={dockSize} paginatedItems={paginatedItems} draggingItem={draggingItem} />

              <div className="flex flex-col items-center w-full max-w-md">
                <SalesCallCard salesCallCards={salesCallCards} currentCardIndex={currentCardIndex} containers={containers} formatIDR={formatIDR} handleAcceptCard={handleAcceptCard} handleRejectCard={handleRejectCard} />
              </div>
            </div>

            {/* DragOverlay */}
            <DragOverlay>{draggingItem ? <DraggableContainer id={draggingItem} text={draggingItem} style={{ zIndex: 9999 }} /> : null}</DragOverlay>
          </DndContext>
        </div>
      )}
    </>
  );
};

export default Simulation;
