import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { IoEyeOutline, IoEyeOffOutline, IoTimeOutline, IoCreateOutline, IoRefreshOutline, IoEnterOutline, IoStatsChartOutline } from "react-icons/io5";
import UsersTableView from "../../cards/UsersTableView";

const UserList = ({
  users,
  currentPageData,
  pageCount,
  handlePageClick,
  handleEdit,
  handleDeleteClick,
  togglePasswordVisibility,
  visiblePasswords,
  passwordVisibility,
  setPasswordVisibility,
  searchTerm,
  setSearchTerm,
  offset,
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
            <h3 className="ml-3 text-1xl font-bold text-gray-900">Group User List</h3>

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

          {/* Right side - Search Box */}
          <div className="w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Search group users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
          </div>
        ) : viewMode === "table" ? (
          <UsersTableView
            users={users}
            currentPageData={currentPageData}
            handleEdit={handleEdit}
            handleDeleteClick={handleDeleteClick}
            togglePasswordVisibility={togglePasswordVisibility}
            visiblePasswords={visiblePasswords}
            passwordVisibility={passwordVisibility}
            setPasswordVisibility={setPasswordVisibility}
            currentUser={currentUser}
          />
        ) : (
          <div className="space-y-4">
            {currentPageData.map((userGroup, index) => (
              <div key={userGroup.id} className="flex flex-col sm:flex-row items-start justify-between p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Left section with avatar and details */}
                <div className="flex items-start space-x-6 w-full">
                  {/* Avatar and Status Column */}
                  <div className="flex flex-col items-center space-y-3 pt-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-medium text-xl">{userGroup.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${userGroup.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{userGroup.status}</span>
                  </div>

                  {/* UserGroup Details Column */}
                  <div className="flex flex-col flex-grow">
                    {/* Header with ID and Name */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-gray-500">#{offset + index + 1}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{userGroup.name}</h3>
                    </div>

                    {/* Password Field */}
                    {visiblePasswords[userGroup.id] && (
                      <div className="mb-4 flex items-center space-x-2">
                        <div className="relative flex items-center">
                          <input type={passwordVisibility[userGroup.id] ? "text" : "password"} value={visiblePasswords[userGroup.id]} readOnly className="pr-10 pl-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm w-48" />
                          <button
                            onClick={() =>
                              setPasswordVisibility((prev) => ({
                                ...prev,
                                [userGroup.id]: !prev[userGroup.id],
                              }))
                            }
                            className="absolute right-2 p-1 text-gray-500 hover:text-gray-700"
                            type="button"
                          >
                            {passwordVisibility[userGroup.id] ? <IoEyeOffOutline className="w-4 h-4" /> : <IoEyeOutline className="w-4 h-4" />}
                          </button>
                        </div>
                        <button onClick={() => togglePasswordVisibility(userGroup.id)} className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200">
                          Hide
                        </button>
                      </div>
                    )}

                    {/* UserGroup Activity Details */}
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {/* Creation Info */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <IoCreateOutline className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Created by:</span>
                          <span className="text-blue-600">{userGroup.created_by?.name || "System"}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <IoTimeOutline className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Created at:</span>
                          <span>
                            {new Date(userGroup.created_at).toLocaleDateString("en-US", {
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
                      {userGroup.updated_by && (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <IoRefreshOutline className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">Last edited by:</span>
                            <span className="text-blue-600">{userGroup.updated_by?.name}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <IoTimeOutline className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Edited at:</span>
                            <span>
                              {new Date(userGroup.updated_at).toLocaleDateString("en-US", {
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
                            {userGroup.last_login_at
                              ? new Date(userGroup.last_login_at).toLocaleDateString("en-US", {
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
                          <span>{userGroup.login_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right section with action buttons */}
                <div className="flex flex-col space-y-2 mt-4 sm:mt-0 min-w-[120px]">
                  {currentUser && currentUser.is_super_admin !== 0 && !visiblePasswords[userGroup.id] && (
                    <button
                      onClick={() => togglePasswordVisibility(userGroup.id)}
                      className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <IoEyeOutline className="mr-2 h-4 w-4" />
                      Password
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(userGroup)}
                    className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
                  >
                    <AiFillEdit className="mr-2 h-4 w-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteClick(userGroup)}
                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <AiFillDelete className="mr-2 h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {users.length > 0 && (
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

export default UserList;
