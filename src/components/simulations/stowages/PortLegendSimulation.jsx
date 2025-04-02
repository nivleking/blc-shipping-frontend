import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api, socket } from "../../../axios/axios";
import { AppContext } from "../../../context/AppContext";

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

const PortLegendSimulation = ({ compact = false }) => {
  const { roomId } = useParams();
  const { user, token } = useContext(AppContext);
  const [portInfo, setPortInfo] = useState({
    userPort: "",
    receivesFrom: "",
    sendsTo: "",
    allPorts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

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

      const receivesFrom = Object.entries(swapConfig).find(([from, to]) => to === userPort)?.[0] || "Unknown";
      const sendsTo = swapConfig[userPort] || "Unknown";

      // Build the complete port route
      const allPorts = [];
      let startPort = null;

      // Find a starting point (a port that doesn't receive from anyone)
      for (const port in swapConfig) {
        const isReceiver = Object.values(swapConfig).includes(port);
        if (!isReceiver) {
          startPort = port;
          break;
        }
      }

      // If we can't find a port that doesn't receive, just use any port
      if (!startPort && Object.keys(swapConfig).length > 0) {
        startPort = Object.keys(swapConfig)[0];
      }

      // Now build the complete route
      if (startPort) {
        let currentPort = startPort;
        // Limit to avoid infinite loops in case of circular references
        const maxPorts = Object.keys(swapConfig).length + 1;
        let count = 0;

        while (currentPort && count < maxPorts) {
          allPorts.push(currentPort);
          currentPort = swapConfig[currentPort];
          count++;
        }
      }

      allPorts.reverse();

      setPortInfo({
        userPort,
        receivesFrom,
        sendsTo,
        allPorts,
      });
    } catch (error) {
      console.error("Error fetching port configuration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && token && roomId) {
      fetchPortConfiguration();
    }

    socket.on("port_config_updated", ({ roomId: updatedRoomId }) => {
      if (updatedRoomId === roomId) {
        fetchPortConfiguration();
      }
    });

    return () => {
      socket.off("port_config_updated");
    };
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

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-2 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">Your Port:</span>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-blue-600 hover:underline flex items-center">
            {isExpanded ? "Hide details" : "Show more"}
            <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
        </div>

        {/* Simplified port display */}
        <div className="flex items-center space-x-2 mb-1">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: getPortColor(portInfo.userPort) }}>
            {portInfo.userPort?.substring(0, 1).toUpperCase()}
          </div>
          <span className="font-medium text-sm">{portInfo.userPort}</span>

          
        </div>

        {/* Expandable section */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
            {/* Port route visualization - simplified */}
            <div className="flex items-center justify-center gap-1 py-1 overflow-x-auto">
              {portInfo.allPorts.map((port, index) => (
                <React.Fragment key={`port-${index}`}>
                  {index > 0 && (
                    <svg className="w-3 h-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold
                    ${port === portInfo.userPort ? "ring-1 ring-yellow-400" : ""}`}
                    style={{ backgroundColor: getPortColor(port) }}
                  >
                    {port.substring(0, 1).toUpperCase()}
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Active ports */}
            <div className="flex flex-wrap gap-1 mt-1">
              {(() => {
                // Get only active ports from the current simulation
                const activePorts = new Set();

                // Add user's port and directly connected ports
                if (portInfo.userPort) activePorts.add(portInfo.userPort);
                if (portInfo.receivesFrom) activePorts.add(portInfo.receivesFrom);
                if (portInfo.sendsTo) activePorts.add(portInfo.sendsTo);

                // Add all ports in the route
                portInfo.allPorts.forEach((port) => {
                  activePorts.add(port);
                });

                // Convert to array and sort
                const sortedPorts = Array.from(activePorts).sort();

                // Return mapped JSX
                return sortedPorts.map((port) => (
                  <span key={port} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px]" style={{ backgroundColor: `${getPortColor(port)}25`, color: getPortColor(port) }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getPortColor(port) }}></span>
                    {port}
                  </span>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      {/* Active port legend at the top with improved design */}
      <div className="mb-4 bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
        <div className="text-sm font-medium mb-2 text-gray-700">Active Ports in Simulation</div>
        <div className="flex flex-wrap gap-2">
          {(() => {
            // Get only active ports from the current simulation
            const activePorts = new Set();

            // Add user's port and directly connected ports
            if (portInfo.userPort) activePorts.add(portInfo.userPort.substring(0, 3));
            if (portInfo.receivesFrom) activePorts.add(portInfo.receivesFrom.substring(0, 3));
            if (portInfo.sendsTo) activePorts.add(portInfo.sendsTo.substring(0, 3));

            // Add all ports in the route
            portInfo.allPorts.forEach((port) => {
              if (port) activePorts.add(port.substring(0, 3));
            });

            // Convert to array and sort
            const sortedPorts = Array.from(activePorts).sort();

            // Return mapped JSX
            return sortedPorts.map((port) => (
              <div key={port} className={`flex items-center gap-2 px-2 py-1 rounded-md ${portInfo.userPort?.startsWith(port) ? "bg-blue-50 border border-blue-200" : "bg-gray-50 border border-gray-200"}`}>
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: PORT_COLORS[port] || "#64748B" }} />
                <span className={`text-xs ${portInfo.userPort?.startsWith(port) ? "font-medium text-blue-700" : "text-gray-600"}`}>
                  {port}
                  {portInfo.userPort?.startsWith(port) && <span className="ml-1 text-blue-700 font-bold">★</span>}
                </span>
              </div>
            ));
          })()}
        </div>
      </div>

      <div className="mt-3 border-t pt-3">
        <h3 className="font-semibold text-gray-800 mb-2">Your Route Configuration</h3>

        {/* Complete route visualization */}
        {portInfo.allPorts.length > 0 && (
          <div className="mb-4 overflow-x-auto py-2">
            <div className="flex items-center justify-center gap-1 min-w-max">
              {portInfo.allPorts.map((port, index) => (
                <React.Fragment key={`port-${index}`}>
                  {index > 0 && (
                    <svg className="w-6 h-5 text-gray-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}

                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs
                      ${port === portInfo.userPort ? "w-10 h-10 border-3 border-yellow-400 shadow-md scale-110 z-10" : ""}`}
                      style={{ backgroundColor: getPortColor(port) }}
                    >
                      {port.substring(0, 1).toUpperCase()}
                    </div>
                    <span className={`text-xs mt-1 ${port === portInfo.userPort ? "font-bold" : ""}`}>
                      {port}
                      {port === portInfo.userPort && <span className="block text-[10px] text-blue-700">(You)</span>}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Detail about user's direct connections */}
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
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-yellow-400" style={{ backgroundColor: getPortColor(portInfo.userPort) }}>
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
              You will receive containers from <span className="font-medium">{portInfo.sendsTo}</span>
            </p>
            <p>
              Your container port's (<span className="font-medium">{portInfo.userPort}</span>) will be sent to <span className="font-medium">{portInfo.receivesFrom}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortLegendSimulation;
