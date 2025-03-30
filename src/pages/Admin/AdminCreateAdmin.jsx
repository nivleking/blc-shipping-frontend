import React, { useState, useEffect, useContext } from "react";
import { api } from "../../axios/axios";
import { AppContext } from "../../context/AppContext";
import ConfirmationModal from "../../components/ConfirmationModal";
import PasswordConfirmationModal from "../../components/PasswordConfirmationModal";
import AdminList from "../../components/admins/create_admin/AdminList";
import CreateAdminForm from "../../components/admins/create_admin/CreateAdminForm";
import LoadingOverlay from "../../components/LoadingOverlay";
import "./AdminHome.css";
import useToast from "../../toast/useToast";

const loadingMessages = {
  create: ["Creating new admin..."],
  update: ["Updating admin information..."],
  delete: ["Deleting admin..."],
  fetch: ["Fetching admins..."],
  password: ["Retrieving password..."],
};

const AdminCreateAdmin = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
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

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOperation, setLoadingOperation] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    adminId: null,
  });
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    adminId: null,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let interval;
    if (isLoading && loadingOperation) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => {
          const maxIndex = loadingMessages[loadingOperation].length - 1;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading, loadingOperation]);

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

  const handlePasswordConfirm = async (superAdminPassword) => {
    setPasswordModal({ isOpen: false, adminId: null });

    // Set loading state
    setIsLoading(true);
    setLoadingOperation("password");
    setLoadingMessageIndex(0);

    // Add delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const response = await api.post(
        `/users/${passwordModal.adminId}/password`,
        { super_admin_password: superAdminPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
        showSuccess("Password retrieved successfully");
      }
    } catch (error) {
      console.error("Error fetching password:", error);
      showError(error.response?.data?.message || "Failed to retrieve password");
    } finally {
      setIsLoading(false);
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
    setConfirmModal({ isOpen: false, adminId: null });

    // Set loading state
    setIsLoading(true);
    setLoadingOperation("delete");
    setLoadingMessageIndex(0);

    // Add delay for loading state visibility
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await api.delete(`/users/${confirmModal.adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAdmins(admins.filter((admin) => admin.id !== confirmModal.adminId));
      showSuccess("Admin deleted successfully");
    } catch (error) {
      console.error("Error deleting admin:", error);
      showError("Failed to delete admin");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdmins();
    }
  }, [token]);

  async function fetchAdmins() {
    setIsLoading(true);
    setLoadingOperation("fetch");
    setLoadingMessageIndex(0);

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
      showError("Failed to fetch admins");
    } finally {
      setIsLoading(false);
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

    // Set loading state
    setIsLoading(true);
    setLoadingOperation(editingAdmin ? "update" : "create");
    setLoadingMessageIndex(0);

    // Add delay for loading state visibility
    await new Promise((resolve) => setTimeout(resolve, 1200));

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
        showSuccess("Admin updated successfully");
      } else {
        await api.post("/users/register", dataToSubmit, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        showSuccess("New admin created successfully");
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
      showError(error.response.data.message || "Something went wrong");
    } finally {
      setIsLoading(false);
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
  const filteredAdmins = admins.filter((admin) => admin.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentPageData = filteredAdmins.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredAdmins.length / itemsPerPage);

  return (
    <div className="container mx-auto p-4">
      {/* Loading Overlay */}
      {isLoading && loadingOperation && (
        <LoadingOverlay
          messages={loadingMessages[loadingOperation]}
          currentMessageIndex={loadingMessageIndex}
          title={
            loadingOperation === "create"
              ? "Creating New Admin"
              : loadingOperation === "update"
              ? "Updating Admin"
              : loadingOperation === "delete"
              ? "Deleting Admin"
              : loadingOperation === "password"
              ? "Retrieving Password"
              : "Loading Admins"
          }
        />
      )}

      {/* Only render the form if the user is a super admin */}
      {user?.is_super_admin && <CreateAdminForm formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} formErrors={formErrors} editingAdmin={editingAdmin} />}

      <AdminList
        admins={admins}
        currentPageData={currentPageData}
        offset={offset}
        pageCount={pageCount}
        itemsPerPage={itemsPerPage}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handlePageClick={handlePageClick}
        handleEdit={handleEdit}
        handleDeleteClick={handleDeleteClick}
        togglePasswordVisibility={togglePasswordVisibility}
        visiblePasswords={visiblePasswords}
        passwordVisibility={passwordVisibility}
        setPasswordVisibility={setPasswordVisibility}
        formErrors={formErrors}
        currentUser={user}
      />

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
