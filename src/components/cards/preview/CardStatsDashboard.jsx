import { useState, useEffect } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaShip, FaBoxOpen, FaDollarSign } from "react-icons/fa";

const CardStatsDashboard = ({ cards, containers, formatIDR }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalContainers: 0,
    totalCards: 0,
    portStats: {},
    typeStats: { dry: 0, reefer: 0 },
    priorityStats: { Committed: 0, "Non-Committed": 0 },
  });

  // Get color for revenue bars based on percentage
  const getBarColor = (percentage) => {
    if (percentage > 80) return "bg-green-500";
    if (percentage > 50) return "bg-blue-500";
    if (percentage > 30) return "bg-yellow-500";
    return "bg-gray-400";
  };

  // Calculate statistics when cards or containers change
  useEffect(() => {
    if (!cards || cards.length === 0) {
      setStatistics({
        totalRevenue: 0,
        totalContainers: 0,
        totalCards: 0,
        portStats: {},
        typeStats: { dry: 0, reefer: 0 },
        priorityStats: { Committed: 0, "Non-Committed": 0 },
      });
      return;
    }

    const totalCards = cards.length;
    const totalRevenue = cards.reduce((sum, card) => sum + card.revenue, 0);
    const totalContainers = cards.reduce((sum, card) => sum + card.quantity, 0);

    // Calculate port statistics
    const portStats = {};
    const typeStats = { dry: 0, reefer: 0 };
    const priorityStats = { Committed: 0, "Non-Committed": 0 };

    cards.forEach((card) => {
      // Port stats
      if (!portStats[card.origin]) {
        portStats[card.origin] = {
          cardCount: 0,
          revenue: 0,
          containers: 0,
        };
      }

      portStats[card.origin].cardCount += 1;
      portStats[card.origin].revenue += card.revenue;
      portStats[card.origin].containers += card.quantity;

      // Type stats
      if (card.type && card.type.toLowerCase() === "reefer") {
        typeStats.reefer += card.quantity;
      } else {
        typeStats.dry += card.quantity;
      }

      // Priority stats
      if (card.priority) {
        priorityStats[card.priority] += 1;
      }
    });

    setStatistics({
      totalRevenue,
      totalContainers,
      totalCards,
      portStats,
      typeStats,
      priorityStats,
    });
  }, [cards, containers]);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-800">Card Statistics Dashboard</span>
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{statistics.totalCards} Cards</div>
        </div>
        <div>{isExpanded ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}</div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Summary Stats */}
          <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500 rounded-lg mr-4">
                  <FaShip className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Cards</p>
                  <h3 className="text-2xl font-bold text-blue-900">{statistics.totalCards}</h3>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-green-500 rounded-lg mr-4">
                  <FaBoxOpen className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Total Containers</p>
                  <h3 className="text-2xl font-bold text-green-900">{statistics.totalContainers}</h3>
                  <div className="flex space-x-2 mt-1 text-xs">
                    <span className="bg-gray-200 px-2 py-0.5 rounded-full">Dry: {statistics.typeStats.dry}</span>
                    <span className="bg-blue-200 px-2 py-0.5 rounded-full">Reefer: {statistics.typeStats.reefer}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500 rounded-lg mr-4">
                  <FaDollarSign className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-yellow-900">{formatIDR(statistics.totalRevenue)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get color for port
const getPortColor = (port) => {
  const PORT_COLORS = {
    SBY: "#EF4444", // red
    MKS: "#3B82F6", // blue
    MDN: "#10B981", // green
    JYP: "#EAB308", // yellow
    BPN: "#8B5CF6", // purple
    BKS: "#F97316", // orange
    BGR: "#EC4899", // pink
    BTH: "#92400E", // brown
    AMQ: "#06B6D4", // cyan
    SMR: "#059669", // teal
  };

  return PORT_COLORS[port] || "#64748B"; // default slate color
};

export default CardStatsDashboard;
