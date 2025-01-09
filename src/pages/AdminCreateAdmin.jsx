import React, { useState, useEffect, useContext } from "react";
import api from "../axios/axios";
import { AppContext } from "../context/AppContext";

const AdminCreateAdmin = () => {
  const { token } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    is_admin: true,
    password: "",
    password_confirmation: "",
  });
  const [admins, setAdmins] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const adminsResponse = await api.get("/all-admins", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdmins(adminsResponse.data);
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    }

    if (token) {
      fetchAdmins();
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
      if (editingAdmin) {
        await api.put(`/user/${editingAdmin.id}`, formData, {
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
        is_admin: true,
        password: "",
        password_confirmation: "",
      });
      setEditingAdmin(null);
      // Refresh admins list
      const response = await api.get("/all-admins", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdmins(response.data);
    } catch (error) {
      console.error("Error creating/updating admin:", error);
    }
  };

  const handleEdit = (admin) => {
    setFormData({
      name: admin.name,
      email: admin.email,
      is_admin: true,
      password: "",
      password_confirmation: "",
    });
    setEditingAdmin(admin);
  };

  const handleDelete = async (adminId) => {
    try {
      await api.delete(`/user/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh admins list
      const response = await api.get("/all-admins", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdmins(response.data);
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  return (
    <div className="container mx-auto mt-10 p-6 bg-white rounded shadow-md flex">
      <div className="w-1/2 pr-6">
        <h3 className="mb-4 text-2xl font-bold text-center">Admins</h3>
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
            {admins.map((admin, index) => (
              <tr key={admin.id}>
                <td className="py-2 px-4 border-b border-gray-300">{index + 1}</td>
                <td className="py-2 px-4 border-b border-gray-300">{admin.name}</td>
                <td className="py-2 px-4 border-b border-gray-300">{admin.email}</td>
                <td className="py-2 px-4 border-b border-gray-300">
                  <button onClick={() => handleEdit(admin)} className="mr-2 p-2 bg-yellow-500 text-white rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(admin.id)} className="p-2 bg-red-500 text-white rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-1/2 pl-6">
        <h2 className="mb-6 text-3xl font-bold text-center">Create Admin</h2>
        <form onSubmit={handleSubmit} className="mb-6">
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-3 mb-4 border rounded" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-3 mb-4 border rounded" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-3 mb-4 border rounded" />
          <input type="password" name="password_confirmation" placeholder="Confirm Password" value={formData.password_confirmation} onChange={handleChange} className="w-full p-3 mb-4 border rounded" />
          <button type="submit" className="w-full p-3 text-white bg-blue-500 rounded">
            {editingAdmin ? "Update" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateAdmin;
