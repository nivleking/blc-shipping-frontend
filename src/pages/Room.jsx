import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../axios/axios";
import { AppContext } from "../context/AppContext";

const websocket = "http://localhost:5174";
const socket = io.connect(websocket);

const Room = () => {
  const { roomId } = useParams();
  const [users, setUsers] = useState([]);
  const [adminName, setAdminName] = useState("");
  const [roomStatus, setRoomStatus] = useState("");
  const [showPortPopup, setShowPortPopup] = useState(false);
  const [ports, setPorts] = useState({});
  const [origins, setOrigins] = useState([]);
  const { user, token } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        // Room Detail
        const roomResponse = await api.get(`/room/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const adminId = roomResponse.data.admin_id;
        setRoomStatus(roomResponse.data.status); // Set room status

        // Admin Detail
        const adminResponse = await api.get(`/user/${adminId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdminName(adminResponse.data.name);

        // Users in This Room
        const usersResponse = await api.get(`/room/${roomId}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(usersResponse.data || []);

        // Deck Origins
        const originsResponse = await api.get(`/room/${roomId}/deck-origins`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Origins: ", originsResponse.data);
        setOrigins(originsResponse.data);
      } catch (error) {
        console.error("There was an error fetching the room details!", error);
      }
    };

    fetchRoomDetails();

    socket.on("user_added", (newUser) => {
      setUsers((prevUsers) => [...prevUsers, newUser]);
    });

    socket.on("user_kicked", (userId) => {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      if (user.id === userId) {
        navigate("/user-home");
      }
    });

    socket.on("start_simulation", (roomId) => {
      if (user.is_admin !== 1) {
        navigate(`/simulation2/${roomId}`);
      }
    });

    return () => {
      socket.off("user_added");
      socket.off("user_kicked");
      socket.off("start_simulation");
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

  async function startSimulation() {
    try {
      const res = await api.put(
        `/room/${roomId}`,
        {
          status: "active",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRoomStatus("active");
      console.log(res);
    } catch (error) {
      console.error("There was an error starting the simulation!", error);
    }
  }

  const handleStartSimulation = () => {
    socket.emit("start_simulation", roomId);
    startSimulation();
  };

  async function endSimulation() {
    try {
      const res = await api.put(
        `/room/${roomId}`,
        {
          status: "finished",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      for (let i = 0; i < users.length; i++) {
        socket.emit("user_kicked", users[i].id);
      }

      socket.emit("end_simulation", roomId);

      setRoomStatus("finished");
      console.log(res);
    } catch (error) {
      console.error("There was an error ending the simulation!", error);
    }
  }

  async function handleSwapBays() {
    try {
      const res = await api.put(
        `/room/${roomId}/swap-bays`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      socket.emit("swap_bays", roomId);
      console.log(res);
    } catch (error) {
      console.error("There was an error swapping bays!", error);
    }
  }

  const handleSetPorts = async () => {
    try {
      const res = await api.put(
        `/room/${roomId}/set-ports`,
        { ports },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res);
      setShowPortPopup(false);
    } catch (error) {
      console.error("There was an error setting the ports!", error);
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
            {roomId} - Admin: {adminName}
          </h2>
          <h3 className="mb-4 text-xl font-semibold text-center text-gray-700">Users in Room</h3>
          {roomStatus === "finished" && <div className="mb-4 text-center text-red-500 font-semibold">The simulation has ended.</div>}
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-300">#</th>
                <th className="py-2 px-4 border-b border-gray-300">Name</th>
                {user && user.is_admin === 1 && <th className="py-2 px-4 border-b border-gray-300">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users && Array.isArray(users) && users.length > 0 ? (
                users.map((singleUser, index) => (
                  <tr key={singleUser.id} className="text-center">
                    <td className="py-2 px-4 border-b border-gray-300">{index + 1}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{singleUser.name}</td>
                    {user && user.is_admin === 1 && (
                      <td className="py-2 px-4 border-b border-gray-300">
                        <button
                          onClick={() => handleKickUser(singleUser.id)}
                          className={`p-2 text-white rounded-lg ${roomStatus === "active" || roomStatus === "finished" ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
                          disabled={roomStatus === "active" || roomStatus === "finished"}
                        >
                          Kick
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-2 px-4 border-b border-gray-300 text-center italic text-gray-500">
                    Users will appear here once they join the room.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex flex-row gap-2">
            <button onClick={handleBack} className="mt-6 w-full p-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
              Home
            </button>

            {user && user.is_admin === 1 && roomStatus !== "active" && roomStatus !== "finished" && (
              <>
                <button onClick={() => setShowPortPopup(true)} className="mt-6 w-full p-3 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600">
                  SET PORTS
                </button>
                <button onClick={handleStartSimulation} className="mt-6 w-full p-3 text-white bg-green-500 rounded-lg hover:bg-green-600" disabled={users.length < 1}>
                  START!
                </button>
              </>
            )}

            {user && user.is_admin === 1 && roomStatus === "active" && (
              <button onClick={endSimulation} className="mt-6 w-full p-3 text-white bg-black rounded-lg hover:bg-gray-800">
                END SIMULATION
              </button>
            )}

            {user && user.is_admin === 1 && roomStatus === "active" && (
              <button onClick={handleSwapBays} className="mt-6 w-full p-3 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600">
                SWAP BAYS
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="w-full bg-yellow-600 py-2">
        <div className="relative overflow-hidden h-8">
          <div className="absolute whitespace-nowrap animate-marquee-bottom text-white text-lg font-bold marquee-container italic">===WAITING ROOM===</div>
        </div>
      </div>

      {showPortPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Set Ports for Users</h2>
            {users.map((singleUser) => (
              <div key={singleUser.id} className="mb-4">
                <label className="block text-gray-700">{singleUser.name}</label>
                <select className="w-full p-2 border border-gray-300 rounded" value={ports[singleUser.id] || ""} onChange={(e) => setPorts({ ...ports, [singleUser.id]: e.target.value })}>
                  <option value="">Select a port</option>
                  {Object.values(origins).map((origin) => (
                    <option key={origin} value={origin}>
                      {origin}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPortPopup(false)} className="p-2 bg-gray-500 text-white rounded">
                Cancel
              </button>
              <button onClick={handleSetPorts} className="p-2 bg-blue-500 text-white rounded">
                Set Ports
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
