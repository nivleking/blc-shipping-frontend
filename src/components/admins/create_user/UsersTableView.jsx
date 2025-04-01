import React from "react";
import { HiPencilAlt, HiTrash, HiEye, HiEyeOff } from "react-icons/hi";

const UsersTableView = ({ currentPageData, handleEdit, handleDeleteClick, togglePasswordVisibility, visiblePasswords, passwordVisibility, setPasswordVisibility, currentUser }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Login
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Login Count
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Password
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentPageData.map((user, index) => (
            <tr key={user.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                      {user.id === currentUser?.id && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">You</span>}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : "Never"}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.login_count || 0}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  {visiblePasswords[user.id] ? <div className="text-sm text-gray-800 font-mono bg-gray-100 px-2 py-1 rounded">{visiblePasswords[user.id]}</div> : <div className="text-sm text-gray-500">••••••••</div>}
                  <button onClick={() => togglePasswordVisibility(user.id)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50">
                    {visiblePasswords[user.id] ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50">
                    <HiPencilAlt className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteClick(user)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50" disabled={user.id === currentUser?.id}>
                    <HiTrash className={`w-5 h-5 ${user.id === currentUser?.id ? "opacity-50" : ""}`} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {currentPageData.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500">No users found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default UsersTableView;
