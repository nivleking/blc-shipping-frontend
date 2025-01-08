import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import api from "../axios/axios";

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

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const adminsResponse = await api.get("all-admins", {
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
      const response = await api.post("user/register", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        setAdmins((prevAdmins) => [...prevAdmins, response.data]);
        console.log("Admin created:", response.data);
      }
    } catch (error) {
      console.error("Error creating admin:", error);
    }
  };

  return (
    <>
      <h2 className="mb-4 text-2xl font-bold text-center">Create Admin</h2>
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
        <h3 className="mb-4 text-xl font-bold text-center">Admins</h3>
        <ul>
          {admins.map((admin) => (
            <li key={admin.id} className="mb-2">
              {admin.name} - {admin.email}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default AdminCreateAdmin;
