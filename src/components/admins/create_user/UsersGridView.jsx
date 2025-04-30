import React from "react";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { IoEyeOutline, IoEyeOffOutline, IoTimeOutline, IoCreateOutline, IoRefreshOutline, IoEnterOutline, IoStatsChartOutline } from "react-icons/io5";

const UsersGridView = ({ currentPageData, offset, visiblePasswords, passwordVisibility, setPasswordVisibility, togglePasswordVisibility, handleEdit, handleDeleteClick, currentUser }) => {
  return (
    <div className="space-y-2">
      {currentPageData.map((userGroup, index) => (
        <div key={userGroup.id} className="flex flex-col sm:flex-row items-start justify-between p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Left section with avatar and details */}
          <div className="flex items-start space-x-6 w-full">
            {/* Avatar and Status Column */}
            <div className="flex flex-col items-center space-y-3 pt-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-medium text-xl">{userGroup.name.charAt(0).toUpperCase()}</span>
              </div>
              <span className={`px-1 py-1 text-xs font-medium rounded-full ${userGroup.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{userGroup.status || "active"}</span>
            </div>

            {/* UserGroup Details Column */}
            <div className="flex flex-col flex-grow">
              {/* Header with ID and Name */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm font-medium text-gray-500">#{offset + index + 1}</span>
                <h3 className="text-sm font-semibold text-gray-900">{userGroup.name}</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
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
                    <span>{userGroup.login_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right section with action buttons */}
          <div className="flex flex-col space-y-1 mt-2 sm:mt-0 min-w-[120px]">
            {currentUser && currentUser.is_super_admin !== 0 && !visiblePasswords[userGroup.id] && (
              <button
                onClick={() => togglePasswordVisibility(userGroup.id)}
                className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <IoEyeOutline className="mr-2 h-4 w-4" />
                Password
              </button>
            )}

            <button
              onClick={() => handleEdit(userGroup)}
              className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
            >
              <AiFillEdit className="mr-2 h-4 w-4" />
              Edit
            </button>

            <button
              onClick={() => handleDeleteClick(userGroup)}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <AiFillDelete className="mr-2 h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersGridView;
