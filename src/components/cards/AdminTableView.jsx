import React from "react";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { IoEyeOutline, IoEyeOffOutline, IoShieldCheckmark } from "react-icons/io5";

const AdminTableView = ({ currentPageData, visiblePasswords, passwordVisibility, setPasswordVisibility, togglePasswordVisibility, handleEdit, handleDeleteClick, currentUser }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created By
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Login
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Login Count
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Password
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentPageData.map((admin, index) => (
            <tr key={admin.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {/* Name & Status */}
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-medium text-lg">{admin.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      {admin.name}
                      {currentUser && admin.id === currentUser.id && <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">You</span>}
                    </div>
                    <div className="text-xs text-gray-500">Created: {new Date(admin.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </td>

              {/* Role */}
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.is_super_admin ? "bg-yellow-100 text-yellow-800" : "bg-indigo-100 text-indigo-800"}`}>
                  <IoShieldCheckmark className="w-3.5 h-3.5 mr-1" />
                  {admin.is_super_admin ? "Super Admin" : "Admin"}
                </span>
              </td>

              {/* Created By */}
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-blue-600">{admin.created_by?.name || "System"}</div>
                {admin.updated_by && <div className="text-xs text-gray-500 mt-1">Updated by: {admin.updated_by?.name}</div>}
              </td>

              {/* Last Login */}
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {admin.last_login_at
                  ? new Date(admin.last_login_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Never"}
              </td>

              {/* Login Count */}
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{admin.login_count || 0}</td>

              {/* Password */}
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  {visiblePasswords[admin.id] ? (
                    <div className="relative flex items-center">
                      <input type={passwordVisibility[admin.id] ? "text" : "password"} value={visiblePasswords[admin.id]} readOnly className="pr-8 pl-3 py-1 border border-gray-300 rounded-md bg-gray-50 text-sm w-32" />
                      <button onClick={() => setPasswordVisibility((prev) => ({ ...prev, [admin.id]: !prev[admin.id] }))} className="absolute right-2 p-1 text-gray-500 hover:text-gray-700" type="button">
                        {passwordVisibility[admin.id] ? <IoEyeOffOutline className="w-4 h-4" /> : <IoEyeOutline className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">••••••••</span>
                  )}

                  {!visiblePasswords[admin.id] ? (
                    <button onClick={() => togglePasswordVisibility(admin.id)} className="text-blue-600 hover:text-blue-800 text-xs py-1 px-2 rounded border border-blue-200 bg-blue-50">
                      Show
                    </button>
                  ) : (
                    <button onClick={() => togglePasswordVisibility(admin.id)} className="text-red-600 hover:text-red-800 text-xs py-1 px-2 rounded border border-red-200 bg-red-50">
                      Hide
                    </button>
                  )}
                </div>
              </td>

              {/* Actions */}
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                {currentUser && currentUser.is_super_admin && !admin.is_super_admin && admin.id !== currentUser.id && (
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => handleEdit(admin)} className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-50" title="Edit admin">
                      <AiFillEdit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteClick(admin)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50" title="Delete admin">
                      <AiFillDelete className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}

          {currentPageData.length === 0 && (
            <tr>
              <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500">
                No admins found matching your search criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTableView;
