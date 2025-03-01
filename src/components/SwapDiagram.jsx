import React, { useState, useEffect } from "react";
import { HiX, HiExclamation } from "react-icons/hi";

// Komponen terpisah untuk diagram
const SwapDiagram = ({ origins, swapConfig }) => {
  const [activeTab, setActiveTab] = useState("grid");
  const [unassignedPorts, setUnassignedPorts] = useState([]);

  // Check unassigned ports whenever swapConfig changes
  useEffect(() => {
    const notAssigned = origins.filter((port) => !swapConfig[port]);
    setUnassignedPorts(notAssigned);
  }, [origins, swapConfig]);

  // Helper untuk mendapatkan chain/rantai port swapping
  const getSwapChains = () => {
    const chains = [];
    const visited = new Set();

    origins.forEach((origin) => {
      if (!visited.has(origin)) {
        const chain = [];
        let current = origin;
        let counter = 0;
        while (current && !visited.has(current) && counter < origins.length + 1) {
          chain.push(current);
          visited.add(current);
          current = swapConfig[current];
          counter++;
        }

        if (chain.length > 0) {
          const isCircular = current === chain[0];
          chains.push({ chain, circular: isCircular });
        }
      }
    });

    return chains;
  };

  const chains = getSwapChains();

  return (
    <div className="mb-8 bg-gray-50 rounded-lg">
      {/* Show warning banner if there are unassigned ports */}
      {unassignedPorts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <HiExclamation className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Warning:</span> {unassignedPorts.length} port{unassignedPorts.length > 1 ? "s" : ""} not assigned yet: {unassignedPorts.join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button className={`flex-1 py-2 px-4 ${activeTab === "grid" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600"}`} onClick={() => setActiveTab("grid")}>
          Grid View
        </button>
        <button className={`flex-1 py-2 px-4 ${activeTab === "chain" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600"}`} onClick={() => setActiveTab("chain")}>
          Chain View
        </button>
        <button className={`flex-1 py-2 px-4 ${activeTab === "list" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600"}`} onClick={() => setActiveTab("list")}>
          List View
        </button>
      </div>

      <div className="p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Port Swapping Visualization</h4>

        {/* Grid View */}
        {activeTab === "grid" && (
          <div className="max-h-[250px] overflow-y-auto">
            <table className="min-w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Port</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Swapped To</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {origins.map((port) => (
                  <tr key={port} className={`border-t ${!swapConfig[port] ? "bg-yellow-50" : ""}`}>
                    <td className="px-4 py-2 text-sm font-medium">
                      {port}
                      {/* {!swapConfig[port] && <HiExclamation className="h-4 w-4 text-yellow-500 inline ml-1" />} */}
                    </td>
                    <td className="px-4 py-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center ${swapConfig[port] ? "text-green-600" : "text-yellow-600 font-medium"}`}>{swapConfig[port] || "Not assigned"}</span>
                    </td>
                    <td className="px-4 py-2">
                      {swapConfig[port] ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Configured</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 font-bold animate-pulse">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Chain View */}
        {activeTab === "chain" && (
          <div className="max-h-[250px] overflow-y-auto pr-2">
            <div className="space-y-8">
              {chains.map(({ chain, circular }, chainIndex) => {
                const isLongChain = chain.length > 3;
                // Check if this chain has any unassigned port (the last element in chain has no target)
                const hasUnassignedPort = chain.length > 0 && !swapConfig[chain[chain.length - 1]] && !circular;

                return (
                  <div key={chainIndex} className={`flex flex-col items-center pb-4 ${hasUnassignedPort ? "border-2 border-yellow-200 rounded-lg p-2" : ""}`}>
                    {hasUnassignedPort && (
                      <div className="w-full bg-yellow-50 text-yellow-700 text-xs p-1 mb-2 rounded text-center">
                        <HiExclamation className="inline mr-1" />
                        Incomplete chain - needs destination for {chain[chain.length - 1]}
                      </div>
                    )}
                    <div className="max-w-full overflow-x-auto pb-2">
                      <div className={`flex items-center space-x-4 ${isLongChain ? "min-w-max" : ""}`}>
                        {chain.map((port, index) => (
                          <React.Fragment key={index}>
                            <div
                              className={`
                                p-3 rounded-lg min-w-[80px] text-center font-medium
                                ${index === 0 ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
                                ${index === chain.length - 1 && !swapConfig[port] && !circular ? "border-2 border-yellow-400 bg-yellow-50 text-yellow-800" : ""}
                              `}
                            >
                              {port}
                              {index === chain.length - 1 && !swapConfig[port] && !circular && <div className="text-xs text-yellow-600 mt-1">Needs destination</div>}
                            </div>

                            {index < chain.length - 1 && (
                              <div className="flex items-center space-x-1">
                                <div className="h-0.5 w-6 bg-green-500"></div>
                                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                              </div>
                            )}

                            {index === chain.length - 1 && circular && (
                              <div className="flex items-center space-x-1">
                                <div className="h-0.5 w-6 bg-blue-500"></div>
                                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <div className="text-xs text-blue-500 font-medium whitespace-nowrap">back to {chain[0]}</div>
                              </div>
                            )}

                            {/* Add warning icon for unassigned port */}
                            {index === chain.length - 1 && !swapConfig[port] && !circular && (
                              <div className="flex items-center space-x-1">
                                <div className="h-0.5 w-6 bg-yellow-400 border border-dashed border-yellow-500"></div>
                                <HiExclamation className="w-4 h-4 text-yellow-500" />
                                <div className="text-xs text-yellow-500 font-medium whitespace-nowrap">needs destination</div>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">Chain {chainIndex + 1}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {activeTab === "list" && (
          <div className="max-h-[250px] overflow-y-auto">
            <div className="space-y-4">
              {chains.map(({ chain, circular }, chainIndex) => {
                const hasUnassignedPort = chain.length > 0 && !swapConfig[chain[chain.length - 1]] && !circular;

                return (
                  <div key={chainIndex} className={`border rounded-lg p-3 bg-white ${hasUnassignedPort ? "border-yellow-300" : ""}`}>
                    <div className="font-medium text-gray-700 mb-2">
                      Chain {chainIndex + 1}
                      {hasUnassignedPort && (
                        <span className="ml-2 text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                          <HiExclamation className="inline mr-1" />
                          Incomplete
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {chain.map((port, index) => (
                        <React.Fragment key={index}>
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium
                              ${index === 0 ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
                              ${index === chain.length - 1 && !swapConfig[port] && !circular ? "bg-yellow-100 text-yellow-800 border border-yellow-300" : ""}
                            `}
                          >
                            {port}
                            {index === chain.length - 1 && !swapConfig[port] && !circular && <HiExclamation className="inline ml-1 text-yellow-500" />}
                          </span>

                          {index < chain.length - 1 && (
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}

                          {index === chain.length - 1 && circular && (
                            <>
                              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="text-xs text-blue-500">loop</span>
                            </>
                          )}

                          {index === chain.length - 1 && !swapConfig[port] && !circular && (
                            <>
                              <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span className="text-xs text-yellow-500">unassigned</span>
                            </>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    {circular && (
                      <div className="mt-2 text-xs text-blue-600">
                        <span>
                          Circular: {chain[chain.length - 1]} → {chain[0]}
                        </span>
                      </div>
                    )}
                    {hasUnassignedPort && (
                      <div className="mt-2 text-xs text-yellow-600">
                        <span>Port {chain[chain.length - 1]} needs a destination</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center space-x-4 text-sm border-t pt-4">
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
            <span>Origin Port</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
            <span>Destination Port</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>Circular Link</span>
          </div>
          <div className="flex items-center mb-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
            <span>Unassigned Port</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapDiagram;
