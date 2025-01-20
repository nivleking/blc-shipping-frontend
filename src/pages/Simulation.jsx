import { useState, useEffect, useContext } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import api from "../axios/axios";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import ContainerDock from "../components/simulations/ContainerDock";
import ContainerBay from "../components/simulations/ContainerBay";
import DraggableContainer from "../components/simulations/DraggableContainer";
import DroppableCell from "../components/simulations/DroppableCell";
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
  const [droppedItems, setDroppedItems] = useState([
    // { id: "box1", area: "docks-0" },
    // { id: "box2", area: "docks-1" },
    // { id: "box3", area: "docks-2" },
  ]);
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

  useEffect(() => {
    fetchSalesCallCards();
    fetchContainers();
  }, [roomId, token]);

  async function fetchSalesCallCards() {
    try {
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

      const filteredCards = deckResponse.data.cards.filter((card) => card.origin === userPort);
      console.log("Filtered Cards:", filteredCards);
      setSalesCallCards(filteredCards);
    } catch (error) {
      console.error("Error fetching sales call cards:", error);
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

    console.log("User:", user);
    console.log("Room ID:", roomId);
    try {
      const response = await api.get(`ship-bays/${roomId}/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const savedArena = JSON.parse(response.data.arena);
      console.log("Saved Arena:", savedArena);

      const newDroppedItems = [];
      savedArena.forEach((bay, bayIndex) => {
        bay.forEach((row, rowIndex) => {
          row.forEach((item, colIndex) => {
            if (item) {
              newDroppedItems.push({
                id: item,
                area: `bay-${bayIndex}-${rowIndex * bay[0].length + colIndex}`,
              });
            }
          });
        });
      });
      setDroppedItems((prevItems) => [...prevItems.filter((item) => item.area.startsWith("docks")), ...newDroppedItems]);
    } catch (error) {
      console.error("Error fetching arena data:", error);
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
      const acceptedCard = salesCallCards.find((card) => card.id === cardId);
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
      setSalesCallCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
      setCurrentCardIndex((prevIndex) => (prevIndex < salesCallCards.length - 1 ? prevIndex : 0));
      fetchDockData();
    } catch (error) {
      console.error("Error accepting sales call card:", error);
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

  // Add these helper functions after existing formatIDR function
  const checkAbove = (droppedItems, baySize, targetArea) => {
    const [type, bayIndex, cellIndex] = targetArea.split("-");
    if (type !== "bay") return true;

    const row = Math.floor(cellIndex / baySize.columns);
    const col = cellIndex % baySize.columns;

    // Check if it's top row
    if (row === 0) return true;

    // Check if there's a container above
    const aboveCellId = `bay-${bayIndex}-${(row - 1) * baySize.columns + col}`;
    const containerAbove = droppedItems.find((item) => item.area === aboveCellId);

    return !containerAbove;
  };

  const checkSpace = (droppedItems, baySize, targetArea) => {
    const [type, bayIndex, cellIndex] = targetArea.split("-");
    if (type !== "bay") return true;

    const row = Math.floor(cellIndex / baySize.columns);
    const col = cellIndex % baySize.columns;

    // Don't allow if cell already occupied
    const isOccupied = droppedItems.some((item) => item.area === targetArea);
    if (isOccupied) return false;

    // If not bottom row, check container below
    if (row < baySize.rows - 1) {
      const belowCellId = `bay-${bayIndex}-${(row + 1) * baySize.columns + col}`;
      const containerBelow = droppedItems.find((item) => item.area === belowCellId);
      if (!containerBelow) return false; // Can't float in air
    }

    return true;
  };

  async function handleDragEnd(event) {
    const { active, over } = event;
    setDraggingItem(null);

    if (!over) return;

    // Same cell check
    const activeItem = droppedItems.find((item) => item.id === active.id);
    if (activeItem && activeItem.area === over.id) return;

    // Validate move
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
      const resBay = await api.post("/ship-bays", {
        arena: newBayData,
        user_id: user.id,
        room_id: roomId,
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
      <div className="flex flex-col">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Simulation Area */}
          <div className="p-5" style={{ height: "100%", backgroundColor: "#f0f0f0", overflowX: "auto" }}>
            <div className="flex" style={{ width: "max-content" }}>
              {Array.from({ length: bayCount }).map((_, bayIndex) => (
                <div key={`bay-${bayIndex}`}>
                  <h5 className="text-center text-md font-medium mb-2">Bay {bayIndex + 1}</h5>
                  <ContainerBay id={`bay-${bayIndex}`} rows={baySize.rows} columns={baySize.columns}>
                    {Array.from({ length: baySize.rows * baySize.columns }).map((_, cellIndex) => {
                      const rowIndex = Math.floor(cellIndex / baySize.columns);
                      const colIndex = cellIndex % baySize.columns;
                      const coordinates = `${bayIndex + 1}${rowIndex}${colIndex}`;
                      return (
                        <DroppableCell key={`bay-${bayIndex}-${cellIndex}`} id={`bay-${bayIndex}-${cellIndex}`} coordinates={coordinates}>
                          {droppedItems.find((item) => item.area === `bay-${bayIndex}-${cellIndex}`) && (
                            <DraggableContainer
                              id={droppedItems.find((item) => item.area === `bay-${bayIndex}-${cellIndex}`).id}
                              text={droppedItems.find((item) => item.area === `bay-${bayIndex}-${cellIndex}`).id}
                              isDragging={draggingItem === droppedItems.find((item) => item.area === `bay-${bayIndex}-${cellIndex}`).id}
                              color={droppedItems.find((item) => item.area === `bay-${bayIndex}-${cellIndex}`).color} // Pass color
                            />
                          )}
                        </DroppableCell>
                      );
                    })}
                  </ContainerBay>
                </div>
              ))}
            </div>
          </div>

          {/* Docks Area */}
          <div className="flex flex-row justify-center items-center gap-4" style={{ height: "100%", width: "100%", backgroundColor: "#e0e0e0" }}>
            <div className="flex flex-col items-center justify-center">
              <ContainerDock id="docks" rows={dockSize.rows} columns={dockSize.columns}>
                {Array.from({ length: dockSize.rows * dockSize.columns }).map((_, cellIndex) => {
                  const rowIndex = Math.floor(cellIndex / dockSize.columns);
                  const colIndex = cellIndex % dockSize.columns;
                  const coordinates = `docks-${rowIndex}${colIndex}`;
                  return (
                    <DroppableCell key={`docks-${cellIndex}`} id={`docks-${cellIndex}`} coordinates={coordinates}>
                      {paginatedItems.find((item) => item.area === `docks-${cellIndex}`) && (
                        <DraggableContainer
                          id={paginatedItems.find((item) => item.area === `docks-${cellIndex}`).id}
                          text={paginatedItems.find((item) => item.area === `docks-${cellIndex}`).id}
                          isDragging={draggingItem === paginatedItems.find((item) => item.area === `docks-${cellIndex}`).id}
                          color={paginatedItems.find((item) => item.area === `docks-${cellIndex}`).color} // Pass color
                        />
                      )}
                    </DroppableCell>
                  );
                })}
              </ContainerDock>
            </div>
            <div className="flex flex-col items-center w-full max-w-md">
              {salesCallCards.length > 0 && currentCardIndex < salesCallCards.length && (
                <div key={salesCallCards[currentCardIndex].id} className="bg-white rounded-lg shadow-md p-4 w-full">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <tbody>
                      <tr className="font-bold">
                        <td>{salesCallCards[currentCardIndex].origin}</td>
                        <td>Booking {salesCallCards[currentCardIndex].id}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}>
                          <hr />
                        </td>
                      </tr>
                      <tr>
                        <td className="font-medium py-2">Type:</td>
                        <td className="py-2">{salesCallCards[currentCardIndex].type}</td>
                      </tr>
                      <tr>
                        <td className="font-medium py-2">Priority:</td>
                        <td className="py-2">{salesCallCards[currentCardIndex].priority}</td>
                      </tr>
                      <tr>
                        <td className="font-medium py-2">Origin:</td>
                        <td className="py-2">{salesCallCards[currentCardIndex].origin}</td>
                      </tr>
                      <tr>
                        <td className="font-medium py-2">Destination:</td>
                        <td className="py-2">{salesCallCards[currentCardIndex].destination}</td>
                      </tr>
                      <tr>
                        <td className="font-medium py-2">Quantity:</td>
                        <td className="py-2">{salesCallCards[currentCardIndex].quantity}</td>
                      </tr>
                      <tr>
                        <td className="font-medium py-2">Revenue/Container:</td>
                        <td className="py-2">{formatIDR(salesCallCards[currentCardIndex].revenue / salesCallCards[currentCardIndex].quantity)}</td>
                      </tr>
                      <tr>
                        <td className="font-medium py-2">Total Revenue:</td>
                        <td className="py-2">{formatIDR(salesCallCards[currentCardIndex].revenue)}</td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="font-medium py-2 text-center">
                          Containers
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="py-2">
                          <div className="grid grid-cols-3 gap-2">
                            {containers
                              .filter((container) => container.card_id === salesCallCards[currentCardIndex].id)
                              .map((container) => (
                                <div
                                  key={container.id}
                                  className={`p-2 border border-dashed border-gray-300 rounded text-center bg-${container.color}-500`}
                                  style={{ backgroundImage: "linear-gradient(90deg, transparent 70%, rgba(255, 255, 255, 0.5) 50%)", backgroundSize: "10px 10px" }}
                                >
                                  {container.id}
                                </div>
                              ))}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="font-medium py-2 text-center">
                          <button onClick={() => handleAcceptCard(salesCallCards[currentCardIndex].id)} className="p-2 bg-green-500 text-white rounded mr-2">
                            Accept
                          </button>
                          <button onClick={() => handleRejectCard(salesCallCards[currentCardIndex].id)} className="p-2 bg-red-500 text-white rounded">
                            Reject
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* DragOverlay */}
          <DragOverlay>{draggingItem ? <DraggableContainer id={draggingItem} text={draggingItem} style={{ zIndex: 9999 }} /> : null}</DragOverlay>
        </DndContext>
      </div>
    </>
  );
};

export default Simulation;
