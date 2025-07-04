const BayStatisticsTable = ({
  // bayPairs = [],
  // idealCraneSplit = 2,
  // longCraneMoves = 0,
  // extraMovesOnLongCrane = 0,
  bayCount,
  bayMoves = {},
  totalMoves = 0,
  currentRound = 1,
  selectedWeek,
  setSelectedWeek,
  historicalStats,
  showHistorical,
  setShowHistorical,
  restowageMoves = 0,
  restowagePenalty = 0,
  restowageContainerCount = 0,
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
    totalMoves: historicalStats && typeof historicalStats.discharge_moves === "number" && typeof historicalStats.load_moves === "number" ? Number(historicalStats.discharge_moves) + Number(historicalStats.load_moves) : totalMoves,
    restowageMoves: historicalStats?.restowage_moves !== undefined ? Number(historicalStats.restowage_moves) : restowageMoves,
    restowagePenalty: historicalStats?.restowage_penalty !== undefined ? Number(historicalStats.restowage_penalty) : restowagePenalty,
    restowage_container_count: historicalStats?.restowage_container_count !== undefined ? Number(historicalStats.restowage_container_count) : restowageContainerCount,
    // bayPairs: historicalStats?.bay_pairs && historicalStats.bay_pairs !== "null" ? JSON.parse(historicalStats.bay_pairs) : bayPairs,
    // longCraneMoves: historicalStats?.long_crane_moves !== undefined ? Number(historicalStats.long_crane_moves) : longCraneMoves,
    // extraMovesOnLongCrane: historicalStats?.extra_moves_on_long_crane !== undefined ? Number(historicalStats.extra_moves_on_long_crane) : extraMovesOnLongCrane,
  };

  // Safely calculate ideal average moves per crane
  // const idealAverageMovesPerCrane = idealCraneSplit > 0 ? displayData.totalMoves / idealCraneSplit : 0;
  // const formattedAverage = isNaN(idealAverageMovesPerCrane) ? "0.00" : idealAverageMovesPerCrane.toFixed(2);

  const totalDisplayMoves = displayData.discharge_moves + displayData.load_moves;

  return (
    <div className="flex flex-col space-y-1">
      {/* Historical Data Controls - Only show if there are previous weeks */}
      {weekOptions.length > 0 && (
        <div className="flex items-center mb-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
          <label className="flex items-center gap-1 text-[8px] text-gray-700">
            <input type="checkbox" checked={showHistorical} onChange={(e) => setShowHistorical(e.target.checked)} className="rounded text-blue-600" />
            View historical data
          </label>

          {showHistorical && (
            <select value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))} className="ml-3 border border-gray-300 rounded px-2 py-1 text-[8px] bg-white" disabled={!showHistorical}>
              <option value={currentRound}>Current Week</option>
              {weekOptions.map((week) => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </select>
          )}

          {historicalStats && <div className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-[8px]">Viewing Week {selectedWeek} Data</div>}
        </div>
      )}

      {/* Main content - split into two tables */}
      <div className="flex flex-col md:flex-row gap-2 ">
        {/* Left Side: Summary Statistics Table */}
        <div className="md:w-50 flex-shrink-0">
          <table className="w-full border border-gray-200 text-[8px]">
            <tbody>
              <tr className="bg-gray-100">
                <td className="px-1 py-1 font-semibold border border-gray-200">Metric</td>
                <td className="px-1 py-1 font-semibold border border-gray-200 text-center">Value</td>
              </tr>
              <tr>
                <td className="px-1 py-1 font-medium border border-gray-200">Total Moves</td>
                <td className="px-1 py-1 text-center border border-gray-200">{displayData.totalMoves}</td>
              </tr>
              {/* <tr>
                <td className="px-1 py-1 font-medium border border-gray-200 bg-black">Crane Split</td>
                <td className="px-1 py-1 text-center border border-gray-200 bg-black">{idealCraneSplit}</td>
              </tr>
              <tr>
                <td className="px-1 py-1 font-medium border border-gray-200 bg-black">Avg Moves</td>
                <td className="px-1 py-1 text-center border border-gray-200 bg-black">{formattedAverage}</td>
              </tr>
              <tr>
                <td className="px-1 py-1 font-medium border border-gray-200 bg-black">Long Crane</td>
                <td className="px-1 py-1 text-center font-semibold border border-gray-200 bg-black">{displayData.longCraneMoves}</td>
              </tr>
              <tr>
                <td className="px-1 py-1 font-medium border border-gray-200 bg-black">Extra Moves</td>
                <td className="px-1 py-1 text-center border border-gray-200 bg-black">{displayData.extraMovesOnLongCrane}</td>
              </tr> */}
            </tbody>
          </table>
        </div>

        {/* Right Side: Bay Details Table with overflow handling */}
        <div className="flex-grow overflow-auto" style={{ maxHeight: "170px" }}>
          <table className="w-full border border-gray-200 text-[8px]">
            <tbody>
              {/* Bay Numbers Row */}
              <tr className="bg-gray-100 sticky top-0 z-10">
                <td className="px-1 py-1 font-semibold border border-gray-200 sticky left-0 bg-gray-100 z-20">Bay</td>
                {bayNumbers.map((number, index) => (
                  <td key={`bay-${index}`} className="px-1 py-1 text-center font-semibold border border-gray-200">
                    {number}
                  </td>
                ))}
              </tr>

              {/* Discharge Moves Row */}
              <tr>
                <td className="px-1 py-1 font-medium border border-gray-200 sticky left-0 bg-white z-10">Discharge</td>
                {bayNumbers.map((_, index) => (
                  <td key={`discharge-${index}`} className="px-1 py-1 text-center border border-gray-200 bg-yellow-200">
                    {displayData.bayMoves[index]?.discharge_moves || 0}
                  </td>
                ))}
              </tr>

              {/* Load Moves Row */}
              <tr>
                <td className="px-1 py-1 font-medium border border-gray-200 sticky left-0 bg-white z-10">Load</td>
                {bayNumbers.map((_, index) => (
                  <td key={`load-${index}`} className="px-1 py-1 text-center border border-gray-200 bg-yellow-200">
                    {displayData.bayMoves[index]?.load_moves || 0}
                  </td>
                ))}
              </tr>

              {/* Bay-Pair Row */}
              {/* <tr className="bg-blue-50">
                <td className="px-1 py-1 font-medium border border-gray-200 sticky left-0 bg-blue-50 z-10">Bay-Pair</td>
                {Array.isArray(displayData.bayPairs) && displayData.bayPairs.length > 0 ? (
                  displayData.bayPairs.map((pair, index) => (
                    <td
                      key={`pair-${index}`}
                      className={`px-1 py-1 text-center font-medium border border-gray-200 ${pair.total_moves === displayData.longCraneMoves && displayData.longCraneMoves > 0 ? "bg-blue-100" : ""}`}
                      colSpan={pair.bays && pair.bays.length === 1 ? 1 : 2}
                    >
                      {pair.bays ? (pair.bays.length === 1 ? getBayNumber(pair.bays[0]) : `${getBayNumber(pair.bays[0])}+${getBayNumber(pair.bays[1])}`) : "N/A"}
                    </td>
                  ))
                ) : (
                  <td colSpan={bayCount} className="px-1 py-1 text-center border border-gray-200">
                    No bay pairs available
                  </td>
                )}
              </tr> */}

              {/* Total Moves per Bay-Pair */}
              {/* <tr className="bg-blue-50">
                <td className="px-1 py-1 font-medium border border-gray-200 sticky left-0 bg-blue-50 z-10">Pair Moves</td>
                {Array.isArray(displayData.bayPairs) && displayData.bayPairs.length > 0 ? (
                  displayData.bayPairs.map((pair, index) => (
                    <td
                      key={`pair-moves-${index}`}
                      className={`px-1 py-1 text-center font-medium border border-gray-200 ${pair.total_moves === displayData.longCraneMoves && displayData.longCraneMoves > 0 ? "bg-blue-100" : ""}`}
                      colSpan={pair.bays && pair.bays.length === 1 ? 1 : 2}
                    >
                      {pair.total_moves || 0}
                    </td>
                  ))
                ) : (
                  <td colSpan={bayCount} className="px-1 py-1 text-center border border-gray-200">
                    No pair moves available
                  </td>
                )}
              </tr> */}

              {/* Long Crane Row */}
              {/* <tr className="bg-blue-50">
                <td className="px-1 py-1 font-medium border border-gray-200 sticky left-0 bg-blue-50 z-10">Long Crane</td>
                {Array.isArray(displayData.bayPairs) && displayData.bayPairs.length > 0 ? (
                  displayData.bayPairs.map((pair, index) => {
                    const isLongCrane = pair.total_moves === displayData.longCraneMoves && displayData.longCraneMoves > 0;
                    return (
                      <td key={`long-${index}`} className={`px-1 py-1 text-center font-medium border border-gray-200 ${isLongCrane ? "bg-blue-600 text-white" : ""}`} colSpan={pair.bays && pair.bays.length === 1 ? 1 : 2}>
                        {isLongCrane ? displayData.longCraneMoves : ""}
                      </td>
                    );
                  })
                ) : (
                  <td colSpan={bayCount} className="px-1 py-1 text-center border border-gray-200">
                    No long crane data available
                  </td>
                )}
              </tr> */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BayStatisticsTable;
