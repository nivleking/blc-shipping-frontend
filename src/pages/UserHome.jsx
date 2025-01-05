import { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import api from "../axios/axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const websocket = "http://localhost:5174";
const socket = io.connect(websocket);

const UserHome = () => {
  const { user, setUser, setToken, token } = useContext(AppContext);
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  async function handleLogout(e) {
    e.preventDefault();
    try {
      await api.post(
        "user/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem("token");
      setToken(null);
      setUser({});
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred during logout");
    }
  }

  async function handleJoinRoom(e) {
    e.preventDefault();
    try {
      const response = await api.post(
        `user/rooms/${roomId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Joined room successfully");
        console.log("Join room response:", response.data);
        socket.emit("user_added", user);
        navigate(`/room/${roomId}`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      alert("An error occurred while joining the room");
    }
  }

  useEffect(() => {
    console.log("User in UserHome:", user);
  }, [user]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-center">User Home</h2>
        <p>Welcome {user && user.email}</p>
        <form action="" onSubmit={handleLogout}>
          <button className="w-full p-2 mt-4 text-white bg-red-500 rounded">Logout</button>
        </form>
        <form onSubmit={handleJoinRoom} className="mt-4">
          <input
            type="text"
            name="roomId"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded">
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserHome;