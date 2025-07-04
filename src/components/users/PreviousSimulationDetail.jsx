import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { api } from "../../axios/axios";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { AppContext } from "../../context/AppContext";
import { useQuery } from "@tanstack/react-query";
import LeaderboardPanel from "../simulations/simulation_details/LeaderboardPanel";
import CapacityUptakePanel from "../simulations/simulation_details/CapacityUptakePanel";
import StowageLogPanel from "../simulations/simulation_details/StowageLogPanel";
import WeeklyPerformancePanel from "../simulations/simulation_details/WeeklyPerformancePanel";
import DescriptionPanel from "../simulations/simulation_details/DescriptionPanel";
import MarketIntelligencePanel from "../simulations/simulation_details/MarketIntelligencePanel";
import LoadingSpinner from "../simulations/LoadingSpinner";

const PreviousSimulationDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AppContext);
  const [room, setRoom] = useState(null);

  // Fetch room details
  const { data: roomData, isLoading: isLoadingRoom } = useQuery({
    queryKey: ["roomDetail", roomId],
    queryFn: async () => {
      const response = await api.get(`/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!roomId && !!token,
  });

  // Fetch containers for the room
  const { data: containersData, isLoading: isLoadingContainers } = useQuery({
    queryKey: ["roomContainers", roomId],
    queryFn: async () => {
      const response = await api.get(`/rooms/${roomId}/containers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!roomId && !!token,
  });

  useEffect(() => {
    if (roomData) {
      setRoom(roomData);
    }
  }, [roomData]);

  const isLoading = isLoadingRoom || isLoadingContainers;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center">
            <button onClick={() => navigate("/previous-simulations")} className="p-2 rounded-full hover:bg-gray-100">
              <AiOutlineArrowLeft size={20} />
            </button>
            {isLoading ? (
              <div className="ml-4 animate-pulse h-6 w-40 bg-gray-200 rounded"></div>
            ) : (
              <div className="ml-4">
                <h1 className="text-lg font-bold">{room?.id || ""}</h1>
                <p className="text-sm text-gray-500">
                  {room?.name || ""} - {room?.description || ""}
                </p>
              </div>
            )}
          </div>
          {!isLoading && room && <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-medium text-blue-700">{room?.status === "finished" ? "SIMULATION COMPLETED!" : room?.status.toUpperCase()}</div>}
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
              Description
            </Tab>
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
                <DescriptionPanel room={room} roomId={roomId} />
              )}
            </TabPanel>
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
                <CapacityUptakePanel roomId={roomId} totalRounds={room?.total_rounds} containers={containersData} userId={user.id} isAdminView={false} />
              )}
            </TabPanel>

            <TabPanel>
              {isLoading ? (
                <div className="w-full flex justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <StowageLogPanel
                  roomId={roomId}
                  totalRounds={room?.total_rounds}
                  bayTypes={room?.bay_types}
                  containers={containersData}
                  userId={user.id} // Force to only show current user's data
                />
              )}
            </TabPanel>

            <TabPanel>
              {isLoading ? (
                <div className="w-full flex justify-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <WeeklyPerformancePanel totalRounds={room?.total_rounds} roomId={roomId} userId={user.id} isAdminView={false} />
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

export default PreviousSimulationDetail;
