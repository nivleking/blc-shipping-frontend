import React, { useState, useEffect, useContext } from "react";
import api from "../../axios/axios";
import { AppContext } from "../../context/AppContext";

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
  const [formErrors, setFormErrors] = useState({});
  const { token } = useContext(AppContext);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  async function fetchUsers() {
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
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      is_admin: false,
      password: "",
      password_confirmation: "",
    });
    setEditingUser(user);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await api.post("/users/register", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setFormData({
        name: "",
        email: "",
        is_admin: false,
        password: "",
        password_confirmation: "",
      });
      setEditingUser(null);

      fetchUsers();
    } catch (error) {
      setFormErrors(error.response.data.errors);
      console.error("Error creating/updating user:", error);
    }
  }

  async function handleDelete(userId) {
    try {
      await api.delete(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  return (
    <div className="container mx-auto mt-10 p-6">
      <div className="mb-6 p-6 bg-white rounded shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">{editingUser ? "Edit User" : "Create User"}</h2>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">
              Name
            </label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded" />
            {formErrors.name && <p className="text-red-500">{formErrors.name[0]}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">
              Email
            </label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded" />
            {formErrors.email && <p className="text-red-500">{formErrors.email[0]}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 border rounded" />
            {formErrors.password && <p className="text-red-500">{formErrors.password[0]}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="password_confirmation" className="block text-gray-700">
              Confirm Password
            </label>
            <input type="password" id="password_confirmation" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="w-full p-3 border rounded" />
          </div>
          <button type="submit" className="w-full p-3 text-white bg-blue-500 rounded">
            {editingUser ? "Update" : "Create"}
          </button>
        </form>
      </div>
      <div className="p-6 bg-white rounded shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-center">Users</h2>
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
    </div>
  );
};

export default AdminCreateUser;
