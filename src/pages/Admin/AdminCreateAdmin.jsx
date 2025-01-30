import React, { useState, useEffect, useContext } from "react";
import { api } from "../../axios/axios";
import { AppContext } from "../../context/AppContext";
import ReactPaginate from "react-paginate";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import "./AdminHome.css";

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
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    if (token) {
      fetchAdmins();
    }
  }, [token]);

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

      fetchAdmins();
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

  async function handleDelete(adminId) {
    try {
      await api.delete(`/users/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAdmins(admins.filter((admin) => admin.id !== adminId));
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  }

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = admins.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(admins.length / itemsPerPage);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 p-6 bg-white rounded shadow-md">
        <h2 className="mb-4 text-1xl font-bold">{editingAdmin ? "Edit Admin" : "Create Admin"}</h2>
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
      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-1xl font-bold text-gray-800 mb-4">All Admins</h3>
          <ReactPaginate
            previousLabel={"Previous"}
            nextLabel={"Next"}
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
            previousClassName={"page-item"}
            nextClassName={"page-item"}
            pageClassName={"page-item"}
            pageLinkClassName={"page-link"}
            previousLinkClassName={"page-link"}
            nextLinkClassName={"page-link"}
            breakLinkClassName={"page-link"}
          />
        </div>

        {admins.length === 0 ? (
          <p className="text-center text-gray-600">There are no admins! Let's create one!</p>
        ) : (
          <div className="space-y-4">
            {currentPageData.map((admin, index) => (
              <div key={admin.id} className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="text-black px-2 py-1 rounded-lg w-12 text-center">{offset + index + 1}</div>
                </div>
                <div className="ml-4 flex-grow">
                  <p className="text-lg font-bold">{admin.name}</p>
                  <p className="text-gray-400 text-sm">{admin.email}</p>
                  <p className="text-gray-400 text-sm">Role: Admin</p>
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => handleEdit(admin)} className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300 flex items-center">
                    <AiFillEdit className="mr-1" /> Edit
                  </button>
                  <button onClick={() => handleDelete(admin.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 flex items-center">
                    <AiFillDelete className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCreateAdmin;
