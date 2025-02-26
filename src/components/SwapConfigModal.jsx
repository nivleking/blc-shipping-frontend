import React, { useState, useEffect } from "react";
import { HiX } from "react-icons/hi";
import SwapDiagram from "./SwapDiagram";

const SwapConfigModal = ({ isOpen, onClose, deckOrigins = [], onSave }) => {
  const [swapConfig, setSwapConfig] = useState({});
  const [origins, setOrigins] = useState([]);

  // Reset swapConfig when modal opens and process deckOrigins
  useEffect(() => {
    if (isOpen) {
      setSwapConfig({});
      // Ensure deckOrigins is processed as an array
      setOrigins(Array.isArray(deckOrigins) ? deckOrigins : []);
      console.log(deckOrigins);
    }
  }, [isOpen, deckOrigins]);

  const handleSwapChange = (originPort, targetPort) => {
    setSwapConfig((prev) => ({
      ...prev,
      [originPort]: targetPort,
    }));
  };

  // Validate if all ports have been assigned
  const isValidConfig = () => {
    return origins.length > 0 && origins.every((origin) => swapConfig[origin]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Configure Port Swapping</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <HiX className="h-6 w-6" />
            </button>
          </div>

          {/* Render SwapDiagram sebagai komponen terpisah */}
          {origins.length > 0 && <SwapDiagram origins={origins} swapConfig={swapConfig} />}

          {origins.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No ports available for configuration</div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {origins.map((originPort) => (
                <div key={originPort} className="flex items-center gap-4">
                  <span className="font-medium min-w-[100px]">{originPort}</span>
                  <span className="text-gray-500">→</span>
                  <select className="flex-1 rounded-lg border border-gray-300 p-2" value={swapConfig[originPort] || ""} onChange={(e) => handleSwapChange(originPort, e.target.value)}>
                    <option value="">Select destination</option>
                    {origins
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
          )}
          <div className="mt-6 flex justify-end gap-4">
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
