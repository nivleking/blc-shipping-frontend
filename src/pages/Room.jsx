import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, socket } from "../axios/axios";
import { AppContext } from "../context/AppContext";
import AssignPortModal from "../components/rooms/AssignPortModal";
import SwapConfigModal from "../components/rooms/SwapConfigModal";
import useToast from "../toast/useToast";
import ConfirmationModal from "../components/ConfirmationModal";
import LoadingOverlay from "../components/LoadingOverlay";
import { PORT_COLORS, getPortColor } from "../assets/Colors";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
};

const Room = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
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
  const [showRankings, setShowRankings] = useState(false);
  const [rankings, setRankings] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(1);
  const [showStartConfirmation, setShowStartConfirmation] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [missingUsersCount, setMissingUsersCount] = useState(0);
  const [room, setRoom] = useState({});

  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapConfig, setSwapConfig] = useState({});
  const [showSwapConfirmation, setShowSwapConfirmation] = useState(false);
  const [showSwapConfigModal, setShowSwapConfigModal] = useState(false);
  const [deckOrigins, setDeckOrigins] = useState([]);
  const [currentSwapConfig, setCurrentSwapConfig] = useState(null);
  const [showKickConfirmation, setShowKickConfirmation] = useState(false);
  const [userToKick, setUserToKick] = useState(null);

  const [isAssigningPorts, setIsAssigningPorts] = useState(false);
  const [portAssignmentMessageIndex, setPortAssignmentMessageIndex] = useState(0);
  const portAssignmentMessages = ["Assigning ports to participants..."];
  const [isStartingSimulation, setIsStartingSimulation] = useState(false);
  const [simulationStartMessageIndex, setSimulationStartMessageIndex] = useState(0);
  const simulationStartMessages = ["Starting simulation..."];

  const [isSwappingBays, setIsSwappingBays] = useState(false);
  const [baySwapMessageIndex, setBaySwapMessageIndex] = useState(0);
  const baySwapMessages = ["Swapping bay configurations..."];

  useEffect(() => {
    let interval;
    if (isAssigningPorts) {
      interval = setInterval(() => {
        setPortAssignmentMessageIndex((prev) => (prev + 1) % portAssignmentMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAssigningPorts, portAssignmentMessages.length]);

  useEffect(() => {
    let interval;
    if (isStartingSimulation) {
      interval = setInterval(() => {
        setSimulationStartMessageIndex((prev) => (prev + 1) % simulationStartMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isStartingSimulation, simulationStartMessages.length]);

  useEffect(() => {
    let interval;
    if (isSwappingBays) {
      interval = setInterval(() => {
        setBaySwapMessageIndex((prev) => (prev + 1) % baySwapMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSwappingBays, baySwapMessages.length]);

  useEffect(() => {
    socket.on("user_added", ({ roomId: receivedRoomId, newUser }) => {
      if (receivedRoomId === roomId) {
        setUsers((prevUsers) => {
          const userExists = prevUsers.some((existingUser) => existingUser.id === newUser.id);
          return userExists ? prevUsers : [...prevUsers, newUser];
        });
      }
    });

    socket.on("user_kicked", ({ roomId: receivedRoomId, userId }) => {
      if (receivedRoomId === roomId) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        if (user.id === userId) {
          navigate("/user-home");
        }
      }
    });

    socket.on("start_simulation", ({ roomId: receivedRoomId }) => {
      if (receivedRoomId === roomId && user.is_admin === false) {
        navigate(`/simulation/${roomId}`);
      }
    });

    socket.on("port_updated", ({ roomId: receivedRoomId, userId, port }) => {
      if (receivedRoomId === roomId) {
        setAssignedPorts((prev) => ({
          ...prev,
          [userId]: port,
        }));
      }
    });

    socket.on("rankings_updated", ({ roomId: updatedRoomId, rankings }) => {
      if (roomId === updatedRoomId) {
        // if (rankings) {
        //   setRankings(rankings);
        // } else {
        // }
        fetchRankings();
      }
    });

    return () => {
      socket.off("user_added");
      socket.off("user_kicked");
      socket.off("start_simulation");
      socket.off("port_updated");
      socket.off("rankings_updated");
    };
  }, [user, token, navigate, roomStatus]);

  useEffect(() => {
    if (token && roomId) {
      fetchRoomDetails();
    }
  }, [user, roomId, token]);

  async function fetchRoomDetails() {
    try {
      const response = await api.get(`/rooms/${roomId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;

      // Set room data
      setRoom(data.room);
      setRoomStatus(data.room.status);
      setTotalRounds(data.room.total_rounds);
      setDeckId(data.room.deck_id);

      // Set admin info
      setAdminName(data.admin.name);

      // Set users
      setUsers(data.users || []);

      // Set origins
      setOrigins(data.deckOrigins);

      // Set port assignments
      setAssignedPorts(data.portAssignments);
      setPortsSet(data.portsSet);

      // Store deck origins for swap config
      setDeckOrigins(data.deckOrigins);

      // Set current round
      setCurrentRound(data.currentRound);

      // Set swap config if it exists
      if (data.swapConfig) {
        setCurrentSwapConfig(JSON.parse(data.swapConfig));
        setSwapConfig(JSON.parse(data.swapConfig));
      }
    } catch (error) {
      console.error("There was an error fetching the room details!", error);
      showError("Failed to load room data");
    }
  }

  const handleKickUserClick = (userId) => {
    setUserToKick(userId);
    setShowKickConfirmation(true);
  };

  const confirmKickUser = () => {
    if (!userToKick) return;

    api
      .delete(`rooms/${roomId}/kick/${userToKick}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        socket.emit("user_kicked", { roomId, userId: userToKick });
        setShowKickConfirmation(false);
        setUserToKick(null);
        showSuccess("User kicked successfully");
      })
      .catch((error) => {
        console.error("There was an error kicking the user!", error);
        showError("Failed to kick user");
        setShowKickConfirmation(false);
        setUserToKick(null);
      });
  };

  const handleBack = () => {
    if (user.is_admin === true) {
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
          socket.emit("user_kicked", { roomId, userId: user.id });
          navigate("/user-home");
        })
        .catch((error) => {
          console.error("There was an error leaving the room!", error);
        });
    }
  };

  async function startSimulation() {
    try {
      if (user && user.is_admin) {
        setIsStartingSimulation(true);
        setSimulationStartMessageIndex(0);
      }

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

      showSuccess("Simulation started");
      setRoomStatus("active");
      socket.emit("start_simulation", { roomId });
    } catch (error) {
      console.error("There was an error starting the simulation!", error);
      showError("Failed to start simulation. Please try again.");
      if (user && user.is_admin) {
        setIsStartingSimulation(false);
      }
    } finally {
      setIsStartingSimulation(false);
    }
  }

  const handleStartClick = () => {
    if (users.length < 2) {
      showError("You need at least two users to start the simulation");
      return;
    }

    if (!portsSet) {
      showError("Please assign ports to users first");
      return;
    }

    const assignedUsers = typeof room.assigned_users === "string" ? JSON.parse(room.assigned_users || "[]") : room.assigned_users || [];

    const currentUsers = users.map((user) => user.id);
    const missing = Array.isArray(assignedUsers) ? assignedUsers.filter((id) => !currentUsers.includes(id)).length : 0;

    setMissingUsersCount(missing);
    setShowStartConfirmation(true);
  };

  async function endSimulation() {
    if (currentRound <= totalRounds) {
      // showError(`Simulation can only be ended after the final discharging phase (Week ${totalRounds + 1})`);
      showError(`Simulation can only be ended at week ${totalRounds}`);
      return;
    }

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
        socket.emit("user_kicked", { roomId, userId: users[i].id });
      }

      socket.emit("end_simulation", { roomId });

      setRoomStatus("finished");
      showSuccess("Simulation has been successfully completed!");
    } catch (error) {
      console.error("There was an error ending the simulation!", error);
      showError("Failed to end simulation. Please try again.");
    }
  }

  const handleSwapConfigSave = async (newSwapConfig) => {
    if (currentRound > totalRounds) {
      showError("Cannot modify swap configuration during final discharging phase");
      return;
    }

    setSwapConfig(newSwapConfig);
    setShowSwapConfigModal(false);

    try {
      await api.put(
        `/rooms/${roomId}/swap-config`,
        {
          swap_config: newSwapConfig,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCurrentSwapConfig(newSwapConfig);

      socket.emit("port_config_updated", { roomId });

      showSuccess("Port swap configuration saved successfully!");
    } catch (error) {
      console.error("Error saving swap configuration:", error);
      showError("Failed to save port swap configuration");
    }
  };

  const handleSwapBays = async () => {
    // if (currentRound > totalRounds) {
    //   showError("Bay swapping is disabled during final discharging phase");
    //   return;
    // }

    if (!currentSwapConfig || Object.keys(currentSwapConfig).length === 0) {
      setShowSwapConfigModal(true);
      return;
    }

    setShowSwapConfirmation(true);
  };

  const executeSwap = async () => {
    setShowSwapConfirmation(false);
    if (user && user.is_admin) {
      setIsSwappingBays(true);
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      setBaySwapMessageIndex(0);
    }

    try {
      await api.put(
        `/rooms/${roomId}/swap-bays`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userPortsResponse = await api.get(`/rooms/${roomId}/user-port2`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newPortAssignments = {};
      userPortsResponse.data.forEach((shipBay) => {
        newPortAssignments[shipBay.user_id] = shipBay.port;
      });

      socket.emit("swap_bays", { roomId });

      setCurrentRound((prev) => prev + 1);

      showSuccess("Bays swapped successfully!");
      fetchRankings();
    } catch (error) {
      console.error("Error swapping bays:", error);
      showError("Failed to swap bays");
    } finally {
      setIsSwappingBays(false);
    }
  };

  // Helper function to get later ports based on swap configuration
  const getLaterPorts = (currentPort, swapConfig) => {
    const laterPorts = [];
    let nextPort = currentPort;

    // Follow the swap chain to get next 2 ports
    for (let i = 0; i < 2; i++) {
      if (swapConfig[nextPort]) {
        nextPort = swapConfig[nextPort];
        laterPorts.push(nextPort);
      }
    }

    return laterPorts;
  };

  async function handleSetPorts() {
    try {
      if (user && user.is_admin) {
        setIsAssigningPorts(true);
        setPortAssignmentMessageIndex(0);
      }

      const res = await api.put(
        `/rooms/${roomId}/set-ports`,
        { ports },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Notify other users about port assignments
      for (const [userId, port] of Object.entries(ports)) {
        socket.emit("port_assigned", {
          roomId,
          userId,
          port,
        });
      }

      setShipBay(res.data.shipbays);
      setShowPortPopup(false);
      setPortsSet(true);
      showSuccess("Ports assigned successfully!");
    } catch (error) {
      console.error("There was an error setting the ports!", error);
      showError("Failed to assign ports: " + (error.response?.data?.message || error.message));
    } finally {
      setIsAssigningPorts(false);
    }
  }

  const fetchRankings = async () => {
    try {
      const response = await api.get(`/rooms/${roomId}/rankings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRankings(response.data);

      return response.data;
    } catch (error) {
      console.error("Error fetching rankings:", error);
      return [];
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-blue-500 py-3 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-start text-white">
            <h1 className="text-lg font-bold tracking-wide">{user && user.name}</h1>
          </div>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center w-full p-4">
        <div className="p-8 bg-white rounded-xl shadow-xl w-full max-w-4xl">
          {/* Room Info Section */}
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Room #{roomId}</h2>
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Admin: {adminName}</span>
              </div>
            </div>
            <div className="bg-gray-100 px-2 py-2 rounded-lg">
              <span className="font-medium">Status: </span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                ${roomStatus === "active" ? "bg-green-100 text-green-800" : roomStatus === "finished" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
              >
                {roomStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {roomStatus === "active" && (
            <div className="mb-2 p-2 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-700">
                Week {currentRound} of {totalRounds}
              </h3>
            </div>
          )}

          {/* Enhanced Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
              <h3 className="text-sm font-semibold">{showRankings ? "Leaderboard" : `Users (${users.length})`}</h3>
              {roomStatus === "active" && (
                <button
                  onClick={() => {
                    if (!showRankings) {
                      fetchRankings();
                    }
                    setShowRankings(!showRankings);
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600"
                >
                  {showRankings ? "Show Users" : "Show Rankings"}
                </button>
              )}
            </div>

            {/* Add horizontal scroll container */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      {showRankings ? "Rank" : "#"}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      User
                    </th>
                    {showRankings && (
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                        Total Revenue
                      </th>
                    )}
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                      {showRankings ? "Revenue" : "Port"}
                    </th>
                    {showRankings && (
                      <>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-30">
                          Total Penalty
                        </th>
                        {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-30">
                          Move Cost
                        </th> */}
                        {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-30">
                          Extra Moves
                        </th> */}
                        {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-30">
                          Dock Warehouse Cost
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-30">
                          Restowage Cost
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                          Moves
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                          Cards
                        </th> */}
                      </>
                    )}
                    {!showRankings && user && user.is_admin === true && (
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {showRankings ? (
                    rankings.length > 0 ? (
                      rankings.map((rank, index) => (
                        <tr key={`rank-${rank.user_id}-${index}`} className={`${index === 0 ? "bg-yellow-50" : ""} hover:bg-gray-50`}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-sm font-semibold rounded-full ${index === 0 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>#{index + 1}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{rank.user_name}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-green-600 font-medium">{formatIDR(rank.total_revenue)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-green-600">{formatIDR(rank.revenue)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-red-600">{formatIDR(rank.penalty)}</div>
                          </td>
                          {/* <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-red-600">TODO</div>
                          </td> */}
                          {/* <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-red-600">{formatIDR(rank.extra_moves_penalty)}</div>
                          </td> */}
                          {/* <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-red-600">{formatIDR(rank.dock_warehouse_penalty)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-red-600">{formatIDR(rank.restowage_penalty)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col text-sm text-gray-500">
                              <span>D: {rank.discharge_moves}</span>
                              <span>L: {rank.load_moves}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col text-sm">
                              <span className="text-green-600">A: {rank.accepted_cards}</span>
                              <span className="text-red-600">R: {rank.rejected_cards}</span>
                            </div>
                          </td> */}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-4 py-3 text-center text-gray-500 italic">
                          No rankings available yet.
                        </td>
                      </tr>
                    )
                  ) : users && users.length > 0 ? (
                    users.map((singleUser, index) => (
                      <tr key={`user-${singleUser.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{singleUser.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{assignedPorts[singleUser.id] || "Not Assigned"}</td>
                        {user && user.is_admin === true && (
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleKickUserClick(singleUser.id)}
                              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white 
                              ${roomStatus === "active" || roomStatus === "finished" ? "bg-gray-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"}`}
                              disabled={roomStatus === "active" || roomStatus === "finished"}
                            >
                              Kick User
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-center text-gray-500 italic">
                        No users in the room.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Button Group */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={handleBack}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              HOME
            </button>

            {roomStatus === "active" && !user?.is_admin && (
              <button
                onClick={() => {
                  navigate(`/simulation/${roomId}`);
                }}
                className="inline-flex items-center justify-center px-4 py-3 border-2 border-green-500 text-xs font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                REJOIN
              </button>
            )}
            {user && user.is_admin === true && roomStatus !== "active" && roomStatus !== "finished" && (
              <>
                <button
                  onClick={() => setShowPortPopup(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  ASSIGN PORTS
                </button>
                <button
                  onClick={handleStartClick}
                  className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-medium rounded-lg text-white 
    ${!portsSet || users.length < 2 ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"} 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors`}
                  disabled={!portsSet || users.length < 2}
                  title={!portsSet ? "Please set ports first" : users.length < 2 ? "Need at least one user" : ""}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  START SIMULATION
                </button>
              </>
            )}

            {user?.is_admin && roomStatus === "active" && (
              <>
                {/* Configure Port Swap Button */}
                <button
                  onClick={() => setShowSwapConfigModal(true)}
                  // disabled={currentRound > totalRounds}
                  className={`text-xs flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 
    ${currentRound > totalRounds ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400" : "bg-yellow-400 border-2 border-yellow-500 text-white hover:bg-yellow-500"} 
    shadow-sm`}
                  title={currentRound > totalRounds ? "Swap configuration disabled in final discharging phase" : "Edit swap configuration"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  EDIT SWAP
                </button>

                {/* Swap Bays Button */}
                <button
                  onClick={handleSwapBays}
                  disabled={currentRound > totalRounds}
                  className={`text-xs flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 
    ${currentRound > totalRounds ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"} 
    shadow-md`}
                  title={currentRound > totalRounds ? "Bay swapping disabled in final discharging phase" : "Swap bays"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                  </svg>
                  SWAP
                  {currentRound > totalRounds && <span className="text-xs ml-1">(Final Phase)</span>}
                </button>

                {/* End Simulation Button */}
                <button
                  onClick={() => {
                    if (currentRound > totalRounds) {
                      setShowEndConfirmation(true); // Show confirmation instead of ending directly
                    } else {
                      showError(`Simulation can only be ended at week ${totalRounds + 1}`);
                    }
                  }}
                  disabled={currentRound < totalRounds}
                  className={`text-xs flex items-center justify-center gap-2 px-4 py-3 rounded-lg shadow-md transition-all duration-200 ${
                    currentRound > totalRounds ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  title={currentRound > totalRounds ? `Can only end simulation after the final discharging phase (Week ${totalRounds + 1})` : "End simulation"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                  END
                  {currentRound <= totalRounds && (
                    <span className="text-xs ml-1">
                      (Week {currentRound}/{totalRounds})
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Port Swap Configuration Modal */}
            <SwapConfigModal isOpen={showSwapConfigModal} onClose={() => setShowSwapConfigModal(false)} deckOrigins={deckOrigins} initialConfig={currentSwapConfig} onSave={handleSwapConfigSave} />

            {user && user.is_admin === true && roomStatus === "finished" && (
              <button
                onClick={() => navigate(`/rooms/${roomId}/detail`)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                ROOM DETAIL
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Marquee */}
      <div className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 py-3 shadow-md">
        <div className="relative overflow-hidden h-10">
          <div className="absolute whitespace-nowrap animate-marquee-bottom text-white text-lg font-bold marquee-container italic flex items-center justify-center w-full">
            <span className="mr-4">⚓</span> WAITING ROOM <span className="ml-4">⚓</span>
          </div>
        </div>
      </div>

      {/* Assign Port Modal */}
      {showPortPopup && <AssignPortModal users={users} origins={origins} ports={ports} setPorts={setPorts} onClose={() => setShowPortPopup(false)} onConfirm={handleSetPorts} />}

      {showSwapConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-3xl">
            <h3 className="text-1xl font-bold mb-4">Confirm Bay Swap</h3>
            <p className="mb-2 text-sm text-red-500">Are you sure you want to swap bays and advance to week {currentRound + 1}? This action cannot be undone.</p>

            {Object.keys(swapConfig).length > 0 && (
              <div className="mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-3 bg-blue-500 text-white">
                  <h4 className="font-semibold text-center text-sm">Week {currentRound + 1} Port Swapping</h4>
                </div>

                <div className="p-2 max-h-[500px] overflow-y-auto pr-1">
                  <div className="grid gap-3">
                    {Object.entries(swapConfig).map(([from, to], index) => {
                      // Get port colors or use default colors
                      const fromColor = PORT_COLORS[from] || "#64748B"; // Default gray
                      const toColor = PORT_COLORS[to] || "#64748B"; // Default gray

                      return (
                        <div key={from} className="flex items-center border rounded-md p-3 hover:bg-gray-50">
                          {/* From Port (Origin) */}
                          <div className="flex items-center w-24">
                            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm mr-2" style={{ backgroundColor: fromColor }}>
                              {from.substring(0, 1).toUpperCase()}
                            </span>
                            <span className="font-medium text-sm">{from}</span>
                          </div>

                          {/* Arrow indicating "sends to" */}
                          <div className="flex-1 flex justify-center px-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <span>sends to</span>
                              <svg className="w-4 h-4 ml-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14m-7-7l7 7-7 7" />
                              </svg>
                            </div>
                          </div>

                          {/* To Port (Destination) */}
                          <div className="flex items-center w-24">
                            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm mr-2" style={{ backgroundColor: toColor }}>
                              {to.substring(0, 1).toUpperCase()}
                            </span>
                            <span className="font-medium text-sm">{to}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 text-sm">
              <button onClick={() => setShowSwapConfirmation(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={executeSwap} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Confirm Swap
              </button>
            </div>
          </div>
        </div>
      )}

      {showStartConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Start Simulation</h3>

            {missingUsersCount > 0 ? (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-yellow-700">
                    <span className="font-medium">Warning:</span> {missingUsersCount} assigned user{missingUsersCount > 1 ? "s" : ""} have not joined this room yet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-700">All assigned users have joined this room.</p>
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-6">Are you sure you want to start the simulation?</p>

            <div className="flex justify-end space-x-2 text-sm">
              <button onClick={() => setShowStartConfirmation(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowStartConfirmation(false);
                  startSimulation();
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Start Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">End Simulation</h3>

            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-red-700">
                  <span className="font-medium">Warning:</span> This action will permanently end the simulation for all participants. This cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">Are you sure you want to end this simulation?</p>

            <div className="flex justify-end space-x-2 text-sm">
              <button onClick={() => setShowEndConfirmation(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEndConfirmation(false);
                  endSimulation();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                End Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {isAssigningPorts && user && user.is_admin && <LoadingOverlay messages={portAssignmentMessages} currentMessageIndex={portAssignmentMessageIndex} title="Setting Up Ports" />}

      {isStartingSimulation && user && user.is_admin && <LoadingOverlay messages={simulationStartMessages} currentMessageIndex={simulationStartMessageIndex} title="Starting Simulation" />}

      {isSwappingBays && user && user.is_admin && <LoadingOverlay messages={baySwapMessages} currentMessageIndex={baySwapMessageIndex} title="Swapping Bays" />}

      <ConfirmationModal
        isOpen={showKickConfirmation}
        onClose={() => setShowKickConfirmation(false)}
        onConfirm={confirmKickUser}
        title="Confirm User Removal"
        message={`Are you sure you want to remove this user from the room? They will need to rejoin to participate again.`}
      />
    </div>
  );
};

export default Room;
