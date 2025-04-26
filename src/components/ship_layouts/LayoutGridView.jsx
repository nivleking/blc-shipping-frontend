import React from "react";
import { AiFillEye } from "react-icons/ai";
import { HiPencil, HiTrash } from "react-icons/hi2";
import { IoCreateOutline, IoTimeOutline } from "react-icons/io5";

const LayoutGridView = ({ currentPageData, offset, setSelectedLayout, setShowPreviewModal, setFormData, setShowEditForm, confirmDelete }) => {
  return (
    <div className="space-y-4">
      {currentPageData.map((layout, index) => (
        <div key={layout.id} className="flex flex-col sm:flex-row items-start justify-between p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Left section with layout details */}
          <div className="flex items-start space-x-6 w-full">
            {/* Layout Icon and Status */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1-1H5a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
            </div>

            {/* Layout Details */}
            <div className="flex flex-col flex-grow">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm font-medium text-gray-500">#{offset + index + 1}</span>
                <h3 className="text-1xl font-semibold text-gray-900">{layout.name}</h3>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <p>{layout.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                {/* Bay Configuration */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">Bay Count:</span>
                    <span className="ml-2">{layout.bay_count} bays</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">Bay Size:</span>
                    <span className="ml-2">
                      {layout.bay_size.rows}×{layout.bay_size.columns}
                    </span>
                  </div>
                </div>

                {/* Creation Info */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-gray-600">
                    <IoCreateOutline className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="font-medium">Created by:</span>
                    <span className="ml-2 text-blue-600">{layout.creator?.name || "System"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <IoTimeOutline className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">
                      {new Date(layout.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Bay Types Summary */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">Bay Types:</span>
                    <div className="ml-2 flex flex-wrap gap-1">
                      {Array.from(new Set(layout.bay_types)).map((type) => (
                        <span key={type} className={`px-2 py-1 text-xs font-medium rounded-full ${type === "reefer" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right section with action buttons */}
          <div className="flex flex-col space-y-2 mt-2 sm:mt-0 min-w-[120px]">
            <button
              onClick={() => {
                setSelectedLayout(layout);
                setShowPreviewModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              <AiFillEye className="mr-2 h-4 w-4" /> Preview
            </button>
            <button
              onClick={() => {
                setSelectedLayout(layout);
                setFormData({
                  name: layout.name,
                  description: layout.description,
                  bay_size: {
                    rows: layout.bay_size.rows,
                    columns: layout.bay_size.columns,
                  },
                  bay_count: layout.bay_count,
                  bay_types: [...layout.bay_types], // Create a new array to avoid reference issues
                });
                setShowEditForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
            >
              <HiPencil className="mr-2 h-4 w-4" /> Edit
            </button>
            <button onClick={() => confirmDelete(layout)} className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100">
              <HiTrash className="mr-2 h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LayoutGridView;
