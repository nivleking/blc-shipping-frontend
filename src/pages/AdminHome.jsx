import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

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
    <>
      <h2 className="mb-4 text-2xl font-bold text-center">Admin Home</h2>
      <p>Welcome {user && user.email}</p>
      <form onSubmit={createRoom} className="mt-4">
        <input type="text" name="id" placeholder="Room ID" value={formData.id} onChange={handleChange} className="w-full p-2 mb-4 border rounded" />
        <input type="text" name="name" placeholder="Room Name" value={formData.name} onChange={handleChange} className="w-full p-2 mb-4 border rounded" />
        <input type="text" name="description" placeholder="Room Description" value={formData.description} onChange={handleChange} className="w-full p-2 mb-4 border rounded" />
        <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded">
          Create Room
        </button>
      </form>
      <div className="mt-6">
        <h3 className="mb-4 text-xl font-bold text-center">Rooms</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div key={room.id} className="p-4 bg-white rounded shadow-md">
              <h4 className="mb-2 text-lg font-bold">
                {room.id} - {room.name}
              </h4>
              <p>{room.description}</p>
              <div className="flex space-x-2">
                <Link to={`/room/${room.id}`} className="mt-4 block p-2 text-center text-white bg-blue-500 rounded">
                  View
                </Link>

                <form action="" onSubmit={handleDeleteRoom(room.id)}>
                  <button className="mt-4 block p-2 text-center text-white bg-red-500 rounded" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminHome;
