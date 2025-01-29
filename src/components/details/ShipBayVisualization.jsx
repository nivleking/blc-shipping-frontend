const ShipBayVisualization = ({ bayData, userName, timestamp, revenue }) => {
  const getContainerColor = (containerId) => {
    // Simplified color mapping
    const colors = {
      JYP: "#EF4444", // red
      SBY: "#3B82F6", // blue
      MKS: "#10B981", // green
      MDN: "#F59E0B", // yellow
    };
    return colors[containerId] || "#6B7280"; // default gray
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-semibold text-gray-800">{userName}</h4>
          <p className="text-sm text-gray-500">{new Date(timestamp).toLocaleString()}</p>
        </div>
        <span className="text-sm font-medium text-green-600">{revenue}</span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {bayData.map((row, rowIndex) => (
          <div key={rowIndex} className="space-y-2">
            {row.map((cell, cellIndex) => (
              <div
                key={`${rowIndex}-${cellIndex}`}
                className={`h-12 rounded border ${cell ? "border-gray-400" : "border-gray-200"}`}
                style={{
                  backgroundColor: cell ? getContainerColor(cell) : "transparent",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShipBayVisualization;
