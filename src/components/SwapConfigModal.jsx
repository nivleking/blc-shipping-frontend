import React, { useState, useEffect } from "react";
import { HiX } from "react-icons/hi";
import SwapDiagram from "./SwapDiagram";

const SwapConfigModal = ({ isOpen, onClose, deckOrigins, onSave, initialConfig = {} }) => {
  const [swapConfig, setSwapConfig] = useState({});

  // Initialize with initialConfig when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialConfig && Object.keys(initialConfig).length > 0) {
        setSwapConfig(initialConfig);
      } else {
        setSwapConfig({}); // Reset when no initialConfig provided
      }
    }
  }, [initialConfig, isOpen]);

  const handleSwapChange = (originPort, targetPort) => {
    setSwapConfig((prev) => ({
      ...prev,
      [originPort]: targetPort,
    }));
  };

  // Validate if all ports have been assigned a unique destination
  const isValidConfig = () => {
    if (!deckOrigins || deckOrigins.length === 0) return false;

    // All origins should have a destination
    const allOriginsAssigned = deckOrigins.every((origin) => swapConfig[origin]);

    // All destinations should be unique (no duplicate targets)
    const destinations = Object.values(swapConfig);
    const uniqueDestinations = new Set(destinations);
    const noduplicateDestinations = destinations.length === uniqueDestinations.size;

    return allOriginsAssigned && noduplicateDestinations;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg max-w-5xl w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Configure Port Swapping</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <HiX className="h-6 w-6" />
            </button>
          </div>

          <div className="p-3 bg-blue-50 rounded-md mb-4">
            <p className="text-sm text-blue-700">Configure how ports will be swapped each week. This configuration will persist until manually changed.</p>
          </div>

          {!deckOrigins || deckOrigins.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No ports available for configuration</div>
          ) : (
            <div className="flex flex-col md:flex-row md:space-x-6">
              {/* Form section */}
              <div className="md:w-1/2 space-y-4 max-h-[60vh] overflow-y-auto pr-2 order-2 md:order-1">
                <h4 className="font-medium text-gray-700 mb-2">Port Assignment</h4>
                {deckOrigins.map((originPort) => (
                  <div key={originPort} className="flex items-center gap-4 bg-white p-3 rounded-lg border">
                    <span className="font-medium min-w-[100px]">{originPort}</span>
                    <span className="text-gray-500">→</span>
                    <select className="flex-1 rounded-lg border border-gray-300 p-2" value={swapConfig[originPort] || ""} onChange={(e) => handleSwapChange(originPort, e.target.value)}>
                      <option value="">Select destination</option>
                      {deckOrigins
                        .filter((port) => port !== originPort)
                        .map((port) => (
                          <option key={port} value={port} disabled={Object.values(swapConfig).includes(port) && swapConfig[originPort] !== port}>
                            {port}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Visualization section */}
              <div className="md:w-1/2 bg-gray-50 rounded-lg order-1 md:order-2 mb-6 md:mb-0">{deckOrigins && deckOrigins.length > 0 && <SwapDiagram origins={deckOrigins} swapConfig={swapConfig} />}</div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-4 border-t pt-4">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
            <button onClick={() => onSave(swapConfig)} disabled={!isValidConfig()} className={`px-4 py-2 text-white rounded-lg ${isValidConfig() ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"}`}>
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapConfigModal;
