import React, { useState, useEffect, useContext } from "react";
import { api } from "../../../axios/axios";
import { AppContext } from "../../../context/AppContext";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const formatIDR = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

const DescriptionPanel = ({ room, roomId }) => {
  const { token } = useContext(AppContext);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [deck, setDeck] = useState(null);

  // Query to fetch all decks
  const { data: decksData } = useQuery({
    queryKey: ["decks"],
    queryFn: async () => {
      const response = await api.get(`/decks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  // New query to fetch ALL users in the system
  const allUsersQuery = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const response = await api.get(`/users/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  // Query to fetch active users in this specific room
  const roomUsersQuery = useQuery({
    queryKey: ["roomUsers", roomId],
    queryFn: async () => {
      const response = await api.get(`/rooms/${roomId}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!roomId && !!token,
    staleTime: 5 * 60 * 1000,
  });

  // Di useEffect yang memproses users data:
  useEffect(() => {
    if (room && allUsersQuery.data) {
      // Parse assigned user IDs from string JSON
      const assignedUserIds = typeof room.assigned_users === "string" ? JSON.parse(room.assigned_users || "[]") : room.assigned_users || [];

      // Parse active user IDs from string JSON
      const activeUserIds = typeof room.users === "string" ? JSON.parse(room.users || "[]") : room.users || [];

      // Get full list of all users from our all-users query
      const allUsersList = allUsersQuery.data || [];

      // Get active users from room-specific query
      const roomUsersList = roomUsersQuery.data || [];

      // Convert IDs to numbers if they're strings to ensure consistent comparison
      const normalizedAssignedIds = assignedUserIds.map((id) => Number(id));
      const normalizedActiveIds = activeUserIds.map((id) => Number(id));

      // Filter allUsersList to get assigned users with complete info
      const assignedUserObjects = allUsersList.filter((user) => normalizedAssignedIds.includes(Number(user.id)));

      // Filter roomUsersList to get active users
      const activeUserObjects = roomUsersList.filter((user) => normalizedActiveIds.includes(Number(user.id)));

      // Update state with complete user objects
      setAssignedUsers(assignedUserObjects);
      setActiveUsers(activeUserObjects);

      // Debug logging
      console.log("Assigned User IDs:", normalizedAssignedIds);
      console.log("Assigned User Objects:", assignedUserObjects);
    }
  }, [allUsersQuery.data, roomUsersQuery.data, room]);

  // Find the matching deck from the decks list
  useEffect(() => {
    if (decksData && room && room.deck_id) {
      const matchingDeck = decksData.find((d) => d.id === room.deck_id);
      if (matchingDeck) {
        setDeck((prev) => ({ ...prev, name: matchingDeck.name, id: matchingDeck.id }));
      }
    }
  }, [decksData, room]);

  // Prepare the bay types display
  const bayTypesDisplay = () => {
    if (!room || !room.bay_types) return "Not specified";

    const bayTypes = typeof room.bay_types === "string" ? JSON.parse(room.bay_types) : room.bay_types;

    return (
      <div className="flex flex-wrap gap-1">
        {bayTypes.map((type, index) => (
          <span
            key={index}
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium
              ${type === "reefer" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} Bay {index}
          </span>
        ))}
      </div>
    );
  };

  // Prepare the swap config display
  const swapConfigDisplay = () => {
    if (!room || !room.swap_config) return "Not specified";

    const swapConfig = typeof room.swap_config === "string" ? JSON.parse(room.swap_config) : room.swap_config;

    if (Object.keys(swapConfig).length === 0) return "No swap configuration";

    return (
      <div className="grid gap-2 mt-2">
        {Object.entries(swapConfig).map(([from, to], index) => (
          <div key={index} className="flex items-center bg-gray-50 p-2 rounded-md">
            <div className="font-medium text-gray-700">{from}</div>
            <div className="mx-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="font-medium text-gray-700">{to}</div>
          </div>
        ))}
      </div>
    );
  };

  if (allUsersQuery.isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with gradient style */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <h2 className="text-sm font-bold">Room Configuration</h2>
        <p className="text-sm text-blue-100">Detailed information about this simulation room</p>
      </div>

      {/* Basic Information Card */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider">Room Name</h4>
            <p className="text-sm font-medium">{room?.name || "Not specified"}</p>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider">Description</h4>
            <p className="text-sm">{room?.description || "No description provided"}</p>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider">Status</h4>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${room?.status === "active" ? "bg-green-100 text-green-800" : room?.status === "finished" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
              >
                {room?.status?.toUpperCase() || "UNKNOWN"}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider">Deck</h4>
            <div className="flex items-center">
              {deck?.id ? (
                <Link to={`/admin-decks/${deck.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center">
                  {deck?.name || "No deck information"}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              ) : (
                <p className="text-sm font-medium">{deck?.name || "No deck information"}</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider">Total Rounds</h4>
            <p className="text-sm font-medium">{room?.total_rounds || "Not specified"}</p>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider">Maximum Users</h4>
            <p className="text-sm">{room?.max_users || "Not specified"}</p>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider">Cards Limit Per Round</h4>
            <p className="text-sm">{room?.cards_limit_per_round || "Not specified"}</p>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider">Cards Must Process Per Round</h4>
            <p className="text-sm">{room?.cards_must_process_per_round || "Not specified"}</p>
          </div>
        </div>
      </div>

      {/* Users & Participants Card */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Users & Participants</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Assigned Users</h4>
            {assignedUsers && assignedUsers.length > 0 ? (
              <div className="grid gap-2">
                {assignedUsers.map((user) => (
                  <div key={user.id} className="flex items-center bg-blue-50 p-2 rounded">
                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-medium">{user.name.charAt(0).toUpperCase()}</div>
                    <div className="ml-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No users assigned</p>
            )}
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Active Participants</h4>
            {activeUsers && activeUsers.length > 0 ? (
              <div className="grid gap-2">
                {activeUsers.map((user) => (
                  <div key={user.id} className="flex items-center bg-green-50 p-2 rounded">
                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-medium">{user.name.charAt(0).toUpperCase()}</div>
                    <div className="ml-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No active participants</p>
            )}
          </div>
        </div>
      </div>

      {/* Bay Configuration Card */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Bay & Container Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider">Bay Size</h4>
            <p className="text-sm mt-1">
              {room?.bay_size
                ? typeof room.bay_size === "string"
                  ? (() => {
                      const size = JSON.parse(room.bay_size);
                      return `${size.rows} rows × ${size.columns} columns`;
                    })()
                  : `${room.bay_size.rows} rows × ${room.bay_size.columns} columns`
                : "Not specified"}
            </p>
          </div>

          <div>
            <h4 className="text-xs text-gray-500 uppercase tracking-wider">Bay Count</h4>
            <p className="text-sm mt-1">{room?.bay_count || "Not specified"}</p>
          </div>

          <div className="col-span-2">
            <h4 className="text-xs text-gray-500 uppercase tracking-wider">Bay Types</h4>
            <div className="mt-1">{bayTypesDisplay()}</div>
          </div>
        </div>
      </div>

      {/* Swap Configuration Card */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-md font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">Port Swap Configuration</h3>

        {swapConfigDisplay()}
      </div>
    </div>
  );
};

export default DescriptionPanel;
