import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../axios/axios";
import { AppContext } from "../context/AppContext";

const websocket = "http://localhost:5174";
const socket = io.connect(websocket);

const Room = () => {
  const { roomId } = useParams();
  const [users, setUsers] = useState([]);
  const [adminName, setAdminName] = useState("");
  const [roomStatus, setRoomStatus] = useState("");
  const [deckId, setDeckId] = useState("");
  const [showPortPopup, setShowPortPopup] = useState(false);
  const [ports, setPorts] = useState({});
  const [portsSet, setPortsSet] = useState(false);
  const [shipBay, setShipBay] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [assignedPorts, setAssignedPorts] = useState({});
  const { user, token } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoomDetails();

    socket.on("user_added", (newUser) => {
      setUsers((prevUsers) => [...prevUsers, newUser]);
    });

    socket.on("user_kicked", (userId) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      if (user.id === userId) {
        navigate("/user-home");
      }
    });

    socket.on("start_simulation", (roomId) => {
      if (user.is_admin !== 1) {
        navigate(`/simulation/${roomId}`);
      }
    });

    socket.on("port_updated", ({ userId, port }) => {
      setAssignedPorts((prev) => ({
        ...prev,
        [userId]: port,
      }));
    });

    return () => {
      socket.off("user_added");
      socket.off("user_kicked");
      socket.off("start_simulation");
      socket.off("port_updated");
    };
  }, [roomId, token, user, navigate]);

  async function fetchRoomDetails() {
    try {
      const roomResponse = await api.get(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const adminId = roomResponse.data.admin_id;
      const deckId = roomResponse.data.deck_id;
      setRoomStatus(roomResponse.data.status);
      setDeckId(deckId);

      const adminResponse = await api.get(`/users/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdminName(adminResponse.data.name);

      const usersResponse = await api.get(`/rooms/${roomId}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(usersResponse.data || []);

      const originsResponse = await api.get(`/rooms/${roomId}/deck-origins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrigins(originsResponse.data);
    } catch (error) {
      console.error("There was an error fetching the room details!", error);
    }
  }

  const handleKickUser = (userId) => {
    api
      .delete(`rooms/${roomId}/kick/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        socket.emit("user_kicked", userId);
      })
      .catch((error) => {
        console.error("There was an error kicking the user!", error);
      });
  };

  const handleBack = () => {
    if (user.is_admin === 1) {
      navigate("/admin-home");
    } else {
      api
        .post(
          `rooms/${roomId}/leave`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => {
          socket.emit("user_kicked", user.id);
          navigate("/user-home");
        })
        .catch((error) => {
          console.error("There was an error leaving the room!", error);
        });
    }
  };

  async function startSimulation() {
    try {
      const res = await api.put(
        `/rooms/${roomId}`,
        {
          status: "active",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRoomStatus("active");

      const deckResponse = await api.get(`/decks/${deckId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const cards = deckResponse.data.cards;

      console.log("Cards", cards);
      console.log("Users", users);

      const dockLayout = Array.from({ length: 3 }).map(() => Array(5).fill(null));
      const dockSize = { rows: 3, columns: 5 };

      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        await api.post(
          `/ship-docks`,
          {
            arena: dockLayout,
            room_id: roomId,
            user_id: user.id,
            dock_size: dockSize,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Fetch ship bay for the current user
        const shipBayResponse = await api.get(`/ship-bays/${roomId}/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userShipBay = shipBayResponse.data;
        console.log("User Ship Bay", userShipBay);

        if (!userShipBay) continue;

        const userPort = userShipBay.port;
        const matchedCards = cards.filter((card) => card.origin === userPort);

        for (const matchedCard of matchedCards) {
          await api.post(
            `/rooms/${roomId}/create-card-temporary/${user.id}`,
            { card_id: matchedCard.id },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      }
    } catch (error) {
      console.error("There was an error starting the simulation!", error);
    }
  }

  const handleStartSimulation = () => {
    socket.emit("start_simulation", roomId);
    startSimulation();
  };

  async function endSimulation() {
    try {
      const res = await api.put(
        `/rooms/${roomId}`,
        {
          status: "finished",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      for (let i = 0; i < users.length; i++) {
        socket.emit("user_kicked", users[i].id);
      }

      socket.emit("end_simulation", roomId);

      setRoomStatus("finished");
      console.log(res);
    } catch (error) {
      console.error("There was an error ending the simulation!", error);
    }
  }

  async function handleSwapBays() {
    try {
      const res = await api.put(
        `/rooms/${roomId}/swap-bays`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      socket.emit("swap_bays", roomId);
      console.log(res);
    } catch (error) {
      console.error("There was an error swapping bays!", error);
    }
  }

  async function handleSetPorts() {
    try {
      const res = await api.put(
        `/rooms/${roomId}/set-ports`,
        { ports },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Emit port assignments for each user
      Object.entries(ports).forEach(([userId, port]) => {
        socket.emit("port_assigned", {
          roomId,
          userId,
          port,
        });
      });

      setShipBay(res.data.shipbays);
      setShowPortPopup(false);
      setPortsSet(true);
    } catch (error) {
      console.error("There was an error setting the ports!", error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 py-3 shadow-md">
        <div className="relative overflow-hidden h-10">
          <div className="absolute whitespace-nowrap animate-marquee-top text-white text-xl font-bold marquee-container italic flex items-center justify-center w-full">
            <span className="mr-4">⚓</span> WAITING ROOM <span className="ml-4">⚓</span>
          </div>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center w-full p-6">
        <div className="p-8 bg-white rounded-xl shadow-xl w-full max-w-4xl">
          {/* Room Info Section */}
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Room #{roomId}</h2>
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Admin: {adminName}</span>
              </div>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <span className="font-medium">Status: </span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                ${roomStatus === "active" ? "bg-green-100 text-green-800" : roomStatus === "finished" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
              >
                {roomStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Enhanced Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <h3 className="text-xl font-semibold p-4 bg-gray-50 border-b">Players ({users.length})</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
                  {user && user.is_admin === 1 && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users && users.length > 0 ? (
                  users.map((singleUser, index) => (
                    <tr key={singleUser.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{singleUser.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignedPorts[singleUser.id] || "Not Assigned"}</td>
                      {user && user.is_admin === 1 && (
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleKickUser(singleUser.id)}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white 
                              ${roomStatus === "active" || roomStatus === "finished" ? "bg-gray-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"}`}
                            disabled={roomStatus === "active" || roomStatus === "finished"}
                          >
                            Kick Player
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500 italic">
                      No players in the room.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Button Group */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              HOME
            </button>

            {user && user.is_admin === 1 && roomStatus !== "active" && roomStatus !== "finished" && (
              <>
                <button
                  onClick={() => setShowPortPopup(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  SET PORTS
                </button>

                <button
                  onClick={handleStartSimulation}
                  className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white 
    ${!portsSet || users.length < 1 ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"} 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors`}
                  disabled={!portsSet || users.length < 1}
                  title={!portsSet ? "Please set ports first" : users.length < 1 ? "Need at least one player" : ""}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  START SIMULATION
                </button>
              </>
            )}

            {user && user.is_admin === 1 && roomStatus === "active" && (
              <>
                <button
                  onClick={handleSwapBays}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                  </svg>
                  SWAP BAYS
                </button>

                <button
                  onClick={endSimulation}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  END SIMULATION
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Marquee */}
      <div className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 py-3 shadow-md">
        <div className="relative overflow-hidden h-10">
          <div className="absolute whitespace-nowrap animate-marquee-bottom text-white text-xl font-bold marquee-container italic flex items-center justify-center w-full">
            <span className="mr-4">⚓</span> WAITING ROOM <span className="ml-4">⚓</span>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {showPortPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Assign Ports to Players</h2>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {users.map((singleUser) => (
                <div key={singleUser.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{singleUser.name}</label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={ports[singleUser.id] || ""}
                    onChange={(e) => setPorts({ ...ports, [singleUser.id]: e.target.value })}
                  >
                    <option value="">Select a port</option>
                    {Object.values(origins).map((origin) => (
                      <option key={origin} value={origin}>
                        {origin}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setShowPortPopup(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSetPorts}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Confirm Ports
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
