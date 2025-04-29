import React, { useState, useEffect, useContext } from "react";
import { getPortColor } from "../../../assets/Colors";
import { api, socket } from "../../../axios/axios";
import { useParams } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";

const PortOrderAlert = ({ currentPort }) => {
  const { roomId } = useParams();
  const { token } = useContext(AppContext);
  const [portSequence, setPortSequence] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch port sequence
  const fetchPortSequence = async () => {
    if (!currentPort || !roomId) return;

    try {
      setIsLoading(true);
      const response = await api.get(`/rooms/${roomId}/port-sequence/${currentPort}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPortSequence(response.data.recommended_stacking_order || []);
    } catch (error) {
      console.error("Error fetching port sequence:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when port changes
  useEffect(() => {
    if (currentPort && roomId && token) {
      fetchPortSequence();
    }
  }, [currentPort, roomId, token]);

  // Listen for port_config_updated events
  useEffect(() => {
    socket.on("port_config_updated", ({ roomId: updatedRoomId }) => {
      if (updatedRoomId === roomId) {
        fetchPortSequence();
      }
    });

    return () => {
      socket.off("port_config_updated");
    };
  }, [roomId, currentPort]);

  if (isLoading || !currentPort || !portSequence || portSequence.length === 0) {
    return null;
  }

  // Get port-specific text and background colors
  const getPortStyles = (port) => {
    const portColor = getPortColor(port);
    return {
      backgroundColor: portColor + "20", // 20 is hex for 12% opacity
      color: portColor,
      borderColor: portColor + "60", // 60 is hex for 38% opacity
    };
  };

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-3 border-yellow-400 p-2 mb-2 rounded-md shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-2">
          <p className="text-[9px] font-medium text-yellow-800">Stacking Order</p>
          <div className="mt-1 flex items-center space-x-1">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-gray-500">TOP</span>
              <div className="w-0.5 h-3 bg-gray-300"></div>
            </div>
            <div className="flex items-center">
              {portSequence.map((port, index) => {
                const portStyles = getPortStyles(port);

                return (
                  <React.Fragment key={port}>
                    {index > 0 && (
                      <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-medium border" style={portStyles}>
                      {port}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-3 bg-gray-300"></div>
              <span className="text-[9px] text-gray-500">BOTTOM</span>
            </div>
          </div>
          <p className="mt-0.5 text-[9px] text-gray-600">Stack containers with furthest ports at the bottom.</p>
        </div>
      </div>
    </div>
  );
};

export default PortOrderAlert;
