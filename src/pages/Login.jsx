import { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../axios/axios";
import axios from "axios";
import ActiveSessionModal from "./ActiveSessionModal";
import { AppContext } from "../context/AppContext";
import LoadingOverlay from "../components/LoadingOverlay";
import useToast from "../toast/useToast";

const Login = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { setToken } = useContext(AppContext);

  // State untuk modal sesi aktif
  const [showActiveSessionModal, setShowActiveSessionModal] = useState(false);
  const [activeSessionInfo, setActiveSessionInfo] = useState(null);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      showError(errors[Object.keys(errors)[0]][0]);
    }
  }, [errors]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const loadingMessages = ["Verifying credentials..."];

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setIsLoading(true);

      // 1. Get CSRF cookie - use absolute URL to avoid path issues
      const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");
      await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      // 2. Make login request - properly awaited
      try {
        const response = await api.post("users/login", {
          name: formData.name,
          password: formData.password,
        });

        // 3. Now we can safely check the response
        if (response.status === 200) {
          // For cookie-based auth, no need to store token in sessionStorage
          // But if your API still returns tokens, keep this for backward compatibility
          if (response.data.token) {
            sessionStorage.setItem("token", response.data.token);
            setToken(response.data.token);
          }

          showSuccess("Login successful!");
          if (response.data.is_admin === 1 || response.data.is_admin === true) {
            navigate("/admin-home");
          } else {
            navigate("/user-home");
          }
        }
      } catch (error) {
        // Check if this is a "session conflict" error (409 status)
        if (error.response && error.response.status === 409) {
          // Show modal with active session info
          setActiveSessionInfo(error.response.data.active_session);
          setShowActiveSessionModal(true);
        } else {
          // Handle other errors
          if (error.response && error.response.data && error.response.data.errors) {
            setErrors(error.response.data.errors);
          } else {
            showError("Login failed: " + (error.response?.data?.message || "An unexpected error occurred"));
            console.error("Login error:", error);
          }
        }
      }
    } catch (error) {
      showError("Login failed: " + (error.response?.data?.message || "An unexpected error occurred"));
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Handler for forcing logout of other sessions
  async function handleForceLogout() {
    try {
      setIsLoading(true);

      // Force logout API call
      const response = await api.post("users/force-logout", {
        name: formData.name,
        password: formData.password,
      });

      // Handle successful login after force logout
      if (response.data.token) {
        sessionStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        showSuccess("Successfully logged in and terminated other sessions");
        setShowActiveSessionModal(false);

        if (response.data.is_admin === 1 || response.data.is_admin === true) {
          navigate("/admin-home");
        } else {
          navigate("/user-home");
        }
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to terminate other sessions");
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gradient-to-tr from-black to-[#3b82f6]">
      {isLoading && <LoadingOverlay messages={loadingMessages} currentMessageIndex={currentMessageIndex} title="Logging in..." />}

      {/* Render ActiveSessionModal */}
      <ActiveSessionModal isOpen={showActiveSessionModal} onClose={() => setShowActiveSessionModal(false)} onForceLogout={handleForceLogout} sessionInfo={activeSessionInfo} />

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Link to="/">
              <h2 className="text-center text-2xl mb-2 font-bold tracking-tight text-black cursor-pointer">BLC Shipping</h2>
            </Link>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              </div>
              <div className="mt-1">
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Log in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
