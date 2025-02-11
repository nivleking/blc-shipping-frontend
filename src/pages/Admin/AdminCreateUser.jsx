import React, { useState, useEffect, useContext } from "react";
import { api } from "../../axios/axios";
import { AppContext } from "../../context/AppContext";
import ReactPaginate from "react-paginate";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import "./AdminHome.css";
import ConfirmationModal from "../../components/rooms/ConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminCreateUser = () => {
  const [formData, setFormData] = useState({
    name: "",
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

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: null,
  });

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
      console.log("Users:", response.data);
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
      is_admin: false,
      password: "",
      password_confirmation: "",
    });
    setEditingUser(user);
  };

  const handleDeleteClick = (user) => {
    setConfirmModal({
      isOpen: true,
      userId: user.id,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/users/${confirmModal.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(users.filter((user) => user.id !== confirmModal.userId));
      setConfirmModal({ isOpen: false, userId: null });
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData };

      if (editingUser && !dataToSubmit.password) {
        delete dataToSubmit.password;
        delete dataToSubmit.password_confirmation;
      }

      if (editingUser) {
        const changedFields = {};
        if (dataToSubmit.name !== editingUser.name) {
          changedFields.name = dataToSubmit.name;
        }
        if (dataToSubmit.password) {
          changedFields.password = dataToSubmit.password;
          changedFields.password_confirmation = dataToSubmit.password_confirmation;
        }

        await api.put(`/users/${editingUser.id}`, changedFields, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("User updated successfully");
      } else {
        await api.post("/users/register", dataToSubmit, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("New user created successfully");
      }

      setFormData({
        name: "",
        is_admin: false,
        password: "",
        password_confirmation: "",
      });
      setEditingUser(null);
      setFormErrors({});
      fetchUsers();
    } catch (error) {
      setFormErrors(error.response.data.errors);
      console.error("Error creating/updating user:", error);
      toast.error(error.response.data.message || "Something went wrong");
    }
  };

  const renderCreateForm = () => {
    return (
      <div className="mb-6 p-6 bg-white rounded-lg shadow-lg border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="ml-3 text-xl font-bold text-gray-900">{editingUser ? "Edit User" : "Create New User"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                User Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter user name"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name[0]}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
              />
              {formErrors.password && <p className="mt-1 text-sm text-red-500">{formErrors.password[0]}</p>}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <button type="submit" className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            {editingUser ? "Update User" : "Create User"}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
        toastStyle={{
          backgroundColor: "#ffffff",
          color: "#1f2937",
          borderRadius: "0.5rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          fontSize: "0.875rem",
          padding: "1rem",
        }}
      />
      {renderCreateForm()}
      <div className="bg-white rounded-lg shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="ml-3 text-xl font-bold text-gray-900">User List</h3>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentPageData.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">Role: User</p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(user)}
                      className="inline-flex items-center px-3 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      <AiFillEdit className="mr-2 h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <AiFillDelete className="mr-2 h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {users.length > itemsPerPage && (
            <div className="mt-6">
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
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, userId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
};

export default AdminCreateUser;
