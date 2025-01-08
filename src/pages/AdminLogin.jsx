import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../axios/axios";
import { AppContext } from "../context/AppContext";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const navigate = useNavigate();
  const { setToken } = useContext(AppContext);

  async function handleLogin(e) {
    e.preventDefault();
    const response = await api.post("user/login", {
      name: formData.name,
      password: formData.password,
    });

    if (response.status === 200) {
      sessionStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      navigate("/admin-home");
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
        <h2 className="mb-4 text-2xl font-bold text-center">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-2 mb-4 border rounded" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-2 mb-4 border rounded" />
          <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded">
            Login
          </button>
        </form>

        <p className="mt-4 text-center">
          Not an admin?{" "}
          <Link to="/" className="text-blue-500 underline">
            Click here for user
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
