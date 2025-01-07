import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import api from "../axios/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const AdminConfigureAccounts = () => {
  const { token } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    is_admin: false,
    password: "",
    password_confirmation: "",
  });
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    async function fetchUsersAndAdmins() {
      try {
        const usersResponse = await api.get("all-users", {});
        setUsers(usersResponse.data);

        const adminsResponse = await api.get("all-admins", {});
        setAdmins(adminsResponse.data);
      } catch (error) {
        console.error("Error fetching users and admins:", error);
      }
    }

    if (token) {
      fetchUsersAndAdmins();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("user/register", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        if (formData.is_admin) {
          setAdmins((prevAdmins) => [...prevAdmins, response.data]);
        } else {
          setUsers((prevUsers) => [...prevUsers, response.data]);
        }
        console.log("User created:", response.data);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6 bg-gray-100 min-h-screen">
          <div className="p-6 bg-white rounded shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-center">Configure Accounts</h2>
            <form onSubmit={handleSubmit} className="mt-4">
              <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-2 mb-4 border rounded" />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 mb-4 border rounded" />
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input type="checkbox" name="is_admin" checked={formData.is_admin} onChange={handleChange} className="form-checkbox" />
                  <span className="ml-2">Is this user an admin?</span>
                </label>
              </div>
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-2 mb-4 border rounded" />
              <input type="password" name="password_confirmation" placeholder="Confirm Password" value={formData.password_confirmation} onChange={handleChange} className="w-full p-2 mb-4 border rounded" />
              <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded">
                Register
              </button>
            </form>
            <div className="mt-6">
              <h3 className="mb-4 text-xl font-bold text-center">Users</h3>
              <ul>
                {users.map((user) => (
                  <li key={user.id} className="mb-2">
                    {user.name} - {user.email}
                  </li>
                ))}
              </ul>
              <h3 className="mt-6 mb-4 text-xl font-bold text-center">Admins</h3>
              <ul>
                {admins.map((admin) => (
                  <li key={admin.id} className="mb-2">
                    {admin.name} - {admin.email}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfigureAccounts;
