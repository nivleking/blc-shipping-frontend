import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { FaBars, FaSignOutAlt } from "react-icons/fa";
import { api } from "../axios/axios";

const UserNavbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, token, setToken, setUser } = useContext(AppContext);
  const navigate = useNavigate();

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
    <nav className="bg-gray-900 p-4 text-white flex justify-between items-center shadow-md z-50">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors mr-4">
          <FaBars />
        </button>
      </div>
      <div className="flex flex-row items-center gap-4">
        {user && user.name}
        <button onClick={handleLogout} className="flex items-center p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default UserNavbar;
