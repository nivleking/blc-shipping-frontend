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

  // Manual state management untuk logs
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logsData, setLogsData] = useState(null);
  const [logsError, setLogsError] = useState(null);

  const usersQuery = useQuery({
    queryKey: ["roomUsers", roomId],
    queryFn: async () => {
      const response = await api.get(`/rooms/${roomId}/users`, {
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
      if (usersQuery.data?.length > 0) {
        const userData = usersQuery.data.find((u) => u.id === userId);
        setSelectedUser(userData || { id: userId, name: "Current User" });
      }
    } else if (usersQuery.data?.length > 0 && !selectedUserId) {
      // If no userId provided and we're in admin view, set to first user
      setSelectedUserId(usersQuery.data[0].id);
      setSelectedUser(usersQuery.data[0]);
    }
  }, [usersQuery.data, selectedUserId, userId]);

  // Manual fetch function untuk logs
  const fetchLogs = async () => {
    if (!roomId || !selectedUserId || !token) return;

    setIsLoadingLogs(true);
    setLogsError(null);

    try {
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
      setLogsData(response.data);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setLogsError(err.response?.data?.message || "Failed to load logs data");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Refresh function - bisa dipanggil secara manual
  const handleRefreshLogs = () => {
    if (selectedUserId) {
      fetchLogs();
    }
  };

  // Fetch logs when filters change
  useEffect(() => {
    if (selectedUserId) {
      fetchLogs();
    } else {
      // Clear logs data when no user is selected
      setLogsData(null);
    }
  }, [selectedUserId, selectedSection, selectedRound]);

  // Event handlers
  const handleUserChange = (newUserId) => {
    // Only allow changing users in admin view AND when userId is not provided
    if (!isAdminView || userId) return;

    setSelectedUserId(newUserId);
    const user = usersQuery.data?.find((u) => u.id === Number(newUserId));
    setSelectedUser(user);
    setSelectedSection(null);
    setSelectedRound(null);
    setSelectedLog(null);
    setLogsData(null); // Clear previous logs data
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

  // Loading state - hanya untuk users query
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

  // Error state - untuk users query
  if (usersQuery.isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error loading room users</p>
        <p className="text-sm">{usersQuery.error?.message || "An unknown error occurred"}</p>
      </div>
    );
  }

  // Error state untuk logs
  if (logsError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error loading logs data</p>
        <p className="text-sm">{logsError}</p>
        <button onClick={handleRefreshLogs} className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  const users = usersQuery.data || [];
  const logs = logsData?.logs || [];
  const filters = logsData?.filters || { available_rounds: [], available_sections: [] };

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
      {/* Header with gradient style and refresh button */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold">Stowage Logs</h2>
            <p className="text-sm text-blue-100">View historical snapshots of bay and dock configurations</p>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefreshLogs}
            disabled={isLoadingLogs || !selectedUserId}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              isLoadingLogs || !selectedUserId ? "bg-blue-400 text-blue-200 cursor-not-allowed" : "bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 shadow-sm"
            }`}
          >
            <svg className={`w-3 h-3 ${isLoadingLogs ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isLoadingLogs ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
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
                {selectedUserId && (
                  <button onClick={handleRefreshLogs} className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors">
                    Load Logs
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show loading spinner when logs are being fetched */}
      {isLoadingLogs && <LoadingSpinner />}
    </div>
  );
};

export default StowageLogPanel;
