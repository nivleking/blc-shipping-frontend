const StowageLogSummary = ({ log }) => {
  if (!log) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
  };

  const getSectionDisplay = (section) => {
    if (section === "section1") return "Discharge";
    if (section === "section2") return "Sales Calls";
    return section;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);

      // Date formatting options
      const dateOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
      };

      // Time formatting options
      const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };

      // Combine date and time with a separator
      return `${date.toLocaleDateString("en-US", dateOptions)} at ${date.toLocaleTimeString("en-US", timeOptions)}`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h3 className="font-medium text-sm mb-3 text-gray-700">Stowage Log Summary</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-2 rounded border">
          <div className="text-xs text-gray-500">Port</div>
          <div className="font-medium">{log.port}</div>
        </div>

        <div className="bg-white p-2 rounded border">
          <div className="text-xs text-gray-500">Section</div>
          <div className="font-medium">{getSectionDisplay(log.section)}</div>
        </div>

        <div className="bg-white p-2 rounded border">
          <div className="text-xs text-gray-500">Round</div>
          <div className="font-medium">{log.round}</div>
        </div>

        <div className="bg-white p-2 rounded border">
          <div className="text-xs text-gray-500">Timestamp</div>
          <div className="font-medium text-xs">{formatDate(log.created_at)}</div>
        </div>

        <div className="bg-white p-2 rounded border">
          <div className="text-xs text-gray-500">Revenue</div>
          <div className="font-medium text-green-600">{formatCurrency(log.revenue)}</div>
        </div>

        <div className="bg-white p-2 rounded border">
          <div className="text-xs text-gray-500">Penalty</div>
          <div className="font-medium text-red-600">{formatCurrency(log.penalty)}</div>
        </div>

        <div className="bg-white p-2 rounded border col-span-2">
          <div className="text-xs text-gray-500">Total Revenue</div>
          <div className={`font-medium ${log.total_revenue >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(log.total_revenue)}</div>
        </div>
      </div>
    </div>
  );
};

export default StowageLogSummary;
