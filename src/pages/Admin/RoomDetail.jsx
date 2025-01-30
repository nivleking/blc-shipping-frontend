import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { api } from "../../axios/axios";
import { AiOutlineArrowLeft } from "react-icons/ai";
import ShipBayVisualization from "../../components/details/ShipBayVisualization";
import PlayerStats from "../../components/details/PlayerStats";
import CardsUsed from "../../components/details/CardsUsed";

const RoomDetail = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [simulationLogs, setSimulationLogs] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
      const [roomResponse, logsResponse, leaderboardResponse] = await Promise.all([api.get(`/rooms/${roomId}`), api.get(`/simulation-logs/${roomId}`), api.get(`/rooms/${roomId}/rankings`)]);

      setRoom(roomResponse.data);
      setSimulationLogs(logsResponse.data);
      setLeaderboard(leaderboardResponse.data);
    } catch (error) {
      console.error("Error fetching room data:", error);
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
          <h1 className="text-2xl font-bold text-gray-800">Room Details - {roomId}</h1>
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
              Overview
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
              }
            >
              Simulation Logs
            </Tab>
            <Tab
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
            </Tab>
          </TabList>

          <TabPanels>
            {/* Overview Panel */}
            <TabPanel>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leaderboard */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Port</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* {leaderboard.map((player, index) => (
                          <tr key={player.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIDR(player.revenue)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.port}</td>
                          </tr>
                        ))} */}
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#1</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">John Doe</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIDR(150000000)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">MDN</td>
                        </tr>

                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#2</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jane Smith</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIDR(120000000)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">MKS</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* General Stats */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">General Statistics</h2>
                  {/* General Stats */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">General Statistics</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Player Stats */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-700 mb-2">Players</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-2xl font-bold text-blue-800">{leaderboard.length}</p>
                            <p className="text-xs text-blue-600">Total Players</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-blue-800">{formatIDR(leaderboard.reduce((acc, player) => acc + player.revenue, 0) / leaderboard.length)}</p>
                            <p className="text-xs text-blue-600">Avg Revenue/Player</p>
                          </div>
                        </div>
                      </div>

                      {/* Sales Cards Stats */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-green-700 mb-2">Sales Call Cards</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-2xl font-bold text-green-800">{room?.total_cards || 0}</p>
                            <p className="text-xs text-green-600">Total Cards</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-800">
                              {room?.cards_accepted || 0}/{room?.cards_rejected || 0}
                            </p>
                            <p className="text-xs text-green-600">Accepted/Rejected</p>
                          </div>
                        </div>
                      </div>

                      {/* Revenue Stats */}
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-yellow-700 mb-2">Revenue</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-2xl font-bold text-yellow-800">{formatIDR(leaderboard.reduce((acc, player) => acc + player.revenue, 0))}</p>
                            <p className="text-xs text-yellow-600">Total Revenue</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-yellow-800">{formatIDR(room?.total_penalties || 0)}</p>
                            <p className="text-xs text-yellow-600">Total Penalties</p>
                          </div>
                        </div>
                      </div>

                      {/* Port Activity */}
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-purple-700 mb-2">Port Activity</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-2xl font-bold text-purple-800">{room?.most_active_port || "N/A"}</p>
                            <p className="text-xs text-purple-600">Most Active Port</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-purple-800">{room?.total_containers || 0}</p>
                            <p className="text-xs text-purple-600">Total Containers</p>
                          </div>
                        </div>
                      </div>

                      {/* Time Stats */}
                      <div className="bg-red-50 rounded-lg p-4 col-span-2">
                        <h3 className="text-sm font-medium text-red-700 mb-2">Time Statistics</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-2xl font-bold text-red-800">{room?.current_week || 1}</p>
                            <p className="text-xs text-red-600">Current Week</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-red-800">{room?.total_weeks || 4}</p>
                            <p className="text-xs text-red-600">Total Weeks</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-red-800">{new Date(room?.created_at).toLocaleDateString()}</p>
                            <p className="text-xs text-red-600">Start Date</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* Simulation History Panel */}
            <TabPanel>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Ship Bay History</h2>

                {/* Filter Controls */}
                <div className="flex gap-4 mb-6">
                  <select className="form-select rounded-lg border-gray-300">
                    <option>John Doe</option>
                    <option>Jane</option>
                    {/* Add user options */}
                  </select>
                  <select className="form-select rounded-lg border-gray-300">
                    <option>All Weeks</option>
                    <option>Week 1</option>
                    <option>Week 2</option>
                  </select>
                </div>

                {/* Timeline View */}
                <div className="space-y-8">
                  {/* Example history entries */}
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Week 1</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ShipBayVisualization
                        bayData={[
                          [null, "JYP", null],
                          ["SBY", "JYP", null],
                          ["MKS", "MDN", "SBY"],
                        ]}
                        userName="John Doe"
                        timestamp="2024-03-20T10:00:00"
                        revenue="Rp 150,000,000"
                      />

                      <ShipBayVisualization
                        bayData={[
                          [null, null, null],
                          ["MKS", "JYP", null],
                          ["MKS", "MDN", "SBY"],
                        ]}
                        userName="Jane Smith"
                        timestamp="2024-03-20T10:05:00"
                        revenue="Rp 120,000,000"
                      />
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Week 2</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ShipBayVisualization
                        bayData={[
                          ["JYP", "JYP", null],
                          ["SBY", "JYP", "MDN"],
                          ["MKS", "MDN", "SBY"],
                        ]}
                        userName="John Doe"
                        timestamp="2024-03-27T10:00:00"
                        revenue="Rp 180,000,000"
                      />

                      <ShipBayVisualization
                        bayData={[
                          ["MKS", null, null],
                          ["MKS", "JYP", "SBY"],
                          ["MKS", "MDN", "SBY"],
                        ]}
                        userName="Jane Smith"
                        timestamp="2024-03-27T10:15:00"
                        revenue="Rp 165,000,000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>

            {/* Player Stats Panel */}
            <TabPanel>
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
            </TabPanel>

            {/* Cards Used Panel */}
            <TabPanel>
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
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
};

export default RoomDetail;
