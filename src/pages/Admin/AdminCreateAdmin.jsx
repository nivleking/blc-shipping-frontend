import React, { useState, useEffect, useContext } from "react";
import { api } from "../../axios/axios";
import { AppContext } from "../../context/AppContext";
import ReactPaginate from "react-paginate";
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { IoEyeOutline, IoEyeOffOutline, IoTimeOutline, IoCreateOutline, IoRefreshOutline, IoEnterOutline, IoStatsChartOutline, IoShieldCheckmark } from "react-icons/io5";
import Tooltip from "../../components/Tooltip";
import PasswordConfirmationModal from "../../components/rooms/PasswordConfirmationModal";
import "./AdminHome.css";
import ConfirmationModal from "../../components/rooms/ConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminCreateAdmin = () => {
  const { user, token } = useContext(AppContext);
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
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});
  // Add these state declarations after other useState declarations
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    adminId: null,
  });

  // Add this function to handle password visibility
  const togglePasswordVisibility = async (adminId) => {
    if (visiblePasswords[adminId]) {
      setVisiblePasswords((prev) => {
        const newState = { ...prev };
        delete newState[adminId];
        return newState;
      });
    } else {
      setPasswordModal({
        isOpen: true,
        adminId: adminId,
      });
    }
  };

  // Add password confirmation handler
  const handlePasswordConfirm = async (superAdminPassword) => {
    try {
      const response = await api.post(
        `/users/${passwordModal.adminId}/password`,
        { super_admin_password: superAdminPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.password) {
        setVisiblePasswords((prev) => ({
          ...prev,
          [passwordModal.adminId]: response.data.password,
        }));
        setPasswordVisibility((prev) => ({
          ...prev,
          [passwordModal.adminId]: false,
        }));
        toast.success("Password retrieved successfully");
      }

      setPasswordModal({ isOpen: false, adminId: null });
    } catch (error) {
      console.error("Error fetching password:", error);
      toast.error(error.response?.data?.message || "Failed to retrieve password");
      setPasswordModal({ isOpen: false, adminId: null });
    }
  };

  const handleDeleteClick = (admin) => {
    if (admin.is_super_admin) {
      setFormErrors({
        delete: ["Super Admin cannot be deleted"],
      });
      return;
    }

    if (admin.id === user.id) {
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
      fetchAdmins();
    }
  }, [token]);

  async function fetchAdmins() {
    try {
      const response = await api.get("/all-admins", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const processedAdmins = response.data.map((admin) => ({
        ...admin,
        status: admin.status || "active",
        login_count: admin.login_count || 0,
        last_login_at: admin.last_login_at || null,
        created_by: admin.created_by || { name: "System" },
        updated_by: admin.updated_by || null,
      }));

      setAdmins(processedAdmins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to fetch admins");
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
  const [searchTerm, setSearchTerm] = useState("");
  const filteredAdmins = admins.filter((admin) => admin.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentPageData = filteredAdmins.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredAdmins.length / itemsPerPage);

  const renderCreateForm = () => {
    if (!user?.is_super_admin) return null;

    return (
      <div className="bg-white p-8 rounded-lg shadow-lg mb-4">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h3 className="ml-3 text-1xl font-bold text-gray-800">{editingAdmin ? "Edit Admin" : "Create New Admin"}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Admin Name Field */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label htmlFor="name" className="block text-gray-700 font-semibold">
                  Admin Name
                </label>
                <Tooltip>Enter a unique name for the admin. This name will be used for identification purposes.</Tooltip>
              </div>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter admin name" />
              {formErrors.name && <p className="text-red-500 mt-1 text-sm">{formErrors.name[0]}</p>}
            </div>

            {/* Password Field */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label htmlFor="password" className="block text-gray-700 font-semibold">
                  Password
                </label>
                <Tooltip>Password must be at least 8 characters long, include at least one number, include at least one special character (@$!%*#?&)</Tooltip>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder={editingAdmin ? "Leave blank to keep current password" : "Enter password"}
              />
              {formErrors.password && <p className="text-red-500 mt-1 text-sm">{formErrors.password[0]}</p>}
            </div>

            {/* Password Confirmation Field */}
            <div className="flex flex-col">
              <div className="flex items-center">
                <label htmlFor="password_confirmation" className="block text-gray-700 font-semibold">
                  Confirm Password
                </label>
                <Tooltip>Re-enter the password to confirm. Both passwords must match.</Tooltip>
              </div>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div className="flex justify-start">
            <button type="submit" className="p-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300">
              {editingAdmin ? "Update Admin" : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
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
          <div className="flex justify-between items-center mb-6">
            {/* Left side - Title and Icon */}
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="ml-3 text-xl font-bold text-gray-900">Admin List</h3>
            </div>

            {/* Right side - Search Box */}
            <div className="w-72">
              <div className="relative">
                <input type="text" placeholder="Search admins..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:border-blue-500" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
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
                <div key={admin.id} className="flex flex-col sm:flex-row items-start justify-between p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start space-x-6 w-full">
                    {/* Avatar and Status Column */}
                    <div className="flex flex-col items-center space-y-3 pt-2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium text-xl">{admin.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1
            ${admin.is_super_admin ? "bg-yellow-100 text-yellow-800" : "bg-indigo-100 text-indigo-800"}`}
                        >
                          <IoShieldCheckmark className="w-4 h-4 mr-1" />
                          {admin.is_super_admin ? "Super Admin" : "Admin"}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full 
            ${admin.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                        >
                          {admin.status}
                        </span>
                      </div>
                    </div>

                    {/* Admin Details Column */}
                    <div className="flex flex-col flex-grow">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm font-medium text-gray-500">#{offset + index + 1}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{admin.name}</h3>
                        {user && admin.id === user.id && <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">You</span>}
                      </div>

                      {/* Password Field - jika dibutuhkan */}
                      {visiblePasswords[admin.id] && (
                        <div className="mb-4 flex items-center space-x-2">
                          <div className="relative flex items-center">
                            <input type={passwordVisibility[admin.id] ? "text" : "password"} value={visiblePasswords[admin.id]} readOnly className="pr-10 pl-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm w-48" />
                            <button
                              onClick={() =>
                                setPasswordVisibility((prev) => ({
                                  ...prev,
                                  [admin.id]: !prev[admin.id],
                                }))
                              }
                              className="absolute right-2 p-1 text-gray-500 hover:text-gray-700"
                              type="button"
                            >
                              {passwordVisibility[admin.id] ? <IoEyeOffOutline className="w-4 h-4" /> : <IoEyeOutline className="w-4 h-4" />}
                            </button>
                          </div>
                          <button onClick={() => togglePasswordVisibility(admin.id)} className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200">
                            Hide
                          </button>
                        </div>
                      )}

                      {/* Admin Activity Details */}
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        {/* Creation Info */}
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <IoCreateOutline className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Created by:</span>
                            <span className="text-blue-600">{admin.created_by?.name || "System"}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <IoTimeOutline className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Created at:</span>
                            <span>
                              {new Date(admin.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Last Edit Info */}
                        {admin.updated_by && (
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <IoRefreshOutline className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium">Last edited by:</span>
                              <span className="text-blue-600">{admin.updated_by?.name}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <IoTimeOutline className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">Last edited at:</span>
                              <span>
                                {new Date(admin.updated_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Login Statistics */}
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <IoEnterOutline className="w-4 h-4 text-green-500" />
                            <span className="font-medium">Last login:</span>
                            <span>
                              {admin.last_login_at
                                ? new Date(admin.last_login_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Never"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <IoStatsChartOutline className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">Login count:</span>
                            <span>{admin.login_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {user && user.is_super_admin && !admin.is_super_admin && admin.id !== user.id && (
                    <div className="flex flex-col space-y-2 mt-4 sm:mt-0 min-w-[120px]">
                      {!visiblePasswords[admin.id] && (
                        <button
                          onClick={() => togglePasswordVisibility(admin.id)}
                          className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          <IoEyeOutline className="mr-2 h-4 w-4" />
                          Password
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(admin)}
                        className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
                      >
                        <AiFillEdit className="mr-2 h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(admin)}
                        className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
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

      <PasswordConfirmationModal isOpen={passwordModal.isOpen} onClose={() => setPasswordModal({ isOpen: false, adminId: null })} onConfirm={handlePasswordConfirm} />
    </div>
  );
};

export default AdminCreateAdmin;
