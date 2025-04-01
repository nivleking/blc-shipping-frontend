import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import UsersTableView from "../../../components/admins/create_user/UsersTableView";
import UsersGridView from "../../../components/admins/create_user/UsersGridView";
import { IoGridOutline, IoListOutline } from "react-icons/io5";

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
            <h3 className="ml-3 text-1xl font-bold text-gray-900">Users List</h3>

            {/* View Toggle Buttons */}
            <div className="bg-gray-100 rounded-lg p-1 flex ml-4">
              <button className={`p-1.5 rounded-md flex items-center ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setViewMode("grid")} title="Grid view">
                <IoGridOutline className="w-5 h-5" />
              </button>
              <button className={`p-1.5 rounded-md flex items-center ${viewMode === "table" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"}`} onClick={() => setViewMode("table")} title="Table view">
                <IoListOutline className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right side - Search Box */}
          <div className="w-72">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
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
          <UsersGridView
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
