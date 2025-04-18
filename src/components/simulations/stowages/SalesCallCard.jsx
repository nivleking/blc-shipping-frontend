import PortLegendSimulation from "./PortLegendSimulation";

const SalesCallCard = ({ salesCallCards, currentCardIndex, containers, formatIDR, handleAcceptCard, handleRejectCard, isProcessingCard, isCardVisible, processedCards, mustProcessCards, cardsLimit, isLimitExceeded, onRefreshCards }) => {
  // Cek apakah tidak ada kartu yang tersedia
  const noCardsAvailable = !salesCallCards.length || currentCardIndex >= salesCallCards.length;

  // Tentukan jenis tampilan berdasarkan status kartu dan batas
  const showLimitExceededMessage = isLimitExceeded;
  const showNoCardsMessage = noCardsAvailable && !isLimitExceeded;

  // Jika tidak ada kartu tersedia (menampilkan salah satu dari dua state)
  if (showLimitExceededMessage || showNoCardsMessage) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-gray-500 text-center mb-4">
          <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d={
                showLimitExceededMessage
                  ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  : "M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              }
            />
          </svg>
          <h3 className="text-lg font-semibold">{showLimitExceededMessage ? "Anda telah mencapai batas maksimum kartu untuk ronde ini" : "Tidak ada kartu tersedia"}</h3>
          <p className="text-sm mt-1">{showLimitExceededMessage ? `Anda telah memproses ${processedCards} dari ${mustProcessCards} kartu yang diperlukan` : "Silakan coba refresh untuk melihat apakah ada kartu baru"}</p>
        </div>

        {/* Tombol refresh hanya muncul ketika tidak ada kartu DAN belum mencapai batas */}
        {showNoCardsMessage && (
          <button onClick={onRefreshCards} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Kartu
            </div>
          </button>
        )}
      </div>
    );
  }

  // Jika ada kartu untuk ditampilkan
  const currentCard = salesCallCards[currentCardIndex];
  const isBacklog = currentCard?.is_backlog;
  const originalRound = currentCard?.original_round;
  const isCommitted = currentCard?.priority?.toLowerCase() === "committed";
  const processPercentage = (processedCards / mustProcessCards) * 100;

  return (
    <div key={currentCard.id} className="bg-white rounded-lg shadow-md p-4 w-full">
      {/* Progress Information */}
      <div className="mb-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Processed Cards:</span>{" "}
            <span className={processedCards >= mustProcessCards ? "text-green-600 font-bold" : "text-blue-600"}>
              {processedCards} / {mustProcessCards}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Cards Limit:</span> {cardsLimit}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all duration-300 ${processedCards >= mustProcessCards ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${Math.min(processPercentage, 100)}%` }} />
        </div>

        {/* Status Message */}
        {processedCards >= mustProcessCards ? (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">✓ Required cards processed - remaining cards are optional</div>
        ) : (
          <div className="text-sm text-blue-600">Need to process {mustProcessCards - processedCards} more required cards</div>
        )}
      </div>

      {/* Indicator if this is a backlog committed card */}
      {isBacklog && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-amber-700">Committed Backlog from Week {originalRound}</p>
          </div>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <tbody>
          <tr className="font-bold">
            <td>{currentCard.origin}</td>
            <td>
              Booking {currentCard.id}
              {isCommitted && <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full border border-yellow-300">COMMITED!</span>}
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <hr />
            </td>
          </tr>
          <tr>
            <td className="font-medium py-2">Type:</td>
            <td className="py-2">{currentCard.type.toUpperCase()}</td>
          </tr>
          <tr>
            <td className="font-medium py-2">Priority:</td>
            <td className="py-2">{currentCard.priority}</td>
          </tr>
          <tr>
            <td className="font-medium py-2">Origin:</td>
            <td className="py-2">{currentCard.origin}</td>
          </tr>
          <tr>
            <td className="font-medium py-2">Destination:</td>
            <td className="py-2">{currentCard.destination}</td>
          </tr>
          <tr>
            <td className="font-medium py-2">Quantity:</td>
            <td className="py-2">{currentCard.quantity}</td>
          </tr>
          <tr>
            <td className="font-medium py-2">Revenue/Container:</td>
            <td className="py-2">{formatIDR(currentCard.revenue / currentCard.quantity)}</td>
          </tr>
          <tr>
            <td className="font-medium py-2">Total Revenue:</td>
            <td className="py-2">{formatIDR(currentCard.revenue)}</td>
          </tr>
          <tr>
            <td colSpan={2} className="font-medium py-2 text-center">
              Containers
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="py-2">
              <div className="grid grid-cols-3 gap-2">
                {containers
                  .filter((container) => container.card_id === currentCard.id)
                  .map((container) => (
                    <div
                      key={container.id}
                      className={`p-2 border border-dashed border-gray-300 rounded text-center `}
                      style={{
                        backgroundColor: container.color,
                        backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 0.5px, black 1px, black 1px)",
                        backgroundSize: "10px 10px",
                        color: container.color === "yellow" ? "black" : "white",
                      }}
                    >
                      {container.id}
                    </div>
                  ))}
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="font-medium py-2 text-center">
              <button
                onClick={() => handleAcceptCard(currentCard.id)}
                disabled={isProcessingCard}
                className={`p-2 bg-green-500 text-white rounded mr-2 transition-opacity
                  ${isProcessingCard ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"}
                `}
              >
                {isProcessingCard ? "Processing..." : "Accept"}
              </button>
              <button
                onClick={() => handleRejectCard(currentCard.id)}
                disabled={isProcessingCard || isCommitted}
                className={`p-2 bg-red-500 text-white rounded transition-opacity
                  ${isProcessingCard || isCommitted ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"}
                `}
                title={isCommitted ? "Committed bookings cannot be rejected" : ""}
              >
                {isProcessingCard ? "Please wait..." : "Reject"}
              </button>
              {isCommitted && <div className="text-xs text-gray-500 mt-2">* This is a committed booking and must be accepted</div>}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SalesCallCard;
