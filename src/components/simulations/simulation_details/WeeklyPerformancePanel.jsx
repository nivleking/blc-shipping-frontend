import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../axios/axios";
import { AppContext } from "../../../context/AppContext";
import WeeklyPerformance from "../../simulations/weekly_performance/WeeklyPerformance";
import LoadingSpinner from "../../simulations/LoadingSpinner";

const WeeklyPerformancePanel = ({ roomId, totalRounds = 1, userId = null, isAdminView = false }) => {
  const { token } = useContext(AppContext);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const effectiveUserId = isAdminView ? selectedUserId : userId;

  // Query to fetch users - only needed in admin view
  const usersQuery = useQuery({
    queryKey: ["roomUsers", roomId],
    queryFn: async () => {
      const response = await api.get(`/rooms/${roomId}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!roomId && !!token && isAdminView, // Only fetch users in admin view
    staleTime: 5 * 60 * 1000,
  });

  // Set first user as selected when data loads
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

  // Handle user selection change - only in admin view
  const handleUserChange = (e) => {
    if (!isAdminView) return;

    const userId = Number(e.target.value);
    setSelectedUserId(userId);
    const user = usersQuery.data.find((u) => u.id === userId);
    setSelectedUser(user);
  };

  if (usersQuery.isLoading && isAdminView) {
    // Show loading state
    return <LoadingSpinner />;
  }

  if (usersQuery.isError && isAdminView) {
    // Show error state
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error loading room data</p>
        <p className="text-sm">{usersQuery.error?.message || "An unknown error occurred"}</p>
      </div>
    );
  }

  const users = isAdminView ? usersQuery.data || [] : [];

  return (
    <div className="space-y-4">
      {/* Header with gradient style */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <h2 className="text-sm font-bold">Weekly Performance</h2>
        <p className="text-sm text-blue-100">Review participants' financial and operational performance</p>
      </div>

      {/* User Selection - only show in admin view */}
      {isAdminView && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Select Participant</h3>

            <div className="flex items-center space-x-2">
              <select value={selectedUserId || ""} onChange={handleUserChange} className="form-select text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                <option value="" disabled>
                  Choose a participant
                </option>
                {users.map((user) => (
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
      )}

      {/* Weekly Performance Component */}
      {effectiveUserId ? (
        <div className="bg-white rounded-lg shadow p-4">
          <WeeklyPerformance userId={effectiveUserId} roomId={roomId} isAdminView={isAdminView} totalRounds={totalRounds} currentRound={totalRounds} showFinancialModal={false} />
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-500">{isAdminView ? "Select a participant to view weekly performance data" : "User data is not available"}</p>
        </div>
      )}
    </div>
  );
};

export default WeeklyPerformancePanel;
