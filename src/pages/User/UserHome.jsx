import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { api, socket } from "../../axios/axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UserHome.css";

const LoadingOverlay = ({ messages, currentMessageIndex }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Searching Room...</h3>
          <p className="text-gray-600 animate-pulse">{messages[currentMessageIndex]}</p>
        </div>
      </div>
    </div>
  </div>
);

// const Ship = () => (
//   <svg className="ship" viewBox="0 0 120 100">
//     {/* Ship Hull */}
//     <path d="M15 50 L35 50 L45 40 L75 40 L85 50 L105 50 L105 60 L15 60 Z" fill="#334155" stroke="#1e293b" strokeWidth="2" />
//     {/* Ship Bridge */}
//     <rect x="50" y="28" width="15" height="12" fill="#475569" />
//     <circle cx="57" cy="34" r="2" fill="#fff" />
//     {/* Containers */}
//     <rect x="35" y="35" width="12" height="8" fill="#ef4444" /> {/* Red */}
//     <rect x="47" y="35" width="12" height="8" fill="#22c55e" /> {/* Green */}
//     <rect x="59" y="35" width="12" height="8" fill="#eab308" /> {/* Yellow */}
//     {/* Stacked Containers */}
//     <rect x="41" y="27" width="12" height="8" fill="#3b82f6" /> {/* Blue */}
//     <rect x="53" y="27" width="12" height="8" fill="#ec4899" /> {/* Pink */}
//   </svg>
// );

// const Wave = ({ className }) => (
//   <svg className={`wave ${className}`} viewBox="0 0 1000 200" preserveAspectRatio="none">
//     <polygon
//       points="0,200 0,100 25,110 50,90 75,120 100,85 125,115 150,90 175,120 200,90 225,115 250,90 275,120 300,90 325,115 350,90 375,120 400,90 425,115 450,90 475,120 500,90 525,115 550,90 575,120 600,90 625,115 650,90 675,120 700,90 725,115 750,90 775,120 800,90 825,115 850,90 875,120 900,90 925,115 950,90 975,120 1000,90 1000,200"
//       fill="#2563eb"
//       opacity="0.8"
//     />
//   </svg>
// );

// const Ocean = () => (
//   <div className="ocean-container">
//     <div className="ocean">
//       <Wave className="wave-front" />
//       <Wave className="wave-back" />
//     </div>
//   </div>
// );

const UserHome = () => {
  const { user, token } = useContext(AppContext);
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const navigate = useNavigate();

  const loadingMessages = ["Scanning available rooms...", "Checking room capacity...", "Verifying room status...", "Establishing connection...", "Almost there..."];

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
        socket.emit("user_added", user);
        navigate(`/rooms/${roomId}`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("No room found with that ID");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* <Ocean />
      <Ship /> */}
      <div className="relative z-10 py-12">
        <ToastContainer />
        {isLoading && <LoadingOverlay messages={loadingMessages} currentMessageIndex={currentMessageIndex} />}
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
    </div>
  );
};

export default UserHome;
