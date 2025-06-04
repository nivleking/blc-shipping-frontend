import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../axios/axios";
import { AppContext } from "../../../context/AppContext";
import StowageLogSelector from "./StowageLogSelector";
import StowageLogBay from "./StowageLogBay";
import StowageLogDock from "./StowageLogDock";
import StowageLogSummary from "./StowageLogSummary";
import LoadingSpinner from "../LoadingSpinner";

const StowageLogPanel = ({ roomId, totalRounds = 1, containers = [], bayTypes, userId = null, isAdminView = false }) => {
  const { token } = useContext(AppContext);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  // Query to fetch users who participated in this room
  const usersQuery = useQuery({
    queryKey: ["stowageLogUsers", roomId],
    queryFn: async () => {
      const response = await api.get(`/simulation-logs/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!roomId && !!token,
  });

  // Set selected user based on userId prop or first available user
  useEffect(() => {
    if (userId) {
      // If userId provided, force selection to that user
      setSelectedUserId(userId);

      // Find user data if available
      if (usersQuery.data?.users?.length > 0) {
        const userData = usersQuery.data.users.find((u) => u.id === userId);
        setSelectedUser(userData || { id: userId, name: "Current User" });
      }
    } else if (usersQuery.data?.users?.length > 0 && !selectedUserId) {
      // If no userId provided and we're in admin view, set to first user
      setSelectedUserId(usersQuery.data.users[0].id);
      setSelectedUser(usersQuery.data.users[0]);
    }
  }, [usersQuery.data, selectedUserId, userId]);

  // Query to fetch logs for the selected user
  const logsQuery = useQuery({
    queryKey: ["stowageLogs", roomId, selectedUserId, selectedSection, selectedRound],
    queryFn: async () => {
      let url = `/simulation-logs/rooms/${roomId}/users/${selectedUserId}`;
      const params = new URLSearchParams();

      if (selectedSection) {
        params.append("section", selectedSection);
      }

      if (selectedRound) {
        params.append("round", selectedRound);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!roomId && !!selectedUserId && !!token,
  });

  // Event handlers
  const handleUserChange = (newUserId) => {
    // Only allow changing users in admin view AND when userId is not provided
    if (!isAdminView || userId) return;

    setSelectedUserId(newUserId);
    const user = usersQuery.data?.users?.find((u) => u.id === Number(newUserId));
    setSelectedUser(user);
    setSelectedSection(null);
    setSelectedRound(null);
    setSelectedLog(null);
  };

  const handleSectionChange = (section) => {
    setSelectedSection(section);
    setSelectedLog(null);
  };

  const handleRoundChange = (round) => {
    setSelectedRound(round);
    setSelectedLog(null);
  };

  const handleLogSelect = (log) => {
    setSelectedLog(log);
  };

  // Loading state
  if (usersQuery.isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (usersQuery.isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error loading stowage log data</p>
        <p className="text-sm">{usersQuery.error?.message || "An unknown error occurred"}</p>
      </div>
    );
  }

  const users = usersQuery.data?.users || [];
  const logs = logsQuery.data?.logs || [];
  const filters = logsQuery.data?.filters || { available_rounds: [], available_sections: [] };

  const parseBayTypes = (bayTypesStr) => {
    try {
      if (typeof bayTypesStr === "string") {
        return JSON.parse(bayTypesStr);
      } else if (Array.isArray(bayTypesStr)) {
        return bayTypesStr;
      }
      return [];
    } catch (error) {
      console.error("Error parsing bay types:", error);
      return [];
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with gradient style */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <h2 className="text-sm font-bold">Stowage Logs</h2>
        <p className="text-sm text-blue-100">View historical snapshots of bay and dock configurations</p>
      </div>

      {/* Summary section at the top */}
      {selectedLog && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <StowageLogSummary log={selectedLog} />
        </div>
      )}

      {/* Two-column layout for selector and configurations */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left column - Selector (smaller width) */}
        <div className="w-full lg:w-1/3">
          <StowageLogSelector
            users={users}
            selectedUserId={selectedUserId}
            selectedSection={selectedSection}
            selectedRound={selectedRound}
            availableSections={filters.available_sections}
            availableRounds={filters.available_rounds}
            onUserChange={handleUserChange}
            onSectionChange={handleSectionChange}
            onRoundChange={handleRoundChange}
            onLogSelect={handleLogSelect}
            logs={logs}
            disableUserSelection={!isAdminView || !!userId}
          />
        </div>

        {/* Right column - Bay and Dock Configuration (larger width) */}
        <div className="w-full lg:w-2/3 space-y-4">
          {selectedLog ? (
            <div className="space-y-4">
              {/* Bay Configuration */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium mb-2">Bay Configuration</h3>
                <StowageLogBay arenaData={selectedLog.arena_bay} containers={containers} bayTypes={parseBayTypes(bayTypes)} />
              </div>

              {/* Dock Configuration */}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium mb-2">Dock Configuration</h3>
                <StowageLogDock arenaData={selectedLog.arena_dock} containers={containers} />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Select a stowage log to view details</p>
                <p className="text-xs text-gray-400">Use the filters to find logs based on section and round</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {logsQuery.isLoading && <LoadingSpinner />}
    </div>
  );
};

export default StowageLogPanel;
