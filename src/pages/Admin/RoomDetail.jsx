import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { api } from "../../axios/axios";
import { AiOutlineArrowLeft } from "react-icons/ai";
import CapacityUptakeHistory from "../../components/details/CapacityUptakeHistory";
import { AppContext } from "../../context/AppContext";
import ShipBay from "../../components/simulations/ShipBay";

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

const RoomDetail = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [simulationLogs, setSimulationLogs] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useContext(AppContext);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [userPorts, setUserPorts] = useState({});
  const [bayConfig, setBayConfig] = useState({
    bayCount: 3,
    baySize: { rows: 3, columns: 3 },
    bayTypes: ["dry", "reefer", "dry"],
  });

  // Add this new function to fetch user's port
  const fetchUserPort = async (userId) => {
    try {
      const response = await api.get(`/ship-bays/${roomId}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserPorts((prev) => ({
        ...prev,
        [userId]: response.data.port,
      }));
    } catch (error) {
      console.error("Error fetching user port:", error);
    }
  };

  // Update fetchUserLogs to use the correct endpoint
  async function fetchUserLogs(userId) {
    try {
      const response = await api.get(`/simulation-logs/${roomId}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const logs = Array.isArray(response.data) ? response.data : [];

      // Process the logs to include container data
      const processedLogs = logs.map((log) => ({
        ...log,
        arena: Array.isArray(log.arena) ? log.arena : JSON.parse(log.arena),
      }));

      console.log("User logs:", processedLogs);
      setSimulationLogs(processedLogs);
    } catch (error) {
      console.error("Error fetching user logs:", error);
      setSimulationLogs([]);
    }
  }

  const formatIDR = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  useEffect(() => {
    fetchRoomData();
  }, [roomId]);

  async function fetchRoomData() {
    try {
      const [roomResponse, leaderboardResponse, usersResponse] = await Promise.all([
        api.get(`/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/rooms/${roomId}/rankings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`/rooms/${roomId}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const roomData = roomResponse.data;
      setRoom(roomData);

      // Set bay configuration from room data
      setBayConfig({
        bayCount: roomData.bay_count,
        baySize: JSON.parse(roomData.bay_size),
        bayTypes: JSON.parse(roomData.bay_types),
      });

      // Don't fetch simulation logs here - they'll be fetched when user selects a player
      setLeaderboard(leaderboardResponse.data);
      setUsers(usersResponse.data);

      await Promise.all(usersResponse.data.map((user) => fetchUserPort(user.id)));
    } catch (error) {
      console.error("Error fetching room data:", error);
      setSimulationLogs([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between bg-white rounded-xl shadow-lg p-6 mb-6">
          <button onClick={() => navigate("/admin-home")} className="p-2 rounded-full hover:bg-gray-100">
            <AiOutlineArrowLeft size={24} />
          </button>
          {room && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Room ID</p>
                <p className="font-semibold">{room.id}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold">{room.status}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-semibold">{new Date(room.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <TabGroup>
          <TabList className="flex space-x-2 rounded-xl bg-blue-900/20 p-1 mb-6">
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
              Simulation Logs
            </Tab>
            {/* <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
              }
            >
              Player Stats
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
              }
            >
              Cards Used
            </Tab> */}
          </TabList>

          <TabPanels>
            <TabPanel>
              <CapacityUptakeHistory roomId={roomId} token={token} />
            </TabPanel>

            {/* Simulation History Panel */}
            <TabPanel>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Ship Bay History</h2>

                {/* Filter Controls */}
                <div className="flex gap-4 mb-6">
                  <select
                    className="form-select rounded-lg border-gray-300"
                    value={selectedUserId || ""}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value);
                      fetchUserLogs(e.target.value);
                    }}
                  >
                    <option value="">Select Player</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({userPorts[user.id] || "Loading..."})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Timeline View */}
                <div className="space-y-8">
                  {Array.isArray(simulationLogs) &&
                    simulationLogs.map((log, index) => (
                      <div key={log.id} className="border-l-4 border-blue-500 pl-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Snapshot {index + 1}</h3>
                        <div className="grid grid-cols-1 gap-6">
                          <ShipBay
                            bayCount={bayConfig.bayCount}
                            baySize={bayConfig.baySize}
                            bayTypes={bayConfig.bayTypes}
                            droppedItems={log.arena.flatMap((bay, bayIndex) =>
                              bay.flatMap((row, rowIndex) =>
                                row
                                  .map((cell, colIndex) => {
                                    if (cell) {
                                      // cell berisi container ID jika ada container
                                      return {
                                        id: `container-${bayIndex}-${rowIndex}-${colIndex}`,
                                        area: `bay-${bayIndex}-${rowIndex * bayConfig.baySize.columns + colIndex}`,
                                        color: PORT_COLORS[cell.destination?.substring(0, 3)] || "#6B7280",
                                        type: cell.type || "dry",
                                      };
                                    }
                                    return null;
                                  })
                                  .filter(Boolean)
                              )
                            )}
                            isHistoryView={true}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-sm text-gray-600">{new Date(log.created_at).toLocaleString()}</div>
                            <div className="text-sm font-medium text-green-600">Revenue: {formatIDR(log.revenue)}</div>
                          </div>
                        </div>
                      </div>
                    ))}

                  {(!Array.isArray(simulationLogs) || simulationLogs.length === 0) && selectedUserId && <div className="text-center text-gray-500 py-8">No simulation logs found for this player</div>}

                  {!selectedUserId && <div className="text-center text-gray-500 py-8">Select a player to view their simulation logs</div>}
                </div>
              </div>
            </TabPanel>

            {/* Player Stats Panel */}
            {/* <TabPanel>
              <PlayerStats
                players={[
                  {
                    id: 1,
                    name: "John Doe",
                    port: "MDN",
                    rank: 1,
                    revenue: 150000000,
                    revenue_growth: 15,
                    penalties: 24000000,
                    total_penalties: 3,
                    total_cards: 20,
                    cards_accepted: 15,
                    cards_rejected: 5,
                    total_containers: 45,
                    containers_rolled: 3,
                    weekly_revenue: [50000000, 80000000, 120000000, 150000000],
                    weekly_penalties: [8000000, 8000000, 8000000, 0],
                  },
                ]}
                formatIDR={formatIDR}
              />
            </TabPanel> */}

            {/* Cards Used Panel */}
            {/* <TabPanel>
              <CardsUsed
                // cards={[]} // Add your cards data here
                cards={[
                  {
                    id: 1,
                    timestamp: "2024-03-20T10:00:00",
                    port: "JYP",
                    destination: "SBY",
                    revenue: 11000000,
                    containers: 10,
                    reefer: 3,
                    dry: 7,
                  },
                  {
                    id: 2,
                    timestamp: "2024-03-20T10:05:00",
                    port: "MKS",
                    destination: "MDN",
                    revenue: 24000000,
                    containers: 15,
                    reefer: 5,
                    dry: 10,
                  },
                ]}
                formatIDR={formatIDR}
              />
            </TabPanel> */}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
};

export default RoomDetail;
