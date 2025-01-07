import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import api from "../axios/axios";

const Navbar = () => {
  const { token, setToken, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
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
      navigate("/admin-login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <div className="text-lg font-bold">Admin Dashboard</div>
      <button onClick={handleLogout} className="p-2 bg-red-500 rounded">
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
