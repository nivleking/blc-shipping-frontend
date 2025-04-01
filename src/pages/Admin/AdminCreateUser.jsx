import React, { useState, useContext, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../axios/axios";
import { AppContext } from "../../context/AppContext";
import ConfirmationModal from "../../components/ConfirmationModal";
import PasswordConfirmationModal from "../../components/PasswordConfirmationModal";
import UserList from "../../components/admins/create_user/UserList";
import CreateUserForm from "../../components/admins/create_user/CreateUserForm";
import LoadingOverlay from "../../components/LoadingOverlay";
import useToast from "../../toast/useToast";

// Define loading messages for different operations
const loadingMessages = {
  create: ["Creating new user..."],
  update: ["Updating user information..."],
  delete: ["Deleting user..."],
  fetch: ["Fetching users..."],
  password: ["Retrieving password..."],
};

const AdminCreateUser = () => {
  const { showSuccess, showError } = useToast();
  const { user, token } = useContext(AppContext);
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    is_admin: false,
    password: "",
    password_confirmation: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: null,
  });
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    userId: null,
  });

  // UI states
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingOperation, setLoadingOperation] = useState("");

  // Fetch users query
  const { data: usersData = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", { isAdmin: false }],
    queryFn: async () => {
      setLoadingOperation("fetch");
      setLoadingMessageIndex(0);

      const response = await api.get("/users", {
        params: { is_admin: false },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.map((user) => ({
        ...user,
        status: user.status || "active",
        login_count: user.login_count || 0,
        last_login_at: user.last_login_at || null,
        created_by: user.created_by || { name: "System" },
        updated_by: user.updated_by || null,
      }));
    },
    enabled: !!token,
    onError: (error) => {
      console.error("Error fetching users:", error);
      showError("Failed to fetch users");
    },
  });

  // Create/update user mutation
  const userMutation = useMutation({
    mutationFn: async (data) => {
      const isUpdate = !!editingUser;

      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (isUpdate) {
        const changedFields = {};
        if (data.name !== editingUser.name) {
          changedFields.name = data.name;
        }
        if (data.password) {
          changedFields.password = data.password;
          changedFields.password_confirmation = data.password_confirmation;
        }

        return api.put(`/users/${editingUser.id}`, changedFields, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        return api.post("/users/register", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    },
    onMutate: () => {
      setLoadingOperation(editingUser ? "update" : "create");
      setLoadingMessageIndex(0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setFormData({
        name: "",
        is_admin: false,
        password: "",
        password_confirmation: "",
      });
      setEditingUser(null);
      setFormErrors({});
      showSuccess(editingUser ? "User updated successfully" : "New user created successfully");
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
      showError(error.response?.data?.message || "Failed to save user");
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      setConfirmModal({ isOpen: false, userId: null });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return api.delete(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onMutate: () => {
      setLoadingOperation("delete");
      setLoadingMessageIndex(0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      showSuccess("User deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      showError("Failed to delete user");
    },
  });

  // Password retrieval mutation
  const passwordMutation = useMutation({
    mutationFn: async ({ userId, superAdminPassword }) => {
      return api.post(
        `/users/${userId}/password`,
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
          [variables.userId]: response.data.password,
        }));
        setPasswordVisibility((prev) => ({
          ...prev,
          [variables.userId]: false,
        }));
        showSuccess("Password retrieved successfully");
      }
    },
    onError: (error) => {
      console.error("Error fetching password:", error);
      showError(error.response?.data?.message || "Failed to retrieve password");
    },
  });

  // Loading message rotation effect
  useEffect(() => {
    let interval;
    const isLoading = userMutation.isPending || deleteMutation.isPending || passwordMutation.isPending || isLoadingUsers;

    if (isLoading && loadingOperation) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => {
          const maxIndex = loadingMessages[loadingOperation].length - 1;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [userMutation.isPending, deleteMutation.isPending, passwordMutation.isPending, isLoadingUsers, loadingOperation]);

  // Handler functions
  const togglePasswordVisibility = (userId) => {
    if (visiblePasswords[userId]) {
      setVisiblePasswords((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    } else {
      setPasswordModal({
        isOpen: true,
        userId: userId,
      });
    }
  };

  const handlePasswordConfirm = (superAdminPassword) => {
    passwordMutation.mutate({
      userId: passwordModal.userId,
      superAdminPassword,
    });
    setPasswordModal({ isOpen: false, userId: null });
  };

  const handleDeleteClick = (user) => {
    setConfirmModal({
      isOpen: true,
      userId: user.id,
    });
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(confirmModal.userId);
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
    userMutation.mutate(formData);
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

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  // Pagination and filtering logic
  const filteredUsers = usersData.filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const offset = currentPage * itemsPerPage;
  const currentPageData = filteredUsers.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);

  // Determine if any loading state is active
  const isLoading = userMutation.isPending || deleteMutation.isPending || passwordMutation.isPending || isLoadingUsers;

  return (
    <div className="container mx-auto p-4">
      {/* Loading Overlay */}
      {isLoading && loadingOperation && (
        <LoadingOverlay
          messages={loadingMessages[loadingOperation]}
          currentMessageIndex={loadingMessageIndex}
          title={
            loadingOperation === "create" ? "Creating New User" : loadingOperation === "update" ? "Updating User" : loadingOperation === "delete" ? "Deleting User" : loadingOperation === "password" ? "Retrieving Password" : "Loading Users"
          }
        />
      )}

      <CreateUserForm formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} formErrors={formErrors} editingUser={editingUser} />

      <UserList
        users={usersData}
        currentPageData={currentPageData}
        pageCount={pageCount}
        handlePageClick={handlePageClick}
        handleEdit={handleEdit}
        handleDeleteClick={handleDeleteClick}
        togglePasswordVisibility={togglePasswordVisibility}
        visiblePasswords={visiblePasswords}
        passwordVisibility={passwordVisibility}
        setPasswordVisibility={setPasswordVisibility}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        offset={offset}
        currentUser={user}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, userId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />

      <PasswordConfirmationModal isOpen={passwordModal.isOpen} onClose={() => setPasswordModal({ isOpen: false, userId: null })} onConfirm={handlePasswordConfirm} />
    </div>
  );
};

export default AdminCreateUser;
