import { useState, useEffect, useContext } from "react";
import { DndContext, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import api from "./../axios/axios";
import { io } from "socket.io-client";
import { CSS } from "@dnd-kit/utilities";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const websocket = "http://localhost:5174";
const socket = io.connect(websocket);

const DraggableContainer = ({ id, text, style, isDragging }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const defaultStyle = {
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 9999 : "auto",
  };

  return (
    <div ref={setNodeRef} style={{ ...defaultStyle, ...style }} {...listeners} {...attributes} className={`p-2 m-1 bg-blue-400 text-white rounded cursor-move shadow ${isDragging ? "dragging" : ""}`}>
      {text}
    </div>
  );
};

const DroppableCell = ({ id, children, coordinates }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const style = {
    backgroundColor: isOver ? "lightgreen" : "white",
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} className="h-16 w-16 border border-gray-300 flex items-center justify-center rounded shadow-sm">
      <span style={{ position: "absolute", top: "2px", left: "2px", fontSize: "10px", color: "gray" }}>{coordinates}</span>
      {children}
    </div>
  );
};

const ContainerBay = ({ id, rows, columns, children }) => {
  return (
    <div
      className="grid gap-1 m-2 border border-gray-400 rounded shadow-sm"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {children}
    </div>
  );
};

const ContainerDocks = ({ id, children }) => {
  return <div className="grid grid-cols-5 grid-rows-3 gap-1 m-2 border border-gray-400">{children}</div>;
};

