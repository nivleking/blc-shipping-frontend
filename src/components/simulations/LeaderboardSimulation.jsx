import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { api } from "../../axios/axios";

const LeaderboardSimulation = ({ roomId, formatIDR, onRankingsUpdate }) => {
  const { user, token } = useContext(AppContext);
  const [rankings, setRankings] = useState([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);

  const fetchRankings = async () => {
    try {
      setIsLeaderboardLoading(true);
      const response = await api.get(`/rooms/${roomId}/rankings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRankings(response.data);
      if (onRankingsUpdate) {
        onRankingsUpdate(response.data);
      }
      setIsLeaderboardLoading(false);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      setIsLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    if (roomId && token) {
      fetchRankings();

      // Set up periodic refresh
      // const interval = setInterval(() => {
      //   fetchRankings();
      // }, 10000); // Refresh every 10 seconds

      // return () => clearInterval(interval);
    }
  }, [roomId, token]);

  if (isLeaderboardLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Rankings</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Revenue
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Move Penalty
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Extra Moves
              </th>

              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Moves
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cards
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rankings.map((ranking, index) => (
              <tr key={ranking.user_id} className={ranking.user_id === user?.id ? "bg-blue-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
            ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-700" : "bg-gray-300"}`}
                    >
                      {index + 1}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{ranking.user_name}</div>
                  {ranking.user_id === user?.id && <span className="text-xs text-blue-600">(You)</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-bold text-gray-900">{formatIDR(ranking.total_revenue)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-green-600 font-medium">{formatIDR(ranking.revenue)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-red-600 font-medium">-{formatIDR(ranking.penalty || 0)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-red-600 font-medium">-{formatIDR(ranking.extra_moves_penalty || 0)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-col text-sm text-gray-500">
                    <span>D: {ranking.discharge_moves || 0}</span>
                    <span>L: {ranking.load_moves || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex flex-col text-sm">
                    <span className="text-green-600">A: {ranking.accepted_cards || 0}</span>
                    <span className="text-red-600">R: {ranking.rejected_cards || 0}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rankings.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No rankings available yet.</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardSimulation;
