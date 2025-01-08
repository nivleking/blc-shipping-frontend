import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import api from "../axios/axios";

const AdminCreateUser = () => {
  const { token } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    is_admin: false,
    password: "",
    password_confirmation: "",
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersResponse = await api.get("all-users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
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
        setUsers((prevUsers) => [...prevUsers, response.data]);
        console.log("User created:", response.data);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <>
      <h2 className="mb-4 text-2xl font-bold text-center">Create User</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-2 mb-4 border rounded" />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 mb-4 border rounded" />
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
      </div>
    </>
  );
};

export default AdminCreateUser;
