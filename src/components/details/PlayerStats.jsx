import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const PlayerStats = ({ players, formatIDR }) => {
  return (
    <div className="space-y-8">
      {/* Player Selection */}
      <div className="flex justify-between items-center">
        <select className="form-select rounded-lg border-gray-300">
          <option value="">All Players</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
        {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Export Stats</button> */}
      </div>

      {/* Individual Player Stats */}
      <div className="">
        {players.map((player) => (
          <div key={player.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{player.name}</h3>
                <p className="text-sm text-gray-500">Port: {player.port}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Rank</p>
                <p className="text-2xl font-bold text-blue-600">#{player.rank}</p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-700">Revenue</h4>
                <p className="text-2xl font-bold text-green-800">{formatIDR(player.revenue)}</p>
                <p className="text-xs text-green-600 mt-1">+{player.revenue_growth}% from last week</p>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-700">Penalties</h4>
                <p className="text-2xl font-bold text-red-800">{formatIDR(player.penalties)}</p>
                <p className="text-xs text-red-600 mt-1">{player.total_penalties} incidents</p>
              </div>
            </div>

            {/* Sales Cards Performance */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Sales Cards Activity</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{player.total_cards}</p>
                  <p className="text-xs text-gray-600">Total Cards</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{player.cards_accepted}</p>
                  <p className="text-xs text-gray-600">Accepted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{player.cards_rejected}</p>
                  <p className="text-xs text-gray-600">Rejected</p>
                </div>
              </div>
            </div>

            {/* Container Handling */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Container Management</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{player.total_containers}</p>
                  <p className="text-xs text-gray-600">Total Containers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{player.containers_rolled}</p>
                  <p className="text-xs text-gray-600">Rolled Containers</p>
                </div>
              </div>
            </div>

            {/* Weekly Performance Chart */}
            <div className="h-64">
              <Line
                data={{
                  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
                  datasets: [
                    {
                      label: "Revenue",
                      data: player.weekly_revenue,
                      borderColor: "rgb(34, 197, 94)",
                      tension: 0.1,
                    },
                    {
                      label: "Penalties",
                      data: player.weekly_penalties,
                      borderColor: "rgb(239, 68, 68)",
                      tension: 0.1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStats;
