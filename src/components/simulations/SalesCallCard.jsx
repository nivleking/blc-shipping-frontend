const SalesCallCard = ({ salesCallCards, currentCardIndex, containers, formatIDR, handleAcceptCard, handleRejectCard, isProcessingCard }) => {
  if (!salesCallCards.length || currentCardIndex >= salesCallCards.length) {
    return null;
  }

  const currentCard = salesCallCards[currentCardIndex];
  const isCommitted = currentCard?.priority?.toLowerCase() === "committed";

  return (
    <div key={currentCard.id} className="bg-white rounded-lg shadow-md p-4 w-full">
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
            <td className="py-2">{currentCard.type}</td>
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
                      className={`p-2 border border-dashed border-gray-300 rounded text-center bg-${container.color}-500`}
                      style={{
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
