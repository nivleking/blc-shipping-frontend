import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { api } from "../../../axios/axios";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { AppContext } from "../../../context/AppContext";
import { PORT_COLORS, getPortColor } from "../../../assets/Colors";
import LeaderboardPanel from "./LeaderboardPanel";
import MarketIntelligencePanel from "./MarketIntelligencePanel";
import CapacityUptakePanel from "./CapacityUptakePanel";
import WeeklyPerformancePanel from "./WeeklyPerformancePanel";
import StowageLogPanel from "./StowageLogPanel";
import { useQuery } from "@tanstack/react-query";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AppContext);
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add container query here
  const containersQuery = useQuery({
    queryKey: ["roomContainers", roomId],
    queryFn: async () => {
      const response = await api.get(`/rooms/${roomId}/containers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // Returns array of containers
    },
    enabled: !!roomId && !!token,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoom(response.data);
      } catch (error) {
        console.error("Error fetching room details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId && token) {
      fetchRoomDetails();
    }
  }, [roomId, token]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center">
            <button onClick={() => navigate("/admin-home")} className="p-2 rounded-full hover:bg-gray-100">
              <AiOutlineArrowLeft size={20} />
            </button>
            {isLoading ? (
              <div className="ml-4 animate-pulse h-6 w-40 bg-gray-200 rounded"></div>
            ) : (
              <div className="ml-4">
                <h1 className="text-lg font-bold">{room?.name || "Room Detail"}</h1>
                <p className="text-sm text-gray-500">{room?.description || ""}</p>
              </div>
            )}
          </div>
          {!isLoading && room && <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-medium text-blue-700">{room.status === "finished" ? "SIMULATION COMPLETED!" : room.status.toUpperCase()}</div>}
        </div>

        {/* Main Content */}
        <TabGroup>
          <TabList className="flex space-x-2 rounded-xl bg-blue-900/20 p-1 mb-4">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-xs font-medium leading-5 
              ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
              }
            >
              Leaderboard
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-xs font-medium leading-5 
              ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
              }
            >
              Capacity Uptake
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-xs font-medium leading-5 
              ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
              }
            >
              Stowage
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-xs font-medium leading-5 
              ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
              }
            >
              Weekly Performance
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-xs font-medium leading-5 
              ${selected ? "bg-white shadow text-blue-700" : "text-blue-500 hover:bg-white/[0.12] hover:text-blue-600"}`
              }
            >
              Market Intelligence
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {isLoading ? (
                <div className="w-full flex justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <LeaderboardPanel roomId={roomId} />
              )}
            </TabPanel>

            <TabPanel>
              {isLoading ? (
                <div className="w-full flex justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <CapacityUptakePanel roomId={roomId} totalRounds={room.total_rounds} containers={containersQuery.data} isAdminView={true} />
              )}
            </TabPanel>

            <TabPanel>
              {isLoading ? (
                <div className="w-full flex justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <StowageLogPanel roomId={roomId} totalRounds={room?.total_rounds} bayTypes={room?.bay_types} containers={containersQuery.data} isAdminView={true} />
              )}
            </TabPanel>
            <TabPanel>
              {isLoading ? (
                <div className="w-full flex justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <WeeklyPerformancePanel totalRounds={room.total_rounds} roomId={roomId} isAdminView={true} />
              )}
            </TabPanel>

            <TabPanel>
              <MarketIntelligencePanel roomId={roomId} />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
};

export default RoomDetail;
