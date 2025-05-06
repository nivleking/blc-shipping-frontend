import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../axios/axios";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import ReactPaginate from "react-paginate";
import LoadingSpinner from "../simulations/LoadingSpinner";
import { FaEye, FaCalendarAlt, FaUsers, FaHistory, FaSearch } from "react-icons/fa";

const PreviousSimulations = () => {
  const { token, user } = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Fetch rooms where user has participated
  const { data, isLoading, error } = useQuery({
    queryKey: ["userRooms", user?.id],
    queryFn: async () => {
      const response = await api.get(`/users/${user.id}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!user?.id && !!token,
  });

  // Format date as "time ago" without date-fns
  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;

      // Convert to seconds, minutes, hours, days
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      // Return formatted string
      if (diffYears > 0) {
        return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
      } else if (diffMonths > 0) {
        return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
      } else if (diffDays > 0) {
        return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
      } else if (diffMins > 0) {
        return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
      } else {
        return "just now";
      }
    } catch (e) {
      return dateString;
    }
  };

  // Format date in a readable format
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Handle pagination
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page on search
  };

  // Navigate to room details
  const handleOpenRoom = (roomId) => {
    navigate(`/previous-simulations/${roomId}/detail`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Error loading your previous simulations</p>
        <p className="text-sm">{error.message || "An unknown error occurred"}</p>
      </div>
    );
  }

  const rooms = data?.rooms || [];

  // Filter rooms based on search term
  const filteredRooms = rooms.filter((room) => room.name.toLowerCase().includes(searchTerm.toLowerCase()) || (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase())));

  const offset = currentPage * itemsPerPage;
  const currentPageData = filteredRooms.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredRooms.length / itemsPerPage);

  // Helper function to get status styling
  const getStatusInfo = (status) => {
    switch (status) {
      case "finished":
        return { bg: "bg-green-100", text: "text-green-800", label: "SIMULATION COMPLETED!" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", label: status };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Attractive Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <FaHistory className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">My Previous Simulations</h1>
            <p className="text-blue-100 mt-1">Review detailed performance metrics and outcomes from your completed simulation sessions</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="ml-4 text-sm text-gray-500">
            {filteredRooms.length} {filteredRooms.length === 1 ? "simulation" : "simulations"} found
          </div>
        </div>
      </div>

      {/* Table of Rooms */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Participants
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPageData.map((room) => {
              const statusInfo = getStatusInfo(room.status);
              return (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{room.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{room.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>{statusInfo.label}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatTimeAgo(room.updated_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{room.max_users}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleOpenRoom(room.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors duration-150"
                    >
                      <FaEye className="mr-1.5" /> View Results
                    </button>
                  </td>
                </tr>
              );
            })}

            {currentPageData.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? (
                    <div>
                      <p className="font-medium mb-1">No simulations match your search</p>
                      <p className="text-sm">Try adjusting your search terms</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium mb-1">No previous simulations found</p>
                      <p className="text-sm">You haven't completed any simulation sessions yet</p>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex justify-center mt-6">
          <ReactPaginate
            breakLabel="..."
            nextLabel="Next >"
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            previousLabel="< Previous"
            renderOnZeroPageCount={null}
            className="flex space-x-1"
            pageClassName="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
            previousClassName="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
            nextClassName="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100"
            activeClassName="!bg-blue-500 text-white hover:!bg-blue-600"
            forcePage={currentPage}
          />
        </div>
      )}
    </div>
  );
};

export default PreviousSimulations;
