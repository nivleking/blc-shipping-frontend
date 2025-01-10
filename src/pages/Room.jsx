import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../axios/axios";
import { AppContext } from "../context/AppContext";

const websocket = "http://localhost:5174";
const socket = io.connect(websocket);

const Room = ({ adminName }) => {
  const { roomId } = useParams();
  const [users, setUsers] = useState([]);
  const { user, token } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/room/${roomId}/users`, {
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
      if (user.id === userId) {
        navigate("/user-home");
      }
    });

    return () => {
      socket.off("user_added");
      socket.off("user_kicked");
    };
  }, [roomId, token, user, navigate]);

  const handleKickUser = (userId) => {
    api
      .delete(`room/${roomId}/kick/${userId}`, {
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

  const handleBack = () => {
    if (user.is_admin === 1) {
      navigate("/admin-home");
    } else {
      api
        .post(
          `room/${roomId}/leave`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => {
          socket.emit("user_kicked", user.id);
          navigate("/user-home");
        })
        .catch((error) => {
          console.error("There was an error leaving the room!", error);
        });
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gray-100">
      <div className="w-full bg-yellow-600 py-2">
        <div className="relative overflow-hidden h-8">
          <div className="absolute whitespace-nowrap animate-marquee-top text-white text-lg font-bold marquee-container italic">===WAITING ROOM===</div>
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center w-full">
        <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">
            {roomId} - {adminName}
          </h2>
          <h3 className="mb-4 text-xl font-semibold text-center text-gray-700">Users in Room</h3>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-300">#</th>
                <th className="py-2 px-4 border-b border-gray-300">Name</th>
                <th className="py-2 px-4 border-b border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users &&
                Array.isArray(users) &&
                users.map((singleUser, index) => (
                  <tr key={singleUser.id}>
                    <td className="py-2 px-4 border-b border-gray-300">{index + 1}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{singleUser.name}</td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      {user && user.is_admin === 1 && (
                        <button onClick={() => handleKickUser(singleUser.id)} className="p-2 text-white bg-red-500 rounded-lg hover:bg-red-600">
                          Kick
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button onClick={handleBack} className="mt-6 w-full p-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
            Back to Home
          </button>
        </div>
      </div>
      <div className="w-full bg-yellow-600 py-2">
        <div className="relative overflow-hidden h-8">
          <div className="absolute whitespace-nowrap animate-marquee-bottom text-white text-lg font-bold marquee-container italic">===WAITING ROOM===</div>
        </div>
      </div>
    </div>
  );
};

export default Room;
