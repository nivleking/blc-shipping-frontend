import React, { useState, useContext, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const { showSuccess, showError } = useToast();
  const { user, token } = useContext(AppContext);
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    is_admin: true,
    password: "",
    password_confirmation: "",
  });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    adminId: null,
  });
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    adminId: null,
  });

  // UI states
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingOperation, setLoadingOperation] = useState("");

  // Fetch admins query
  const { data: adminsData, isLoading: isLoadingAdmins } = useQuery({
    queryKey: ["users", { isAdmin: true }],
    queryFn: async () => {
      setLoadingOperation("fetch");
      setLoadingMessageIndex(0);

      const response = await api.get("/users", {
        params: { is_admin: true },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.map((admin) => ({
        ...admin,
        status: admin.status || "active",
        login_count: admin.login_count || 0,
        last_login_at: admin.last_login_at || null,
        created_by: admin.created_by || { name: "System" },
        updated_by: admin.updated_by || null,
      }));
    },
    enabled: !!token,
    onError: (error) => {
      console.error("Error fetching admins:", error);
      showError("Failed to fetch admins");
    },
  });

  const admins = adminsData || [];

  // Create/update admin mutation
  const adminMutation = useMutation({
    mutationFn: async (data) => {
      const isUpdate = !!editingAdmin;

      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (isUpdate) {
        const changedFields = {};
        if (data.name !== editingAdmin.name) {
          changedFields.name = data.name;
        }
        if (data.password) {
          changedFields.password = data.password;
          changedFields.password_confirmation = data.password_confirmation;
        }

        return api.put(`/users/${editingAdmin.id}`, changedFields, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        return api.post("/users/register", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    },
    onMutate: () => {
      setLoadingOperation(editingAdmin ? "update" : "create");
      setLoadingMessageIndex(0);
      return { operation: editingAdmin ? "update" : "create" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admins"]);
      setFormData({
        name: "",
        is_admin: true,
        password: "",
        password_confirmation: "",
      });
      setEditingAdmin(null);
      setFormErrors({});
      showSuccess(editingAdmin ? "Admin updated successfully" : "New admin created successfully");
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
      showError(error.response?.data?.message || "Failed to save admin");
    },
  });

  // Delete admin mutation
  const deleteMutation = useMutation({
    mutationFn: async (adminId) => {
      setConfirmModal({ isOpen: false, adminId: null });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return api.delete(`/users/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onMutate: () => {
      setLoadingOperation("delete");
      setLoadingMessageIndex(0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admins"]);
      showSuccess("Admin deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting admin:", error);
      showError("Failed to delete admin");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async ({ adminId, superAdminPassword }) => {
      return api.post(
        `/users/${adminId}/password`,
        { super_admin_password: superAdminPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onMutate: () => {
      setLoadingOperation("password");
      setLoadingMessageIndex(0);
    },
    onSuccess: (response, variables) => {
      if (response.data?.password) {
        setVisiblePasswords((prev) => ({
          ...prev,
          [variables.adminId]: response.data.password,
        }));
        setPasswordVisibility((prev) => ({
          ...prev,
          [variables.adminId]: false,
        }));
        showSuccess("Password retrieved successfully");
      }
    },
    onError: (error) => {
      console.error("Error fetching password:", error);
      showError(error.response?.data?.message || "Failed to retrieve password");
    },
  });

  useEffect(() => {
    let interval;
    const isLoading = adminMutation.isPending || deleteMutation.isPending || passwordMutation.isPending || isLoadingAdmins;

    if (isLoading && loadingOperation) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => {
          const maxIndex = loadingMessages[loadingOperation].length - 1;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [adminMutation.isPending, deleteMutation.isPending, passwordMutation.isPending, isLoadingAdmins, loadingOperation]);

  const togglePasswordVisibility = (adminId) => {
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

  const handlePasswordConfirm = (superAdminPassword) => {
    passwordMutation.mutate({
      adminId: passwordModal.adminId,
      superAdminPassword,
    });
    setPasswordModal({ isOpen: false, adminId: null });
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

  const handleConfirmDelete = () => {
    deleteMutation.mutate(confirmModal.adminId);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    adminMutation.mutate(formData);
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

  // Pagination and filtering logic
  const filteredAdmins = admins.filter((admin) => admin.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const offset = currentPage * itemsPerPage;
  const currentPageData = filteredAdmins.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredAdmins.length / itemsPerPage);

  // Determine if any loading state is active
  const isLoading = adminMutation.isPending || deleteMutation.isPending || passwordMutation.isPending || isLoadingAdmins;

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
