const PenaltiesPanel = ({ penalties, moveCost, formatCurrency }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-3">
      <h3 className="text-base font-semibold mb-3 text-red-600">Container Rolling Penalties</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Container Type</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Non-Committed</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Committed</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="hover:bg-gray-50">
              <td className="px-3 py-2 text-sm font-medium text-gray-900">Dry</td>
              <td className="px-3 py-2 text-sm text-right text-red-600">{formatCurrency(penalties.dry_non_committed || 0)}</td>
              <td className="px-3 py-2 text-sm text-right text-red-600">{formatCurrency(penalties.dry_committed || 0)}</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-3 py-2 text-sm font-medium text-gray-900">Reefer</td>
              <td className="px-3 py-2 text-sm text-right text-red-600">{formatCurrency(penalties.reefer_non_committed || 0)}</td>
              <td className="px-3 py-2 text-sm text-right text-red-600">{formatCurrency(penalties.reefer_committed || 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2 text-gray-700">Move Penalties:</h4>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Load Move:</p>
              <p className="text-base font-semibold text-red-600">{formatCurrency(moveCost)}</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Discharge Move:</p>
              <p className="text-base font-semibold text-red-600">{formatCurrency(moveCost)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenaltiesPanel;
