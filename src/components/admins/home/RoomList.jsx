import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillDelete, AiFillEye, AiFillFolderOpen } from "react-icons/ai";
import { GiShipBow } from "react-icons/gi";
import { MdOutlineGridOn } from "react-icons/md";
import { BiCube, BiGrid, BiTable } from "react-icons/bi";
import { IoCreateOutline, IoTimeOutline } from "react-icons/io5";
import { HiPencilAlt } from "react-icons/hi";
import ReactPaginate from "react-paginate";
import RoomTableView from "./RoomTableView";
import ViewToggle from "../../ViewToggle";

const RoomList = ({ rooms, currentPageData, offset, user, admins, pageCount, currentPage, handlePageClick, handleOpenRoom, handleEditRoom, handleDeleteRoom }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");

  const getStatusInfo = (status) => {
    switch (status) {
      case "active":
        return {
          text: "Active",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          iconBg: "bg-green-500",
        };
      case "finished":
        return {
          text: "Finished",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          iconBg: "bg-red-500",
        };
      case "created":
        return {
          text: "Ready",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          iconBg: "bg-blue-500",
        };
      default:
        return {
          text: status,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          iconBg: "bg-gray-500",
        };
    }
  };

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-1xl font-bold text-gray-800">All Rooms</h3>

          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        {rooms.length > 0 && (
          <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
            breakLabel={"..."}
            breakClassName={"break-me"}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            subContainerClassName={"pages pagination"}
            activeClassName={"active"}
            previousClassName={"page-item"}
            nextClassName={"page-item"}
            pageClassName={"page-item"}
            pageLinkClassName={"page-link"}
            previousLinkClassName={"page-link"}
            nextLinkClassName={"page-link"}
            breakLinkClassName={"page-link"}
            forcePage={Math.min(currentPage, Math.max(0, pageCount - 1))}
          />
        )}
      </div>

      {rooms.length === 0 ? (
        <p className="text-center text-gray-600">There are no rooms! Let's create one!</p>
      ) : viewMode === "table" ? (
        // Table View
        <RoomTableView rooms={rooms} currentPageData={currentPageData} user={user} admins={admins} handleOpenRoom={handleOpenRoom} handleEditRoom={handleEditRoom} handleDeleteRoom={handleDeleteRoom} />
      ) : (
        // Grid View (Original display)
        <div className="space-y-4">
          {currentPageData.map((room, index) => (
            <div key={room.id} className="flex flex-col sm:flex-row items-start justify-between p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Left section with room details */}
              <div className="flex items-start space-x-6 w-full">
                {/* Room Icon and Status */}
                <div className="flex flex-col items-center space-y-3 pt-2">
                  <div className="flex flex-col items-center space-y-3 pt-2">
                    <div className={`w-16 h-16 rounded-lg ${getStatusInfo(room.status).iconBg} flex items-center justify-center text-white`}>
                      <span className="text-xl font-medium">{offset + index + 1}</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusInfo(room.status).bgColor} ${getStatusInfo(room.status).textColor}`}>{getStatusInfo(room.status).text}</span>
                    </div>
                  </div>
                </div>

                {/* Room Details */}
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center space-x-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {room.id} | {room.name}
                    </h3>
                  </div>

                  <div className="text-sm text-gray-600 mb-3">
                    <p>{room.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {/* Configuration Info */}
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center text-gray-600">
                        <BiGrid className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="font-medium">Total Rounds:</span>
                        <span className="ml-2">{room.total_rounds}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <BiCube className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="font-medium">Cards per Round:</span>
                        <span className="ml-2">{room.cards_limit_per_round}</span>
                      </div>
                    </div>

                    {/* Creation Info */}
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center text-gray-600">
                        <IoCreateOutline className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="font-medium">Created by:</span>
                        <span className="ml-2 text-blue-600">{admins[room.admin_id]?.name}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <IoTimeOutline className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium">Created:</span>
                        <span className="ml-2">
                          {new Date(room.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Participation Info */}
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center text-gray-600">
                        <GiShipBow className="w-4 h-4 text-indigo-500 mr-2" />
                        <span className="font-medium">Max Users:</span>
                        <span className="ml-2">{room.max_users}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MdOutlineGridOn className="w-4 h-4 text-green-500 mr-2" />
                        <span className="font-medium">Assigned Users:</span>
                        <span className="ml-2">{room.assigned_users ? (typeof room.assigned_users === "string" ? JSON.parse(room.assigned_users).length : room.assigned_users.length) : 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right section with action buttons */}
              <div className="flex flex-col space-y-2 mt-4 sm:mt-0 min-w-[120px]">
                {room.status === "finished" && (
                  <button
                    onClick={() => navigate(`/rooms/${room.id}/detail`)}
                    className="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                  >
                    <AiFillEye className="mr-2 h-4 w-4" /> View
                  </button>
                )}
                {user && room.status !== "finished" && (
                  <button
                    onClick={() => handleOpenRoom(room.id)}
                    className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                      room.status === "active" && user.id !== room.admin_id ? "border-gray-300 text-gray-700 bg-gray-50 cursor-not-allowed" : "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
                    }`}
                    disabled={room.status === "active" && user.id !== room.admin_id}
                  >
                    <AiFillFolderOpen className="mr-2 h-4 w-4" /> Open
                  </button>
                )}

                {room.status !== "active" && room.status !== "finished" && (
                  <button onClick={() => handleEditRoom(room)} className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100">
                    <HiPencilAlt className="mr-2 h-4 w-4" /> Edit
                  </button>
                )}
                {/* {room.status !== "active" && ()} */}
                <button onClick={(e) => handleDeleteRoom(room.id)(e)} className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100">
                  <AiFillDelete className="mr-2 h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomList;