const Simulation2 = () => {
  const { roomId } = useParams();
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const [droppedItems, setDroppedItems] = useState([
    { id: "box1", area: "docks-0" },
    { id: "box2", area: "docks-1" },
    { id: "box3", area: "docks-2" },
    { id: "box4", area: "docks-3" },
    { id: "box5", area: "docks-4" },
    { id: "box6", area: "docks-5" },
    { id: "box7", area: "docks-6" },
    { id: "box8", area: "docks-7" },
    { id: "box9", area: "docks-8" },
    { id: "box10", area: "docks-9" },
    { id: "box11", area: "docks-10" },
    { id: "box12", area: "docks-11" },
    { id: "box13", area: "docks-12" },
    { id: "box14", area: "docks-13" },
    { id: "box15", area: "docks-14" },
    { id: "box16", area: "docks-15" },
    { id: "box17", area: "docks-16" },
    { id: "box18", area: "docks-17" },
    { id: "box19", area: "docks-18" },
    { id: "box20", area: "docks-19" },
    { id: "box21", area: "docks-20" },
    { id: "box22", area: "docks-21" },
    { id: "box23", area: "docks-22" },
    { id: "box24", area: "docks-23" },
    { id: "box25", area: "docks-24" },
    { id: "box26", area: "docks-25" },
    { id: "box27", area: "docks-26" },
    { id: "box28", area: "docks-27" },
    { id: "box29", area: "docks-28" },
    { id: "box30", area: "docks-29" },
  ]);

  const [baySize, setBaySize] = useState({ rows: 2, columns: 2 });
  const [bayCount, setBayCount] = useState(2);
  const [bayData, setBayData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [draggingItem, setDraggingItem] = useState(null); // State to track the dragging item
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchArenaData = async () => {
      if (!user || !user.id) {
        console.log("User not available yet");
        return;
      }

      console.log("User:", user);
      console.log("Room ID:", roomId);
      try {
        const response = await api.get(
          `ship-bays/${roomId}/${user.id}`,
          {
            user_id: user.id,
            room_id: roomId,
          },
          {}
        );
        const savedArena = JSON.parse(response.data.arena);
        console.log("Saved Arena:", savedArena);

        // Flatten the saved arena data and update droppedItems state
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
    };

    fetchArenaData();

    socket.on("swap_bays", () => {
      fetchArenaData();
    });

    return () => {
      socket.off("swap_bays");
    };
  }, [roomId, baySize.columns, user]);

  const handleDragStart = (event) => {
    setDraggingItem(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setDraggingItem(null); // Reset dragging item
    console.log("Active:", active);
    console.log("Over:", over);

    if (over) {
      const activeItem = droppedItems.find((item) => item.id === active.id);
      if (activeItem && activeItem.area === over.id) {
        console.log("Item dropped in the same cell, no API call needed");
        return;
      }

      const updatedDroppedItems = droppedItems.map((item) => (item.id === active.id ? { ...item, area: over.id } : item));
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
      setBayData(newBayData);

      console.log("User:", user);
      console.log("Room ID:", roomId);

      try {
        const res = await api.post("/ship-bays", {
          arena: newBayData,
          user_id: user.id,
          room_id: roomId,
        });
        console.log("API call successful", res.data);
      } catch (error) {
        console.error("API call failed", error);
      }
    }
  };

  const handleBaySizeChange = (e) => {
    const { name, value } = e.target;
    setBaySize((prevSize) => ({ ...prevSize, [name]: parseInt(value) }));
  };

  const handleBayCountChange = (e) => {
    setBayCount(parseInt(e.target.value));
  };

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => prevPage + direction);
  };

  useEffect(() => {
    const newBayData = Array.from({ length: bayCount }).map((_, bayIndex) => {
      return Array.from({ length: baySize.rows }).map((_, rowIndex) => {
        return Array.from({ length: baySize.columns }).map((_, colIndex) => {
          const cellId = `bay-${bayIndex}-${rowIndex * baySize.columns + colIndex}`;
          const item = droppedItems.find((item) => item.area === cellId);
          return item ? item.id : null;
        });
      });
    });
    setBayData(newBayData);
    console.log("Bay Data:", newBayData);
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
      {/* Configuration Form */}
      <div className="p-5 border-b border-gray-400 w-screen">
        <h4 className="text-lg font-semibold mb-4">Configure Ship</h4>
        <div className="flex mb-4">
          <div className="mr-4">
            <label className="block mb-2">Bay Size (Rows x Columns):</label>
            <div className="flex items-center">
              <input max="7" type="number" name="rows" value={baySize.rows} onChange={handleBaySizeChange} min="1" className="w-12 p-1 border border-gray-300 rounded mr-2" />
              x
              <input max="8" type="number" name="columns" value={baySize.columns} onChange={handleBaySizeChange} min="1" className="w-12 p-1 border border-gray-300 rounded ml-2" />
            </div>
          </div>
          <div>
            <label className="block mb-2">Number of Bays:</label>
            <input max="8" type="number" value={bayCount} onChange={handleBayCountChange} min="1" className="w-12 p-1 border border-gray-300 rounded" />
          </div>
        </div>
      </div>

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
          <div className="flex flex-col items-center" style={{ height: "100%", width: "100%", backgroundColor: "#e0e0e0" }}>
            <ContainerDocks id="docks">
              {paginatedItems.map((item, index) => (
                <DroppableCell key={`docks-${index}`} id={`docks-${index}`}>
                  {item.area.startsWith("docks") && <DraggableContainer id={item.id} text={item.id} isDragging={draggingItem === item.id} />}
                </DroppableCell>
              ))}
            </ContainerDocks>
            <div className="flex justify-center gap-2 w-full mt-4">
              <button onClick={() => handlePageChange(-1)} disabled={currentPage === 0} className="px-4 py-2 bg-gray-300 rounded">
                Previous
              </button>
              <button onClick={() => handlePageChange(1)} disabled={(currentPage + 1) * itemsPerPage >= droppedItems.length} className="px-4 py-2 bg-gray-300 rounded">
                Next
              </button>
            </div>
          </div>

          {/* DragOverlay */}
          <DragOverlay>{draggingItem ? <DraggableContainer id={draggingItem} text={draggingItem} style={{ zIndex: 9999 }} /> : null}</DragOverlay>
        </DndContext>
      </div>
    </>
  );
};

export default Simulation2;
