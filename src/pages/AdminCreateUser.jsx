import React, { useState, useEffect, useContext } from "react";
import api from "../axios/axios";
import { AppContext } from "../context/AppContext";

const AdminCreateUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    is_admin: false,
    password: "",
    password_confirmation: "",
  });
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const { token } = useContext(AppContext);

  useEffect(() => {
    // Fetch users from the backend
    const fetchUsers = async () => {
      try {
        const response = await api.get("/all-users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/user/${editingUser.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await api.post("/user/register", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setFormData({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
      });
      setEditingUser(null);
      // Refresh users list
      const response = await api.get("/all-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error creating/updating user:", error);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      password_confirmation: "",
    });
    setEditingUser(user);
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh users list
      const response = await api.get("/all-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="container mx-auto mt-10 p-6 bg-white rounded shadow-md flex">
      <div className="w-1/2 pr-6">
        <h3 className="mb-4 text-2xl font-bold text-center">Users</h3>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-300">#</th>
              <th className="py-2 px-4 border-b border-gray-300">Name</th>
              <th className="py-2 px-4 border-b border-gray-300">Email</th>
              <th className="py-2 px-4 border-b border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td className="py-2 px-4 border-b border-gray-300">{index + 1}</td>
                <td className="py-2 px-4 border-b border-gray-300">{user.name}</td>
                <td className="py-2 px-4 border-b border-gray-300">{user.email}</td>
                <td className="py-2 px-4 border-b border-gray-300">
                  <button onClick={() => handleEdit(user)} className="mr-2 p-2 bg-yellow-500 text-white rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 bg-red-500 text-white rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-1/2 pl-6">
        <h2 className="mb-6 text-3xl font-bold text-center">Create User</h2>
        <form onSubmit={handleSubmit} className="mb-6">
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-3 mb-4 border rounded" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-3 mb-4 border rounded" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-3 mb-4 border rounded" />
          <input type="password" name="password_confirmation" placeholder="Confirm Password" value={formData.password_confirmation} onChange={handleChange} className="w-full p-3 mb-4 border rounded" />
          <button type="submit" className="w-full p-3 text-white bg-blue-500 rounded">
            {editingUser ? "Update" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateUser;
