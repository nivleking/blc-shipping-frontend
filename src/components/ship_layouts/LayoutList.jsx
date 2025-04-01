import React, { useState } from "react";
import { FiHelpCircle } from "react-icons/fi";
import ReactPaginate from "react-paginate";
import LayoutTableView from "../../components/ship_layouts/LayoutTableView";
import LayoutGridView from "../../components/ship_layouts/LayoutGridView";

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
          <LayoutGridView
            currentPageData={currentPageData}
            offset={offset}
            setSelectedLayout={setSelectedLayout}
            setShowPreviewModal={setShowPreviewModal}
            setFormData={setFormData}
            setShowEditForm={setShowEditForm}
            confirmDelete={confirmDelete}
          />
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
