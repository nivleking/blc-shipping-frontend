import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";
import api from "../axios/axios";
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

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await api.get("room", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRooms(response.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    }

    if (token) {
      fetchRooms();
    }
  }, [token]);

  async function createRoom(e) {
    e.preventDefault();
    try {
      const response = await api.post(
        "room",
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
        // Fetch users in the room
        const usersResponse = await api.get(`room/${roomId}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userIds = usersResponse.data.map((user) => user.id);

        // Delete the room
        const response = await api.delete(`room/${roomId}`, {
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

  return (
    <div className="container mx-auto p-4">
      <h2 className="mb-4 text-3xl font-bold text-center text-gray-800">Admin Home</h2>
      <p className="text-center text-gray-600">Welcome {user && user.email}</p>
      <form onSubmit={createRoom} className="mt-6 space-y-4 max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        <input type="text" name="id" placeholder="Room ID" value={formData.id} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
        {errors.id && <p className="text-red-500">{errors.id[0]}</p>}
        <input type="text" name="name" placeholder="Room Name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
        {errors.name && <p className="text-red-500">{errors.name[0]}</p>}
        <input type="text" name="description" placeholder="Room Description" value={formData.description} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
        {errors.description && <p className="text-red-500">{errors.description[0]}</p>}
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
                <Link to={`/room/${room.id}`} className="flex-1 p-2 text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                  View
                </Link>
                <form action="" onSubmit={handleDeleteRoom(room.id)} className="flex-1">
                  <button className="w-full p-2 text-center text-white bg-red-500 rounded-lg hover:bg-red-600" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
