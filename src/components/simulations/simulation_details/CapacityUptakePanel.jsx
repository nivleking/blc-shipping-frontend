import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../axios/axios";
import { AppContext } from "../../../context/AppContext";
import CapacityUptake from "../../simulations/capacity_uptake/CapacityUptake";
import LoadingSpinner from "../../simulations/LoadingSpinner";

const CapacityUptakePanel = ({ roomId, totalRounds = 1, containers, userId = null, isAdminView = false }) => {
  const { user, token } = useContext(AppContext);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const effectiveUserId = isAdminView ? selectedUserId : userId || user?.id;

  // Query to fetch users
  const usersQuery = useQuery({
    queryKey: ["roomUsers", roomId],
    queryFn: async () => {
      const response = await api.get(`/rooms/${roomId}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!roomId && !!token && isAdminView, // Only fetch users list in admin view
  });

  // Set first user as selected when data loads or set to forced userId in non-admin view
  useEffect(() => {
    if (isAdminView && usersQuery.data?.length > 0 && !selectedUserId) {
      setSelectedUserId(usersQuery.data[0].id);
      setSelectedUser(usersQuery.data[0]);
    } else if (!isAdminView && userId) {
      setSelectedUserId(userId);
      // Find user data if available
      if (usersQuery.data?.length > 0) {
        const userData = usersQuery.data.find((u) => u.id === userId);
        setSelectedUser(userData || { id: userId, name: "Current User" });
      }
    }
  }, [usersQuery.data, selectedUserId, isAdminView, userId]);

  // Handle user selection change - only used in admin view
  const handleUserChange = (e) => {
    if (!isAdminView) return; // Prevent changing user in non-admin view

    const userId = Number(e.target.value);
    setSelectedUserId(userId);
    const user = usersQuery.data.find((u) => u.id === userId);
    setSelectedUser(user);
  };

  const isLoading = usersQuery.isLoading;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error loading data</p>
        <p className="text-sm">{usersQuery.error?.message || "An unknown error occurred"}</p>
      </div>
    );
  }

  const users = usersQuery.data || [];

  return (
    <div className="space-y-4">
      {/* Header with gradient style */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <h2 className="text-sm font-bold">Capacity Uptake Management</h2>
        <p className="text-sm text-blue-100">Review how participants manage ship capacity</p>
      </div>

      {/* User Selection - only show in admin view */}
      {isAdminView ? (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Select Participant</h3>

            <div className="flex items-center space-x-2">
              <select value={selectedUserId || ""} onChange={handleUserChange} className="form-select text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                <option value="" disabled>
                  Choose a participant
                </option>
                {(usersQuery.data || []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedUser && (
            <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Viewing data for:</div>
              <div className="text-sm font-medium">{selectedUser.name}</div>
            </div>
          )}
        </div>
      ) : null}

      {/* Capacity Uptake Component */}
      {effectiveUserId ? (
        <div className="bg-white rounded-lg shadow p-4">
          <CapacityUptake roomId={roomId} userId={effectiveUserId} isAdminView={isAdminView} totalRounds={totalRounds} currentRound={totalRounds} containers={containers} />
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-500">{isAdminView ? "Select a participant to view capacity uptake data" : "User data is not available"}</p>
        </div>
      )}
    </div>
  );
};

export default CapacityUptakePanel;
