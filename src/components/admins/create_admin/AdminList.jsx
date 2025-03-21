import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { IoEyeOutline, IoEyeOffOutline, IoTimeOutline, IoCreateOutline, IoRefreshOutline, IoEnterOutline, IoStatsChartOutline, IoShieldCheckmark, IoGridOutline, IoListOutline } from "react-icons/io5";
import AdminTableView from "../../../components/cards/AdminTableView";

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
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"

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

        {admins.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No admins</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new admin.</p>
          </div>
        ) : viewMode === "table" ? (
          // Table View
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
          // Grid View (original card layout)
          <div className="space-y-4">
            {currentPageData.map((admin, index) => (
              <div key={admin.id} className="flex flex-col sm:flex-row items-start justify-between p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start space-x-6 w-full">
                  {/* Avatar and Status Column */}
                  <div className="flex flex-col items-center space-y-3 pt-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-medium text-xl">{admin.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1
                        ${admin.is_super_admin ? "bg-yellow-100 text-yellow-800" : "bg-indigo-100 text-indigo-800"}`}
                      >
                        <IoShieldCheckmark className="w-4 h-4 mr-1" />
                        {admin.is_super_admin ? "Super Admin" : "Admin"}
                      </span>
                    </div>
                  </div>

                  {/* Admin Details Column */}
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-gray-500">#{offset + index + 1}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{admin.name}</h3>
                      {currentUser && admin.id === currentUser.id && <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">You</span>}
                    </div>

                    {/* Password Field */}
                    {visiblePasswords[admin.id] && (
                      <div className="mb-4 flex items-center space-x-2">
                        <div className="relative flex items-center">
                          <input type={passwordVisibility[admin.id] ? "text" : "password"} value={visiblePasswords[admin.id]} readOnly className="pr-10 pl-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm w-48" />
                          <button
                            onClick={() =>
                              setPasswordVisibility((prev) => ({
                                ...prev,
                                [admin.id]: !prev[admin.id],
                              }))
                            }
                            className="absolute right-2 p-1 text-gray-500 hover:text-gray-700"
                            type="button"
                          >
                            {passwordVisibility[admin.id] ? <IoEyeOffOutline className="w-4 h-4" /> : <IoEyeOutline className="w-4 h-4" />}
                          </button>
                        </div>
                        <button onClick={() => togglePasswordVisibility(admin.id)} className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200">
                          Hide
                        </button>
                      </div>
                    )}

                    {/* Admin Activity Details */}
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      {/* Creation Info */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <IoCreateOutline className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Created by:</span>
                          <span className="text-blue-600">{admin.created_by?.name || "System"}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <IoTimeOutline className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Created at:</span>
                          <span>
                            {new Date(admin.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Last Edit Info */}
                      {admin.updated_by && (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <IoRefreshOutline className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">Last edited by:</span>
                            <span className="text-blue-600">{admin.updated_by?.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <IoTimeOutline className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Last edited at:</span>
                            <span>
                              {new Date(admin.updated_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Login Statistics */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <IoEnterOutline className="w-4 h-4 text-green-500" />
                          <span className="font-medium">Last login:</span>
                          <span>
                            {admin.last_login_at
                              ? new Date(admin.last_login_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Never"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <IoStatsChartOutline className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">Login count:</span>
                          <span>{admin.login_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {currentUser && currentUser.is_super_admin && !admin.is_super_admin && admin.id !== currentUser.id && (
                  <div className="flex flex-col space-y-2 mt-4 sm:mt-0 min-w-[120px]">
                    {!visiblePasswords[admin.id] && (
                      <button
                        onClick={() => togglePasswordVisibility(admin.id)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <IoEyeOutline className="mr-2 h-4 w-4" />
                        Password
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(admin)}
                      className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
                    >
                      <AiFillEdit className="mr-2 h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(admin)}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <AiFillDelete className="mr-2 h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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
