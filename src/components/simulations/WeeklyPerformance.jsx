const WeeklyPerformance = ({ port }) => {
  const penaltyMatrix = {
    nonCommitted: {
      dry: 8000000,
      reefer: 16000000,
    },
    committed: {
      dry: 16000000,
      reefer: 24000000,
    },
    additional: 8000000,
  };

  const weeklyData = [
    {
      week: 1,
      rolledCommittedDry: 0,
      rolledCommittedReefer: 0,
      rolledNonCommittedDry: 10,
      rolledNonCommittedReefer: 3,
      restowBoxes: 4,
      restowPenalty: 12000000,
      longCraneMoves: 0,
      longCranePenalty: 0,
      totalPenalties: 140000000,
      totalRevenues: 211000000,
    },
    {
      week: 2,
      rolledCommittedDry: 0,
      rolledCommittedReefer: 5,
      rolledNonCommittedDry: 10,
      rolledNonCommittedReefer: 0,
      restowBoxes: 5,
      restowPenalty: 15000000,
      longCraneMoves: 0,
      longCranePenalty: 0,
      totalPenalties: 215000000,
      totalRevenues: 142000000,
    },
    // Add more weeks as needed
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Port Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-700">Port: {port}</h2>
      </div>

      {/* Penalty Matrix */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Rolling (containers not loaded) penalty matrix</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DRY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REEFER</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Non-committed</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(penaltyMatrix.nonCommitted.dry)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(penaltyMatrix.nonCommitted.reefer)}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Committed</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(penaltyMatrix.committed.dry)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(penaltyMatrix.committed.reefer)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-gray-500 italic">Note: An additional {formatCurrency(penaltyMatrix.additional)} per container for previously rolled containers</p>
      </div>

      {/* Operational Cost Tracking */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Operational Cost Tracking</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolled Committed Dry</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolled Committed Reefer</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolled Non-Committed Dry</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rolled Non-Committed Reefer</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restow Boxes</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restow Penalty</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Long Crane Moves</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Long Crane Penalty</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Penalties</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenues</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weeklyData.map((week) => (
                <tr key={week.week} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{week.week}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{week.rolledCommittedDry}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{week.rolledCommittedReefer}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{week.rolledNonCommittedDry}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{week.rolledNonCommittedReefer}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{week.restowBoxes}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(week.restowPenalty)}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{week.longCraneMoves}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(week.longCranePenalty)}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-red-600">{formatCurrency(week.totalPenalties)}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(week.totalRevenues)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Revenue Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
          <span className="text-xl font-bold text-green-600">{formatCurrency(749000000)}</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPerformance;
