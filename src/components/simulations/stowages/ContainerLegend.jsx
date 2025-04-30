import React from "react";

const ContainerLegend = () => {
  return (
    <div className="bg-white rounded-md shadow p-3 mb-4">
      <h4 className="font-medium text-gray-700 mb-2">Container Status Legend</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div className="flex items-center">
          <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">⚠️</span>
          <span className="ml-2 text-sm text-gray-600">Restowage Issue</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">↓</span>
          <span className="ml-2 text-sm text-gray-600">Restowed Container</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 border border-red-500 rounded-sm"></div>
          <span className="ml-2 text-sm text-gray-600">Backlogged Container</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 ring-2 ring-yellow-400 rounded-sm bg-yellow-50"></div>
          <span className="ml-2 text-sm text-gray-600">Discharge Target</span>
        </div>  
        <div className="flex items-center">
          <div className="w-4 h-4 border border-dashed border-red-500 rounded-sm"></div>
          <span className="ml-2 text-sm text-gray-600">Restowed in Dock</span>
        </div>
      </div>
    </div>
  );
};

export default ContainerLegend;
