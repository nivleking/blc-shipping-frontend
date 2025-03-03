import React, { useState, useEffect, useContext } from "react";
import { api } from "../../axios/axios";
import { AppContext } from "../../context/AppContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "../../components/ConfirmationModal";
import PasswordConfirmationModal from "../../components/PasswordConfirmationModal";
import UserList from "../../components/admins/create_user/UserList";
import CreateUserForm from "../../components/admins/create_user/CreateUserForm";
import LoadingOverlay from "../../components/LoadingOverlay";

// Define loading messages for different operations
const loadingMessages = {
  create: ["Creating new user..."],
  update: ["Updating user information..."],
  delete: ["Deleting user..."],
  fetch: ["Fetching users..."],
  password: ["Retrieving password..."],
};

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
  const { user, token } = useContext(AppContext);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOperation, setLoadingOperation] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: null,
  });

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    userId: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const offset = currentPage * itemsPerPage;
  const currentPageData = filteredUsers.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);
  const [passwordVisibility, setPasswordVisibility] = useState({});

  // Effect for loading message rotation
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

  const togglePasswordVisibility = async (userId) => {
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

  const handlePasswordConfirm = async (superAdminPassword) => {
    setPasswordModal({ isOpen: false, userId: null });

    // Set loading state
    setIsLoading(true);
    setLoadingOperation("password");
    setLoadingMessageIndex(0);

    // Add delay for loading state visibility
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const response = await api.post(
        `/users/${passwordModal.userId}/password`,
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
          [passwordModal.userId]: response.data.password,
        }));
        setPasswordVisibility((prev) => ({
          ...prev,
          [passwordModal.userId]: false,
        }));
        toast.success("Password retrieved successfully");
      }
    } catch (error) {
      console.error("Error fetching password:", error);
      toast.error(error.response?.data?.message || "Failed to retrieve password");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  async function fetchUsers() {
    setIsLoading(true);
    setLoadingOperation("fetch");
    setLoadingMessageIndex(0);

    try {
      const response = await api.get("/all-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
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
    setConfirmModal({ isOpen: false, userId: null });

    // Set loading state
    setIsLoading(true);
    setLoadingOperation("delete");
    setLoadingMessageIndex(0);

    // Add delay for loading state visibility
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      await api.delete(`/users/${confirmModal.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(users.filter((user) => user.id !== confirmModal.userId));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Set loading state based on operation
    setIsLoading(true);
    setLoadingOperation(editingUser ? "update" : "create");
    setLoadingMessageIndex(0);

    // Add delay for loading state visibility
    await new Promise((resolve) => setTimeout(resolve, 1200));

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
    } finally {
      setIsLoading(false);
    }
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
        users={users}
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
