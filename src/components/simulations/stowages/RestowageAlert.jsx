import React from "react";

const RestowageAlert = ({ restowageContainers, restowagePenalty, restowageMoves, formatIDR }) => {
  if (!restowageContainers || restowageContainers.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 p-4 mb-4 rounded-r shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800 font-medium">Restowage Boxes: {restowageContainers.length}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <div className="px-2 py-1 bg-white border border-red-200 rounded-md text-xs">
              <span className="font-medium text-red-700">{restowageMoves}</span> <span className="text-gray-600">extra moves required</span>
            </div>
            <div className="px-2 py-1 bg-white border border-red-200 rounded-md text-xs">
              <span className="font-medium text-red-700">{formatIDR(restowagePenalty)}</span> <span className="text-gray-600">penalty cost</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-600">Improperly stacked containers will require extra handling at future ports, resulting in restow costs for your port.</p>
        </div>
      </div>
    </div>
  );
};

export default RestowageAlert;
