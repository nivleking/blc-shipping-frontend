import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import api from "../../axios/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";
import "./AdminHome.css"; // Import the CSS file for pagination styling
import io from "socket.io-client";

const websocket = "http://localhost:5174";
const socket = io.connect(websocket);

const AdminHome = () => {
  const { user, token } = useContext(AppContext);
  const [rooms, setRooms] = useState([]);
  const [admins, setAdmins] = useState({});
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    deck_id: "",
    max_users: 0,
  });
  const [errors, setErrors] = useState({});
  const [decks, setDecks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchRooms();
      fetchDecks();
    }
  }, [token]);

  async function fetchRooms() {
    try {
      const response = await api.get("rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRooms(response.data);
      console.log("Rooms fetched:", response.data);

      response.data.forEach(async (room) => {
        const adminResponse = await api.get(`users/${room.admin_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdmins((prevAdmins) => ({
          ...prevAdmins,
          [room.admin_id]: adminResponse.data,
        }));
      });
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }

  async function fetchDecks() {
    try {
      const response = await api.get("decks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDecks(response.data);
    } catch (error) {
      console.error("Error fetching decks:", error);
    }
  }

  async function createRoom(e) {
    e.preventDefault();
    try {
      const response = await api.post("rooms", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setRooms((prevRooms) => [...prevRooms, response.data]);
        toast.success("Room created successfully!", { toastId: "room-create" });
        console.log("Room created:", response.data);
      }
    } catch (error) {
      setErrors(error.response.data.errors);
      console.error("Error creating room:", error);
    }
  }

  function handleDeleteRoom(roomId) {
    return async (e) => {
      e.preventDefault();
      try {
        const usersResponse = await api.get(`rooms/${roomId}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userIds = usersResponse.data.map((user) => user.id);

        const response = await api.delete(`rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
          toast.success("Room deleted successfully!", { toastId: "room-delete" });
          console.log("Room deleted:", roomId);

          userIds.forEach((userId) => {
            socket.emit("user_kicked", userId);
          });
        }
      } catch (error) {
        console.error("Error deleting room:", error);
      }
    };
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  async function handleDeckChange(e) {
    const deckId = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      deck_id: deckId,
    }));

    if (deckId) {
      try {
        const response = await api.get(`decks/${deckId}/origins`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const origins = response.data;
        setFormData((prevData) => ({
          ...prevData,
          max_users: Object.keys(origins).length,
        }));
      } catch (error) {
        console.error("Error selecting deck:", error);
        toast.error("Error selecting deck. Please try again.", { toastId: "deck-select-error" });
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        max_users: 0,
      }));
    }
  }

  function handleOpenRoom(roomId) {
    navigate(`/rooms/${roomId}`);
  }

  function handleSort(key) {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  }

  function sortedRooms() {
    let sortableRooms = [...rooms];
    if (sortConfig !== null) {
      sortableRooms.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableRooms;
  }

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = sortedRooms().slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(rooms.length / itemsPerPage);

  return (
    <div className="container mx-auto p-4 flex">
      <ToastContainer />
      <div className="w-3/4 pr-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="mb-4 text-1xl font-bold text-gray-800">All Rooms</h3>
          <ReactPaginate
            previousLabel={"previous"}
            nextLabel={"next"}
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
          />
        </div>
        {rooms.length === 0 ? (
          <p className="text-center text-gray-600">There are no rooms! Let's create one.</p>
        ) : (
          <div>
            <ul className="space-y-4">
              {currentPageData.map((room) => (
                <li key={room.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold">{room.name}</p>
                    <p className="text-gray-600">{room.description}</p>
                    <p className="text-gray-500 text-sm">
                      Created by {admins[room.admin_id] && admins[room.admin_id].name} at {new Date(room.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleOpenRoom(room.id)}
                      className={`p-2 text-center text-white rounded-lg ${room.status === "active" || room.status === "finished" ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                      disabled={room.status === "active" || room.status === "finished"}
                    >
                      Open
                    </button>
                    <form action="" onSubmit={handleDeleteRoom(room.id)}>
                      <button disabled={room.status === "active"} className={`p-2 text-center text-white rounded-lg ${room.status === "active" ? "bg-gray-500 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}>
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="w-1/4">
        <h3 className="mb-4 text-1xl font-bold text-gray-800">Create New Room</h3>
        <form onSubmit={createRoom} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          <div>
            <label htmlFor="id" className="block text-gray-700">
              Room ID
            </label>
            <input type="text" id="id" name="id" value={formData.id} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            {errors.id && <p className="text-red-500">{errors.id[0]}</p>}
          </div>
          <div>
            <label htmlFor="name" className="block text-gray-700">
              Room Name
            </label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            {errors.name && <p className="text-red-500">{errors.name[0]}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-gray-700">
              Room Description
            </label>
            <input type="text" id="description" name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
            {errors.description && <p className="text-red-500">{errors.description[0]}</p>}
          </div>
          <div>
            <label htmlFor="deck_id" className="block text-gray-700">
              Deck
            </label>
            <select id="deck_id" name="deck_id" value={formData.deck_id} onChange={handleDeckChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
              <option value="">Select a deck</option>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name}
                </option>
              ))}
            </select>
            {errors.deck_id && <p className="text-red-500">{errors.deck_id[0]}</p>}
          </div>
          <div>
            <label htmlFor="max_users" className="block text-gray-700">
              Max Users
            </label>
            <input type="number" id="max_users" name="max_users" value={formData.max_users} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" readOnly />
          </div>
          <button type="submit" className="w-full p-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminHome;
