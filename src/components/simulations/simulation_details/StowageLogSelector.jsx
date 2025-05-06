const StowageLogSelector = ({
  users = [],
  selectedUserId,
  selectedSection,
  selectedRound,
  availableSections = [],
  availableRounds = [],
  onUserChange,
  onSectionChange,
  onRoundChange,
  onLogSelect,
  logs = [],
  disableUserSelection = falsse,
}) => {
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;

      // Convert to seconds, minutes, hours, days
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      // Format based on how long ago
      if (diffDays > 0) {
        return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
      } else if (diffHours > 0) {
        return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
      } else if (diffMins > 0) {
        return diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
      } else {
        return "just now";
      }
    } catch (e) {
      return "unknown time";
    }
  };

  const getSectionDisplay = (section) => {
    if (section === "section1") return "Discharge";
    if (section === "section2") return "Sales Calls";
    return section;
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      {/* Header moved above the selections */}
      <h3 className="text-sm font-medium text-gray-700 mb-3">Log Selection</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {/* Only show user selection dropdown if not disabled and there are users */}
        {!disableUserSelection && users.length > 0 && (
          <select
            value={selectedUserId || ""}
            onChange={(e) => onUserChange(Number(e.target.value))}
            className="form-select text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            <option value="" disabled>
              Choose a participant
            </option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        )}

        {/* Section and round selectors remain the same */}
        <select
          value={selectedSection || ""}
          onChange={(e) => onSectionChange(e.target.value)}
          className="form-select text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          disabled={!selectedUserId || availableSections.length === 0}
        >
          <option value="">All Sections</option>
          {availableSections.map((section) => (
            <option key={section} value={section}>
              {getSectionDisplay(section)}
            </option>
          ))}
        </select>

        <select
          value={selectedRound || ""}
          onChange={(e) => onRoundChange(Number(e.target.value))}
          className="form-select text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          disabled={!selectedUserId || availableRounds.length === 0}
        >
          <option value="">All Rounds</option>
          {availableRounds.map((round) => (
            <option key={round} value={round}>
              Round {round}
            </option>
          ))}
        </select>
      </div>

      {/* Log list */}
      {logs.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="divide-y max-h-60 overflow-y-auto">
            {logs.map((log) => (
              <button key={log.id} className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-blue-50" onClick={() => onLogSelect(log)}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-medium">
                      {getSectionDisplay(log.section)} - Round {log.round}
                    </span>
                    <div className="flex gap-2 mt-1">
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">Port: {log.port}</span>
                      <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-800 text-xs">Revenue: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(log.revenue)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{formatTimestamp(log.created_at)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 border rounded-md text-center text-gray-500">{selectedUserId ? "No logs available with the selected filters" : "Select a user to view logs"}</div>
      )}
    </div>
  );
};

export default StowageLogSelector;
