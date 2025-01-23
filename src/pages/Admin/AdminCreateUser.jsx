import React, { useState, useEffect, useContext } from "react";
import api from "../../axios/axios";
import { AppContext } from "../../context/AppContext";
import ReactPaginate from "react-paginate";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import "./AdminHome.css";

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

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = users.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(users.length / itemsPerPage);

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
    <div className="container mx-auto p-4">
      <div className="mb-6 p-6 bg-white rounded shadow-md">
        <h2 className="mb-4 text-1xl font-bold">{editingUser ? "Edit User" : "Create User"}</h2>
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
      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-1xl font-bold text-gray-800 mb-4">All Users</h3>
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

        {users.length === 0 ? (
          <p className="text-center text-gray-600">There are no users! Let's create one!</p>
        ) : (
          <div className="space-y-4">
            {currentPageData.map((user, index) => (
              <div key={user.id} className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="text-black px-2 py-1 rounded-lg w-12 text-center">{offset + index + 1}</div>
                </div>
                <div className="ml-4 flex-grow">
                  <p className="text-lg font-bold">{user.name}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <p className="text-gray-400 text-sm">Role: {user.is_admin ? "Admin" : "User"}</p>
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => handleEdit(user)} className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300 flex items-center">
                    <AiFillEdit className="mr-1" /> Edit
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 flex items-center">
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

export default AdminCreateUser;
