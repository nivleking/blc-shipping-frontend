import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { FaBars, FaBell, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { api } from "../../axios/axios";

const AdminNavbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, token, setToken, setUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  const { date, time } = formatDateTime(currentDate);

  async function handleLogout(e) {
    e.preventDefault();
    try {
      await api.post(
        "users/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      sessionStorage.removeItem("token");
      setToken(null);
      setUser({});
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <nav
      className={`
        fixed top-0 right-0 h-16
        transition-all duration-300 ease-in-out
        backdrop-blur-md bg-gray-900/95 border-b border-gray-800
        flex items-center justify-between
        px-4 md:px-6
        z-50 print:hidden
        ${isSidebarOpen ? "left-64" : "left-20"}
      `}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-800
            active:bg-gray-700 transition-all duration-200"
          aria-label="Toggle Sidebar"
        >
          <FaBars className="w-5 h-5 text-gray-300" />
        </button>

        <div className="hidden md:block">
          <p className="text-sm font-medium text-gray-300">{date}</p>
          <p className="text-sm text-gray-400 mt-0.5">{time}</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Admin Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
          <div className="relative">
            <img
              src="/blc-shipping/blc_circle.png"
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
            />
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>

          <button
            onClick={handleLogout}
            className="ml-2 p-2 rounded-full hover:bg-red-500/20
              group transition-all duration-200"
            aria-label="Logout"
          >
            <FaSignOutAlt
              className="w-5 h-5 text-red-500 
              group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
