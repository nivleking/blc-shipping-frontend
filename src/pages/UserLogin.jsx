import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../axios/axios";
import { AppContext } from "../context/AppContext";

const UserLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const { setToken } = useContext(AppContext);

  async function handleLogin(e) {
    e.preventDefault();
    const response = await api.post("user/login", {
      username: formData.username,
      password: formData.password,
    });

    if (response.status === 200) {
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      navigate("/user-home");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-center">User Login</h2>
        <form onSubmit={handleLogin}>
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="w-full p-2 mb-4 border rounded" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-2 mb-4 border rounded" />
          <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded">
            Login
          </button>
        </form>

        <p className="mt-4 text-center">
          Not an user?{" "}
          <Link to="/admin-login" className="text-blue-500 underline">
            Click here for Admin
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserLogin;
