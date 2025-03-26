const BayStatisticsTable = ({
  bayCount,
  bayMoves = {},
  bayPairs = [],
  totalMoves = 0,
  idealCraneSplit = 2,
  longCraneMoves = 0,
  extraMovesOnLongCrane = 0,
  currentRound = 1,
  selectedWeek,
  setSelectedWeek,
  historicalStats,
  showHistorical,
  setShowHistorical,
}) => {
  const getBayNumber = (index) => {
    return index + 1;
  };

  const bayNumbers = Array.from({ length: bayCount }).map((_, index) => getBayNumber(index));

  const weekOptions = [];
  for (let i = 1; i < currentRound; i++) {
    weekOptions.push(i);
  }

  // Process display data with proper null/undefined handling
  const displayData = {
    bayMoves: historicalStats?.bay_moves && historicalStats.bay_moves !== "null" ? JSON.parse(historicalStats.bay_moves) : bayMoves,
    bayPairs: historicalStats?.bay_pairs && historicalStats.bay_pairs !== "null" ? JSON.parse(historicalStats.bay_pairs) : bayPairs,
    totalMoves: historicalStats && typeof historicalStats.discharge_moves === "number" && typeof historicalStats.load_moves === "number" ? Number(historicalStats.discharge_moves) + Number(historicalStats.load_moves) : totalMoves,
    longCraneMoves: historicalStats?.long_crane_moves !== undefined ? Number(historicalStats.long_crane_moves) : longCraneMoves,
    extraMovesOnLongCrane: historicalStats?.extra_moves_on_long_crane !== undefined ? Number(historicalStats.extra_moves_on_long_crane) : extraMovesOnLongCrane,
  };

  // Safely calculate ideal average moves per crane
  const idealAverageMovesPerCrane = idealCraneSplit > 0 ? displayData.totalMoves / idealCraneSplit : 0;
  const formattedAverage = isNaN(idealAverageMovesPerCrane) ? "0.00" : idealAverageMovesPerCrane.toFixed(2);

  return (
    <div className="flex flex-col space-y-4">
      {/* Historical Data Controls - Only show if there are previous weeks */}
      {weekOptions.length > 0 && (
        <div className="flex items-center mb-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input type="checkbox" checked={showHistorical} onChange={(e) => setShowHistorical(e.target.checked)} className="rounded text-blue-600" />
            View historical data
          </label>

          {showHistorical && (
            <select value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))} className="ml-3 border border-gray-300 rounded px-2 py-1 text-xs bg-white" disabled={!showHistorical}>
              <option value={currentRound}>Current Week</option>
              {weekOptions.map((week) => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </select>
          )}

          {historicalStats && <div className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Viewing Week {selectedWeek} Data</div>}
        </div>
      )}

      {/* Main content - split into two tables */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Side: Summary Statistics Table */}
        <div className="md:w-48 flex-shrink-0">
          <table className="w-full border border-gray-200 text-xs">
            <tbody>
              <tr className="bg-gray-100">
                <td className="px-1.5 py-1 font-semibold border border-gray-200">Metric</td>
                <td className="px-1.5 py-1 font-semibold border border-gray-200 text-center">Value</td>
              </tr>
              <tr>
                <td className="px-1.5 py-1 font-medium border border-gray-200">Total Moves</td>
                <td className="px-1.5 py-1 text-center border border-gray-200">{displayData.totalMoves}</td>
              </tr>
              <tr>
                <td className="px-1.5 py-1 font-medium border border-gray-200">Crane Split</td>
                <td className="px-1.5 py-1 text-center border border-gray-200">{idealCraneSplit}</td>
              </tr>
              <tr>
                <td className="px-1.5 py-1 font-medium border border-gray-200">Avg Moves</td>
                <td className="px-1.5 py-1 text-center border border-gray-200">{formattedAverage}</td>
              </tr>
              <tr>
                <td className="px-1.5 py-1 font-medium border border-gray-200">Long Crane</td>
                <td className="px-1.5 py-1 text-center bg-blue-600 text-white font-semibold border border-gray-200">{displayData.longCraneMoves}</td>
              </tr>
              <tr>
                <td className="px-1.5 py-1 font-medium border border-gray-200">Extra Moves</td>
                <td className="px-1.5 py-1 text-center border border-gray-200">{displayData.extraMovesOnLongCrane}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Side: Bay Details Table with overflow handling */}
        <div className="flex-grow overflow-auto" style={{ maxHeight: "280px" }}>
          <table className="w-full border border-gray-200 text-xs">
            <tbody>
              {/* Bay Numbers Row */}
              <tr className="bg-gray-100 sticky top-0 z-10">
                <td className="px-1.5 py-1 font-semibold border border-gray-200 sticky left-0 bg-gray-100 z-20">Bay</td>
                {bayNumbers.map((number, index) => (
                  <td key={`bay-${index}`} className="px-1.5 py-1 text-center font-semibold border border-gray-200">
                    {number}
                  </td>
                ))}
              </tr>

              {/* Discharge Moves Row */}
              <tr>
                <td className="px-1.5 py-1 font-medium border border-gray-200 sticky left-0 bg-white z-10">Discharge</td>
                {bayNumbers.map((_, index) => (
                  <td key={`discharge-${index}`} className="px-1.5 py-1 text-center border border-gray-200 bg-yellow-200">
                    {displayData.bayMoves[index]?.discharge_moves || 0}
                  </td>
                ))}
              </tr>

              {/* Load Moves Row */}
              <tr>
                <td className="px-1.5 py-1 font-medium border border-gray-200 sticky left-0 bg-white z-10">Load</td>
                {bayNumbers.map((_, index) => (
                  <td key={`load-${index}`} className="px-1.5 py-1 text-center border border-gray-200 bg-yellow-200">
                    {displayData.bayMoves[index]?.load_moves || 0}
                  </td>
                ))}
              </tr>

              {/* Restowage Boxes Row */}
              <tr>
                <td className="px-1.5 py-1 font-medium border border-gray-200 sticky left-0 bg-white z-10">Restow Boxes</td>
                {bayNumbers.map((_, index) => (
                  <td key={`restowage-boxes-${index}`} className="px-1.5 py-1 text-center border border-gray-200 bg-black">
                    0
                  </td>
                ))}
              </tr>

              {/* Restowage Moves Row */}
              <tr>
                <td className="px-1.5 py-1 font-medium border border-gray-200 sticky left-0 bg-white z-10">Restow Moves</td>
                {bayNumbers.map((_, index) => (
                  <td key={`restowage-moves-${index}`} className="px-1.5 py-1 text-center border border-gray-200 bg-black">
                    0
                  </td>
                ))}
              </tr>

              {/* Total Moves Row */}
              <tr className="bg-gray-50">
                <td className="px-1.5 py-1 font-medium border border-gray-200 sticky left-0 bg-gray-50 z-10">Total Moves</td>
                {bayNumbers.map((_, index) => {
                  const totalBayMoves = (displayData.bayMoves[index]?.discharge_moves || 0) + (displayData.bayMoves[index]?.load_moves || 0);
                  return (
                    <td key={`total-${index}`} className="px-1.5 py-1 text-center font-medium border border-gray-200">
                      {totalBayMoves}
                    </td>
                  );
                })}
              </tr>

              {/* Bay-Pair Row */}
              <tr className="bg-blue-50">
                <td className="px-1.5 py-1 font-medium border border-gray-200 sticky left-0 bg-blue-50 z-10">Bay-Pair</td>
                {Array.isArray(displayData.bayPairs) && displayData.bayPairs.length > 0 ? (
                  displayData.bayPairs.map((pair, index) => (
                    <td
                      key={`pair-${index}`}
                      className={`px-1.5 py-1 text-center font-medium border border-gray-200 ${pair.total_moves === displayData.longCraneMoves && displayData.longCraneMoves > 0 ? "bg-blue-100" : ""}`}
                      colSpan={pair.bays && pair.bays.length === 1 ? 1 : 2}
                    >
                      {pair.bays ? (pair.bays.length === 1 ? getBayNumber(pair.bays[0]) : `${getBayNumber(pair.bays[0])}+${getBayNumber(pair.bays[1])}`) : "N/A"}
                    </td>
                  ))
                ) : (
                  <td colSpan={bayCount} className="px-1.5 py-1 text-center border border-gray-200">
                    No bay pairs available
                  </td>
                )}
              </tr>

              {/* Total Moves per Bay-Pair */}
              <tr className="bg-blue-50">
                <td className="px-1.5 py-1 font-medium border border-gray-200 sticky left-0 bg-blue-50 z-10">Pair Moves</td>
                {Array.isArray(displayData.bayPairs) && displayData.bayPairs.length > 0 ? (
                  displayData.bayPairs.map((pair, index) => (
                    <td
                      key={`pair-moves-${index}`}
                      className={`px-1.5 py-1 text-center font-medium border border-gray-200 ${pair.total_moves === displayData.longCraneMoves && displayData.longCraneMoves > 0 ? "bg-blue-100" : ""}`}
                      colSpan={pair.bays && pair.bays.length === 1 ? 1 : 2}
                    >
                      {pair.total_moves || 0}
                    </td>
                  ))
                ) : (
                  <td colSpan={bayCount} className="px-1.5 py-1 text-center border border-gray-200">
                    No pair moves available
                  </td>
                )}
              </tr>

              {/* Long Crane Row */}
              <tr className="bg-blue-50">
                <td className="px-1.5 py-1 font-medium border border-gray-200 sticky left-0 bg-blue-50 z-10">Long Crane</td>
                {Array.isArray(displayData.bayPairs) && displayData.bayPairs.length > 0 ? (
                  displayData.bayPairs.map((pair, index) => {
                    const isLongCrane = pair.total_moves === displayData.longCraneMoves && displayData.longCraneMoves > 0;
                    return (
                      <td key={`long-${index}`} className={`px-1.5 py-1 text-center font-medium border border-gray-200 ${isLongCrane ? "bg-blue-600 text-white" : ""}`} colSpan={pair.bays && pair.bays.length === 1 ? 1 : 2}>
                        {isLongCrane ? displayData.longCraneMoves : ""}
                      </td>
                    );
                  })
                ) : (
                  <td colSpan={bayCount} className="px-1.5 py-1 text-center border border-gray-200">
                    No long crane data available
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BayStatisticsTable;
