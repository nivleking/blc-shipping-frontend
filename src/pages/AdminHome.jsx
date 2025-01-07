import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../axios/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

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

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6 bg-gray-100 min-h-screen">
          <div className="p-6 bg-white rounded shadow-md">
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
                    <Link to={`/room/${room.id}`} className="mt-4 rounded-lg bg-gray-100 text-center">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
