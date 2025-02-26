import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../axios/axios";
import { AppContext } from "../../context/AppContext";

const PORT_COLORS = {
  SBY: "#EF4444", // red
  MKS: "#3B82F6", // blue
  MDN: "#10B981", // green
  JYP: "#EAB308", // yellow
  BPN: "#8B5CF6", // purple
  BKS: "#F97316", // orange
  BGR: "#EC4899", // pink
  BTH: "#92400E", // brown
};

const PortLegend = () => {
  const { roomId } = useParams();
  const { user, token } = useContext(AppContext);
  const [portInfo, setPortInfo] = useState({
    userPort: "",
    receivesFrom: "",
    sendsTo: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPortConfiguration = async () => {
      try {
        setIsLoading(true);

        // Get user port
        const portResponse = await api.get(`/rooms/${roomId}/user-port`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userPort = portResponse.data.port;

        // Get room swap config
        const roomResponse = await api.get(`/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let swapConfig = {};
        if (roomResponse.data.swap_config) {
          try {
            swapConfig = typeof roomResponse.data.swap_config === "string" ? JSON.parse(roomResponse.data.swap_config) : roomResponse.data.swap_config;
          } catch (e) {
            console.error("Error parsing swap config");
          }
        }

        // Find where user's port receives from
        const receivesFrom = Object.entries(swapConfig).find(([from, to]) => to === userPort)?.[0] || "Unknown";

        // Find where user's port sends to
        const sendsTo = swapConfig[userPort] || "Unknown";

        setPortInfo({
          userPort,
          receivesFrom,
          sendsTo,
        });
      } catch (error) {
        console.error("Error fetching port configuration:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && token && roomId) {
      fetchPortConfiguration();
    }
  }, [user, token, roomId]);

  const getPortColor = (port) => {
    // Extract port code (first 3 letters)
    const portCode = port?.substring(0, 3)?.toUpperCase();
    return PORT_COLORS[portCode] || "#64748B"; // Default gray if port not found
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      {/* Classic port legend at the top */}
      <div className="text-sm font-medium mb-2 text-gray-700 text-end">Destination Port Legend</div>
      <div className="flex flex-wrap justify-end gap-3 mb-4">
        {Object.entries(PORT_COLORS).map(([port, color]) => (
          <div key={port} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-600">{port}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t pt-3">
        <h3 className="font-semibold text-gray-800 mb-2">Your Route Configuration</h3>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: getPortColor(portInfo.sendsTo) }}>
              {portInfo.sendsTo.substring(0, 1).toUpperCase()}
            </div>
            <span className="text-xs">{portInfo.sendsTo}</span>
          </div>

          <svg className="w-10 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>

          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: getPortColor(portInfo.userPort) }}>
              {portInfo.userPort.substring(0, 1).toUpperCase()}
            </div>
            <span className="text-xs font-medium">{portInfo.userPort}</span>
          </div>

          <svg className="w-10 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>

          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: getPortColor(portInfo.receivesFrom) }}>
              {portInfo.receivesFrom.substring(0, 1).toUpperCase()}
            </div>
            <span className="text-xs">{portInfo.receivesFrom}</span>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="mb-1">
              You receive containers from <span className="font-medium">{portInfo.sendsTo}</span>
            </p>
            <p>
              Your port <span className="font-medium">{portInfo.userPort}</span> sends containers to <span className="font-medium">{portInfo.receivesFrom}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortLegend;
