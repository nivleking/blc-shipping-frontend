import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../axios/axios";
import { AppContext } from "../context/AppContext";

const Login = () => {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { setToken } = useContext(AppContext);

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const response = await api.post("user/login", {
        name: formData.name,
        password: formData.password,
      });

      if (response.status === 200) {
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("refreshToken", response.data.refresh_token);
        setToken(response.data.token);
        if (response.data.is_admin === 1) {
          navigate("/admin-home");
        } else {
          navigate("/user-home");
        }
      }
    } catch (error) {
      setErrors(error.response.data.errors);
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-300">
      <div className="p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h2 className="mb-6 text-3xl font-extrabold text-center text-gray-900">BLC Shipping Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.name && <p className="text-red-500">{errors.name[0]}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.password && <p className="text-red-500">{errors.password[0]}</p>}
          </div>
          <button type="submit" className="w-full py-3 mt-4 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
