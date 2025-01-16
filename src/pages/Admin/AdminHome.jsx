import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../../axios/axios";
import { io } from "socket.io-client";

const websocket = "http://localhost:5174";
const socket = io.connect(websocket);

const AdminHome = () => {
  const { user, token } = useContext(AppContext);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [decks, setDecks] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState("");
  const [maxUsers, setMaxUsers] = useState(0);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [deckOrigins, setDeckOrigins] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await api.get("rooms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRooms(response.data);
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

    if (token) {
      fetchRooms();
      fetchDecks();
    }
  }, [token]);

  async function createRoom(e) {
    e.preventDefault();
    try {
      const response = await api.post(
        "rooms",
        {
          id: formData.id,
          name: formData.name,
          description: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setRooms((prevRooms) => [...prevRooms, response.data]);
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

  function handleOpenRoom(roomId) {
    setSelectedRoom(roomId);
    setShowDeckModal(true);
  }

  async function handleSelectDeck() {
    try {
      const response = await api.put(
        `rooms/${selectedRoom}/select-deck`,
        {
          deck_id: selectedDeck,
          max_users: maxUsers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setShowDeckModal(false);
        navigate(`/rooms/${selectedRoom}`);
      }
    } catch (error) {
      console.error("Error selecting deck:", error);
    }
  }

  async function handleDeckChange(e) {
    const deckId = e.target.value;
    setSelectedDeck(deckId);

    if (deckId) {
      try {
        const response = await api.get(`decks/${deckId}/origins`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const origins = response.data;
        setDeckOrigins(origins);
        setMaxUsers(Object.keys(origins).length);
      } catch (error) {
        console.error("Error fetching deck origins:", error);
      }
    } else {
      setDeckOrigins([]);
      setMaxUsers(0);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="mb-4 text-3xl font-bold text-center text-gray-800">Admin Home</h2>
      <p className="text-center text-gray-600">Welcome {user && user.email}</p>
      <form onSubmit={createRoom} className="mt-6 space-y-4 max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
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
        <button type="submit" className="w-full p-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
          Create Room
        </button>
      </form>
      <div className="mt-8">
        <h3 className="mb-4 text-2xl font-bold text-center text-gray-800">Rooms</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div key={room.id} className="p-6 bg-white rounded-lg shadow-md">
              <h4 className="mb-2 text-xl font-bold text-gray-800">
                {room.id} - {room.name}
              </h4>
              <p className="text-gray-600">{room.description}</p>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleOpenRoom(room.id)}
                  className={`flex-1 p-2 text-center text-white rounded-lg ${room.status === "active" || room.status === "finished" ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                  disabled={room.status === "active" || room.status === "finished"}
                >
                  Open
                </button>
                <form action="" onSubmit={handleDeleteRoom(room.id)} className="flex-1">
                  <button disabled={room.status === "active"} className={`w-full p-2 text-center text-white rounded-lg ${room.status === "active" ? "bg-gray-500 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}>
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDeckModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Select Deck for Room</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Deck</label>
              <select value={selectedDeck} onChange={handleDeckChange} className="w-full p-2 border border-gray-300 rounded">
                <option value="">Select a deck</option>
                {decks.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Max Users</label>
              <input type="number" value={maxUsers} onChange={(e) => setMaxUsers(e.target.value)} className="w-full p-2 border border-gray-300 rounded" readOnly />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeckModal(false)} className="p-2 bg-gray-500 text-white rounded">
                Cancel
              </button>
              <button onClick={handleSelectDeck} className="p-2 bg-blue-500 text-white rounded">
                Select Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
