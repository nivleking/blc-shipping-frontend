import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import api from "../../axios/axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const websocket = "http://localhost:5174";
const socket = io.connect(websocket);

const UserHome = () => {
  const { user, token } = useContext(AppContext);
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  async function handleJoinRoom(e) {
    e.preventDefault();
    try {
      const response = await api.post(
        `rooms/${roomId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Join room response:", response.data);
        socket.emit("user_added", user);
        navigate(`/rooms/${roomId}`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-center">User Home</h2>
      <p className="text-center">Welcome {user && user.email}</p>
      <form onSubmit={handleJoinRoom} className="mt-4 max-w-md mx-auto">
        <input type="text" name="roomId" placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} className="w-full p-2 mb-4 border rounded" />
        <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded">
          Join Room
        </button>
      </form>
    </div>
  );
};

export default UserHome;
