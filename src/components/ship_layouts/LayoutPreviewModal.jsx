import React from "react";
import RenderShipBayLayout from "../simulations/RenderShipBayLayout";

const LayoutPreviewModal = ({ selectedLayout, setSelectedLayout, setShowPreviewModal }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Layout Preview: {selectedLayout.name}</h2>
          <button
            onClick={() => {
              setSelectedLayout(null);
              setShowPreviewModal(false);
            }}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <RenderShipBayLayout bayCount={selectedLayout.bay_count} baySize={selectedLayout.bay_size} bayTypes={selectedLayout.bay_types} readonly={true} />
        </div>
      </div>
    </div>
  );
};

export default LayoutPreviewModal;
