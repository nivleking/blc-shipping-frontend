import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { api, socket } from "../../axios/axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UserHome.css";
import LoadingOverlay from "../../components/LoadingOverlay";

const UserHome = () => {
  const { user, token } = useContext(AppContext);
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const navigate = useNavigate();

  const loadingMessages = ["Searching room...", "Verifying room..."];

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  async function handleJoinRoom(e) {
    e.preventDefault();
    setError("");

    if (!roomId) {
      toast.error("Please enter a Room ID");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 4500));

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
        socket.emit("user_added", { roomId, newUser: user });

        navigate(`/rooms/${roomId}`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer autoClose={2000} />

      {isLoading && <LoadingOverlay messages={loadingMessages} currentMessageIndex={currentMessageIndex} title="Searching Room..." />}

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-xl text-gray-600 mb-8">{user?.name || user?.email}</p>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
                Room ID
              </label>
              <input
                id="roomId"
                type="text"
                name="roomId"
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="appearance-none block w-full px-3 py-3 border 
                         border-gray-300 rounded-md shadow-sm placeholder-gray-400 
                         focus:outline-none focus:ring-indigo-500 
                         focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border 
                       border-transparent rounded-md shadow-sm text-sm 
                       font-medium text-white bg-indigo-600 
                       hover:bg-indigo-700 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 
                       focus:ring-indigo-500 transition-colors 
                       duration-200"
            >
              Join Room
            </button>
          </form>

          {error && <div className="mt-4 text-center text-sm text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default UserHome;
