import { PORT_COLORS, getPortColor } from "../../../assets/Colors";

const PortLegendCards = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="text-sm font-medium mb-2 text-gray-700 text-end">Destination Port Legend</div>
      <div className="flex flex-wrap justify-end gap-3">
        {Object.entries(PORT_COLORS).map(([port, color]) => (
          <div key={port} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-600">{port}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortLegendCards;
