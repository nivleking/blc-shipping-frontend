import React, { useState } from "react";
import { FiHelpCircle } from "react-icons/fi";
import { AiFillEye } from "react-icons/ai";
import { HiPencil, HiTrash } from "react-icons/hi2";
import { IoCreateOutline, IoTimeOutline } from "react-icons/io5";
import ReactPaginate from "react-paginate";
import LayoutTableView from "../../components/cards/LayoutTableView";

const LayoutList = ({
  layouts,
  searchTerm,
  setSearchTerm,
  setShowGuideModal,
  setShowCreateForm,
  setSelectedLayout,
  setShowPreviewModal,
  setFormData,
  setShowEditForm,
  confirmDelete,
  currentPageData,
  offset,
  pageCount,
  handlePageClick,
  itemsPerPage,
}) => {
  const [viewMode, setViewMode] = useState("grid");

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          {/* Left side - Title and Icon */}
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
            <h3 className="ml-3 text-md font-bold text-gray-900">Ship Bay Layouts</h3>
          </div>

          {/* Middle - Actions */}
          <div className="flex items-center gap-4">
            <button onClick={() => setShowGuideModal(true)} className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100">
              <FiHelpCircle className="mr-2" />
              Layout Guide
            </button>
            <button onClick={() => setShowCreateForm(true)} className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100">
              Create New Layout
            </button>
          </div>

          {/* Right side - Search Box */}
          <div className="w-72">
            <div className="relative">
              <input type="text" placeholder="Search layouts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:border-blue-500" />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-800">Ship Layouts</h3>

          {/* View Toggle Buttons */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button className={`p-1.5 rounded-md flex items-center ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setViewMode("grid")} title="Grid view">
              Grid
            </button>
            <button className={`p-1.5 rounded-md flex items-center ${viewMode === "table" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setViewMode("table")} title="Table view">
              Table
            </button>
          </div>
        </div>

        {layouts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No layouts</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new layout.</p>
          </div>
        ) : viewMode === "table" ? (
          <LayoutTableView
            layouts={layouts}
            currentPageData={currentPageData}
            setSelectedLayout={setSelectedLayout}
            setShowPreviewModal={setShowPreviewModal}
            setFormData={setFormData}
            setShowEditForm={setShowEditForm}
            confirmDelete={confirmDelete}
          />
        ) : (
          <div className="space-y-4">
            {currentPageData.map((layout, index) => (
              <div key={layout.id} className="flex flex-col sm:flex-row items-start justify-between p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Left section with layout details */}
                <div className="flex items-start space-x-6 w-full">
                  {/* Layout Icon and Status */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1-1H5a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                  </div>

                  {/* Layout Details */}
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-gray-500">#{offset + index + 1}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{layout.name}</h3>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <p>{layout.description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
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
                <div className="flex flex-col space-y-2 mt-4 sm:mt-0 min-w-[120px]">
                  <button
                    onClick={() => {
                      setSelectedLayout(layout);
                      setShowPreviewModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
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
                    className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                  >
                    <HiPencil className="mr-2 h-4 w-4" /> Edit
                  </button>
                  <button onClick={() => confirmDelete(layout)} className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100">
                    <HiTrash className="mr-2 h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {layouts.length > itemsPerPage && (
          <div className="mt-6">
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={"pagination"}
              activeClassName={"active"}
              previousClassName={"page-item"}
              nextClassName={"page-item"}
              pageClassName={"page-item"}
              pageLinkClassName={"page-link"}
              previousLinkClassName={"page-link"}
              nextLinkClassName={"page-link"}
              breakLinkClassName={"page-link"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutList;
