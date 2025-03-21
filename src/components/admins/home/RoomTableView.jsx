import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillDelete, AiFillEye, AiFillFolderOpen } from "react-icons/ai";
import { HiPencilAlt } from "react-icons/hi";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const RoomTableView = ({ rooms, currentPageData, user, admins, handleOpenRoom, handleEditRoom, handleDeleteRoom }) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  // Handle sorting when column header is clicked
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon for column headers
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortDirection === "asc" ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />;
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "finished":
        return "bg-red-100 text-red-800";
      case "created":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("id")}>
              <div className="flex items-center">
                <span>ID</span>
                {getSortIcon("id")}
              </div>
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("name")}>
              <div className="flex items-center">
                <span>Name</span>
                {getSortIcon("name")}
              </div>
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("status")}>
              <div className="flex items-center">
                <span>Status</span>
                {getSortIcon("status")}
              </div>
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Configuration
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("created_at")}>
              <div className="flex items-center">
                <span>Created</span>
                {getSortIcon("created_at")}
              </div>
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Creator
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Users
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentPageData.length > 0 ? (
            currentPageData.map((room, index) => (
              <tr key={room.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.id}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <div className="font-medium text-gray-900">{room.name}</div>
                  <div className="text-gray-500 text-xs mt-1 max-w-xs truncate">{room.description}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(room.status)}`}>{room.status.charAt(0).toUpperCase() + room.status.slice(1)}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col space-y-1">
                    <div>Rounds: {room.total_rounds}</div>
                    <div>Cards/Round: {room.cards_limit_per_round}</div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(room.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600">{admins[room.admin_id]?.name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col space-y-1">
                    <div>Max: {room.max_users}</div>
                    <div>Assigned: {room.assigned_users ? (typeof room.assigned_users === "string" ? JSON.parse(room.assigned_users).length : room.assigned_users.length) : 0}</div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {room.status === "finished" ? (
                      <button onClick={() => navigate(`/rooms/${room.id}/detail`)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50" title="View details">
                        <AiFillEye className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenRoom(room.id)}
                        className={`p-1 rounded-full ${room.status === "active" && user.id !== room.admin_id ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-900 hover:bg-blue-50"}`}
                        disabled={room.status === "active" && user.id !== room.admin_id}
                        title="Open room"
                      >
                        <AiFillFolderOpen className="w-5 h-5" />
                      </button>
                    )}

                    {room.status !== "active" && room.status !== "finished" && (
                      <button onClick={() => handleEditRoom(room)} className="text-yellow-600 hover:text-yellow-900 p-1 rounded-full hover:bg-yellow-50" title="Edit room">
                        <HiPencilAlt className="w-5 h-5" />
                      </button>
                    )}

                    <button onClick={(e) => handleDeleteRoom(room.id)(e)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50" title="Delete room">
                      <AiFillDelete className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="px-4 py-4 text-center text-sm text-gray-500">
                No rooms to display
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RoomTableView;
