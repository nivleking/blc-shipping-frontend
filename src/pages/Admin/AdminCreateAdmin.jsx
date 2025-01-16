import React, { useState, useEffect, useContext } from "react";
import api from "../../axios/axios";
import { AppContext } from "../../context/AppContext";

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
  const [formErrors, setFormErrors] = useState({});

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
        await api.put(`/users/${editingAdmin.id}`, formData, {
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
      setFormErrors(error.response.data.errors);
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
      await api.delete(`/users/${adminId}`, {
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
    <div className="container mx-auto mt-10 p-6">
      <div className="mb-6 p-6 bg-white rounded shadow-md">
        <h3 className="mb-6 text-2xl font-bold text-center">{editingAdmin ? "Edit Admin Account" : "Create Admin Account"}</h3>
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
            {editingAdmin ? "Update" : "Create"}
          </button>
        </form>
      </div>
      <div className="p-6 bg-white rounded shadow-md">
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
    </div>
  );
};

export default AdminCreateAdmin;
