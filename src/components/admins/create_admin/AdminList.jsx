import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { IoGridOutline, IoListOutline } from "react-icons/io5";
import AdminTableView from "../../../components/admins/create_admin/AdminTableView";
import AdminGridView from "../../../components/admins/create_admin/AdminGridView";

const AdminList = ({
  admins,
  currentPageData,
  offset,
  pageCount,
  itemsPerPage,
  searchTerm,
  setSearchTerm,
  handlePageClick,
  handleEdit,
  handleDeleteClick,
  togglePasswordVisibility,
  visiblePasswords,
  passwordVisibility,
  setPasswordVisibility,
  formErrors,
  currentUser,
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="ml-3 text-1xl font-bold text-gray-900">Admin List</h3>
          </div>

          <div className="flex items-center space-x-3">
            {/* View toggle buttons */}
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button className={`p-1.5 rounded-md flex items-center ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setViewMode("grid")} title="Card view">
                <IoGridOutline className="w-5 h-5" />
              </button>
              <button className={`p-1.5 rounded-md flex items-center ${viewMode === "table" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setViewMode("table")} title="Table view">
                <IoListOutline className="w-5 h-5" />
              </button>
            </div>

            {/* Search Box */}
            <div className="w-72">
              <div className="relative">
                <input type="text" placeholder="Search admins..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:border-blue-500" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error messages */}
        {formErrors.delete && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{formErrors.delete[0]}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {admins.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No admins</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new admin.</p>
          </div>
        ) : viewMode === "table" ? (
          <AdminTableView
            currentPageData={currentPageData}
            visiblePasswords={visiblePasswords}
            passwordVisibility={passwordVisibility}
            setPasswordVisibility={setPasswordVisibility}
            togglePasswordVisibility={togglePasswordVisibility}
            handleEdit={handleEdit}
            handleDeleteClick={handleDeleteClick}
            currentUser={currentUser}
          />
        ) : (
          <AdminGridView
            currentPageData={currentPageData}
            offset={offset}
            visiblePasswords={visiblePasswords}
            passwordVisibility={passwordVisibility}
            setPasswordVisibility={setPasswordVisibility}
            togglePasswordVisibility={togglePasswordVisibility}
            handleEdit={handleEdit}
            handleDeleteClick={handleDeleteClick}
            currentUser={currentUser}
          />
        )}

        {/* Pagination */}
        {admins.length > itemsPerPage && (
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

export default AdminList;
