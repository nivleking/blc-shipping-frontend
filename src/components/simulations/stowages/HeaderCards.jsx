import { useContext, useState } from "react";
import { AppContext } from "../../../context/AppContext";

const HeaderCards = ({ roomId, revenue, penalties, rank, section, port, formatIDR, moves = {}, currentRound = 1, totalRounds = 1, moveCost, dockWarehouseCost, restowageCost }) => {
  const { user } = useContext(AppContext);
  const [showExpenses, setShowExpenses] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm font-medium opacity-80">Revenue</p>
            <h3 className="text-2xl font-bold">{formatIDR(revenue)}</h3>
            <div className="flex gap-4 mt-1">
              <div>
                <p className="text-xs opacity-80">Accepted Cards</p>
                <p className="text-xl font-bold">{moves.acceptedCards || 0}</p>
              </div>
              <div>
                <p className="text-xs opacity-80">Rejected Cards</p>
                <p className="text-xl font-bold">{moves.rejectedCards || 0}</p>
              </div>
            </div>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Penalties Card */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 shadow-xl relative">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm font-medium opacity-80">Expenses</p>
            <h3 className="text-2xl font-bold">{formatIDR(penalties)}</h3>

            {/* Toggle untuk detail expenses */}
            <button onClick={() => setShowExpenses(!showExpenses)} className="text-xs font-bold underline mt-1 text-white/80 hover:text-white">
              {showExpenses ? "Hide details" : "Show details"}
            </button>
          </div>

          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Dropdown detail */}
        {showExpenses && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-red-700 z-10 p-3 rounded-lg shadow-lg animate-fadeIn">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex justify-between">
                <span className="text-white text-xs">Move Cost:</span>
                <span className="text-white text-xs font-bold">{formatIDR(moveCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white text-xs">Dock Warehouse Cost:</span>
                <span className="text-white text-xs font-bold">{formatIDR(dockWarehouseCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white text-xs">Restowage Cost:</span>
                <span className="text-white text-xs font-bold">{formatIDR(restowageCost)}</span>
              </div>
              {/* <div className="flex justify-between">
                <span className="text-white text-xs">Extra Moves:</span>
                <span className="text-white text-xs font-bold">{formatIDR(extraMovesCost)}</span>
              </div> */}
            </div>
          </div>
        )}
      </div>

      {/* Rank Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm opacity-80">Total Revenue</p>
            <p className="text-2xl font-bold">{formatIDR(revenue - penalties) || 0}</p>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Section Card */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm font-medium opacity-80">Section</p>
            <h3 className="text-2xl font-bold">Section {section === 1 ? "Unload" : "Sales Call"}</h3>
            <p className="text-sm font-medium">
              Week {currentRound} of {totalRounds}
            </p>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Port Card */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm font-medium opacity-80">Room {roomId}</p>
            <h3 className="text-2xl font-bold">
              {port} - {user && user.name}
            </h3>
            <div className="flex gap-4 mt-1">
              <div>
                <p className="text-xs opacity-80">Load Moves</p>
                <p className="text-xl font-bold">{moves.loadMoves || 0}</p>
              </div>
              <div>
                <p className="text-xs opacity-80">Discharge Moves</p>
                <p className="text-xl font-bold">{moves.dischargeMoves || 0}</p>
              </div>
            </div>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderCards;
