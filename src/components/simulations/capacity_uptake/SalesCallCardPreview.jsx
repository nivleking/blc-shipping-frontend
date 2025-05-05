import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const SalesCallCardPreview = ({ card, containers, mousePosition }) => {
  const [position, setPosition] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mousePosition) {
      setPosition(mousePosition);
      setMounted(true);
      return;
    }

    // Otherwise, track mouse position internally
    function updatePosition(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }

    document.addEventListener("mousemove", updatePosition);
    setMounted(true);

    return () => {
      document.removeEventListener("mousemove", updatePosition);
    };
  }, [mousePosition]);

  // Effect to calculate position based on mouse position
  useEffect(() => {
    function updatePosition(e) {
      // Position the card above the cursor, centered horizontally
      setPosition({
        x: e.clientX,
        y: e.clientY - 20,
      });
    }

    document.addEventListener("mousemove", updatePosition);
    setMounted(true);

    return () => {
      document.removeEventListener("mousemove", updatePosition);
    };
  }, []);

  if (!card) return null;

  // Format revenue as IDR
  const formatIDR = (value) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  };

  // Determine if card is committed and/or backlog
  const isCommitted = card.priority?.toLowerCase() === "committed";
  const isBacklog = card.is_backlog;
  const originalRound = card.original_round;

  if (!mounted) return null;

  // Calculate best position to avoid card going off-screen
  const cardWidth = 270; // Width of your card in pixels
  const xPos = Math.min(Math.max(position.x - cardWidth / 2, 10), window.innerWidth - cardWidth - 10);

  // Render the card in a portal
  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        top: `${Math.max(position.y - 300, 10)}px`, // Position above cursor with a minimum top margin
        left: `${xPos}px`,
        transition: "top 0.1s ease, left 0.1s ease",
      }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-[270px]">
        {/* Indicator if this is a backlog committed card */}
        {isBacklog && (
          <div className="mb-2 p-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[9px] font-medium text-amber-700">Committed Backlog from Week {originalRound}</p>
            </div>
          </div>
        )}

        <table className="min-w-full divide-y divide-gray-200 text-[9px]">
          <tbody>
            <tr className="font-bold">
              <td>{card.origin}</td>
              <td>
                Booking {card.id}
                {isCommitted && <span className="ml-1 bg-yellow-100 text-yellow-800 text-[9px] px-1 py-0.5 rounded-full border border-yellow-300">COMMITED!</span>}
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <hr />
              </td>
            </tr>
            <tr>
              <td className="font-medium py-1">Type:</td>
              <td className="py-1">{(card.type || "dry").toUpperCase()}</td>
            </tr>
            <tr>
              <td className="font-medium py-1">Priority:</td>
              <td className="py-1">{card.priority || "Non-Committed"}</td>
            </tr>
            <tr>
              <td className="font-medium py-1">Origin:</td>
              <td className="py-1">{card.origin}</td>
            </tr>
            <tr>
              <td className="font-medium py-1">Destination:</td>
              <td className="py-1">{card.destination}</td>
            </tr>
            <tr>
              <td className="font-medium py-1">Quantity:</td>
              <td className="py-1">{card.quantity}</td>
            </tr>
            <tr>
              <td className="font-medium py-1">Revenue/Container:</td>
              <td className="py-1">{formatIDR((card.revenue || 0) / (card.quantity || 1))}</td>
            </tr>
            <tr>
              <td className="font-medium py-1">Total Revenue:</td>
              <td className="py-1">{formatIDR(card.revenue || 0)}</td>
            </tr>
            <tr>
              <td colSpan={2} className="font-medium py-1 text-center">
                Containers
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="py-1">
                <div className="grid grid-cols-8 gap-1 items-center">
                  {containers
                    ?.filter((container) => container.card_id === card.id)
                    .map((container) => (
                      <div
                        key={container.id}
                        className="p-1 border border-dashed border-gray-300 rounded text-center text-[6px]"
                        style={{
                          backgroundColor: container.color,
                          backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 0.5px, black 1px, black 1px)",
                          backgroundSize: "8px 8px",
                          color: container.color === "yellow" ? "black" : "white",
                        }}
                      >
                        {container.id}
                      </div>
                    ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>,
    document.body
  );
};

export default SalesCallCardPreview;
