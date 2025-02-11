import React, { useState, useEffect, useContext } from "react";
import { api } from "../../axios/axios";
import { AppContext } from "../../context/AppContext";
import ReactPaginate from "react-paginate";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import "./AdminHome.css";
import ConfirmationModal from "../../components/rooms/ConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminCreateAdmin = () => {
  const { token } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: "",
    is_admin: true,
    password: "",
    password_confirmation: "",
  });
  const [admins, setAdmins] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    adminId: null,
  });
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [currentAdminId, setCurrentAdminId] = useState(null);

  // Modify handleDeleteClick to check if admin is trying to delete themselves
  const handleDeleteClick = (admin) => {
    if (admin.is_super_admin) {
      setFormErrors({
        delete: ["Super Admin cannot be deleted"],
      });
      return;
    }

    if (admin.id === currentAdminId) {
      setFormErrors({
        delete: ["You cannot delete your own account"],
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      adminId: admin.id,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/users/${confirmModal.adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAdmins(admins.filter((admin) => admin.id !== confirmModal.adminId));
      setConfirmModal({ isOpen: false, adminId: null });
      toast.success("Admin deleted successfully");
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error("Failed to delete admin");
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentAdmin();
      fetchAdmins();
    }
  }, [token]);

  // Modify fetchCurrentAdmin to store full admin details
  async function fetchCurrentAdmin() {
    try {
      const response = await api.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentAdmin(response.data);
      setCurrentAdminId(response.data.id);
    } catch (error) {
      console.error("Error fetching current admin:", error);
    }
  }

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
      const dataToSubmit = { ...formData };

      if (editingAdmin && !dataToSubmit.password) {
        delete dataToSubmit.password;
        delete dataToSubmit.password_confirmation;
      }

      if (editingAdmin) {
        const changedFields = {};
        if (dataToSubmit.name !== editingAdmin.name) {
          changedFields.name = dataToSubmit.name;
        }
        if (dataToSubmit.password) {
          changedFields.password = dataToSubmit.password;
          changedFields.password_confirmation = dataToSubmit.password_confirmation;
        }

        await api.put(`/users/${editingAdmin.id}`, changedFields, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Admin updated successfully");
      } else {
        await api.post("/users/register", dataToSubmit, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("New admin created successfully");
      }

      setFormData({
        name: "",
        is_admin: true,
        password: "",
        password_confirmation: "",
      });
      setEditingAdmin(null);
      setFormErrors({});
      fetchAdmins();
    } catch (error) {
      setFormErrors(error.response.data.errors);
      console.error("Error creating/updating admin:", error);
      toast.error(error.response.data.message || "Something went wrong");
    }
  };

  const handleEdit = (admin) => {
    setFormData({
      name: admin.name,
      is_admin: true,
      password: "",
      password_confirmation: "",
    });
    setEditingAdmin(admin);
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = admins.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(admins.length / itemsPerPage);

  // Only show create form for super admin
  const renderCreateForm = () => {
    if (!currentAdmin?.is_super_admin) return null;

    return (
      <div className="mb-6 p-6 bg-white rounded-lg shadow-lg border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="ml-3 text-xl font-bold text-gray-900">{editingAdmin ? "Edit Admin" : "Create New Admin"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Admin Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter admin name"
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
                placeholder="Enter password"
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
            {editingAdmin ? "Update Admin" : "Create Admin"}
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
            <h3 className="ml-3 text-xl font-bold text-gray-900">Admin List</h3>
          </div>

          {formErrors.delete && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{formErrors.delete[0]}</p>
                </div>
              </div>
            </div>
          )}

          {admins.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No admins</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new admin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentPageData.map((admin, index) => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">{admin.name.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{admin.name}</p>
                      <p className="text-sm text-gray-500">
                        {admin.is_super_admin ? "Super Admin" : "Admin"}
                        {admin.id === currentAdminId && " (You)"}
                      </p>
                    </div>
                  </div>

                  {currentAdmin?.is_super_admin && !admin.is_super_admin && admin.id !== currentAdminId && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(admin)}
                        className="inline-flex items-center px-3 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        <AiFillEdit className="mr-2 h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(admin)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <AiFillDelete className="mr-2 h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {admins.length > itemsPerPage && (
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
        onClose={() => setConfirmModal({ isOpen: false, adminId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Admin"
        message="Are you sure you want to delete this admin? This action cannot be undone."
      />
    </div>
  );
};

export default AdminCreateAdmin;
