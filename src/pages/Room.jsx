import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../axios/axios";
import { AppContext } from "../context/AppContext";

const websocket = "http://localhost:5174";
const socket = io.connect(websocket);

const Room = () => {
  const { roomId } = useParams();
  const [users, setUsers] = useState([]);
  const { token } = useContext(AppContext);

  useEffect(() => {
    api
      .get(`/rooms/${roomId}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsers(response.data || []);
      })
      .catch((error) => {
        console.error("There was an error fetching the room users!", error);
      });

    socket.on("user_added", (newUser) => {
      setUsers((prevUsers) => [...prevUsers, newUser]);
    });

    socket.on("user_kicked", (userId) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    });

    return () => {
      socket.off("user_added");
      socket.off("user_kicked");
    };
  }, [roomId, token]);

  const handleKickUser = (userId) => {
    api
      .delete(`admin/rooms/${roomId}/kick/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        socket.emit("user_kicked", userId);
      })
      .catch((error) => {
        console.error("There was an error kicking the user!", error);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-center">Room {roomId}</h2>
        <h3 className="mb-4 text-xl font-bold text-center">Users in Room</h3>
        <ul>
          {Array.isArray(users) &&
            users.map((user) => (
              <li key={user.id} className="mb-2 flex justify-between items-center">
                <span>
                  {user.username} - ({user.email})
                </span>
                <button onClick={() => handleKickUser(user.id)} className="p-2 text-white bg-red-500 rounded">
                  Kick
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default Room;