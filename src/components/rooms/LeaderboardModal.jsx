const LeaderboardModal = ({ rankings, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Leaderboard</h2>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">Rank</th>
                <th className="px-4 py-2">Player</th>
                <th className="px-4 py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((rank, index) => (
                <tr key={rank.user.id} className={index === 0 ? "bg-yellow-100" : ""}>
                  <td className="px-4 py-2 text-center">{index + 1}</td>
                  <td className="px-4 py-2">{rank.user.name}</td>
                  <td className="px-4 py-2 text-right">${rank.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
