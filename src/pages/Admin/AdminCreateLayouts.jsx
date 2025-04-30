import React, { useState, useEffect, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../axios/axios";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AppContext } from "../../context/AppContext";
import GuideModal from "./GuideModal";
import LoadingOverlay from "../../components/LoadingOverlay";
import LayoutList from "../../components/ship_layouts/LayoutList";
import LayoutFormModal from "../../components/ship_layouts/LayoutFormModal";
import LayoutPreviewModal from "../../components/ship_layouts/LayoutPreviewModal";
import useToast from "../../toast/useToast";

const loadingMessages = {
  create: ["Creating new ship layout..."],
  update: ["Updating ship layout..."],
  delete: ["Deleting ship layout..."],
  fetch: ["Loading ship layouts..."],
};

const initialFormState = {
  name: "",
  description: "",
  bay_size: { rows: 2, columns: 2 },
  bay_count: 1,
  bay_types: ["dry"],
};

const AdminCreateLayouts = () => {
  const { showSuccess, showError } = useToast();
  const { token } = useContext(AppContext);
  const queryClient = useQueryClient();

  // UI States
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [layoutToDelete, setLayoutToDelete] = useState(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [loadingOperation, setLoadingOperation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const itemsPerPage = 5;

  // Fetch layouts query
  const { data: layouts = [], isLoading: isLoadingLayouts } = useQuery({
    queryKey: ["layouts"],
    queryFn: async () => {
      setLoadingOperation("fetch");
      setLoadingMessageIndex(0);

      const response = await api.get("/ship-layouts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!token,
    onError: (error) => {
      console.error("Error fetching layouts:", error);
      showError("Failed to fetch layouts");
    },
  });

  // Create layout mutation
  const createLayoutMutation = useMutation({
    mutationFn: async (layoutData) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return api.post("/ship-layouts", layoutData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onMutate: () => {
      setLoadingOperation("create");
      setLoadingMessageIndex(0);
      setShowCreateForm(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["layouts"]);
      showSuccess("Layout saved successfully!");
      setFormData(initialFormState);
    },
    onError: (error) => {
      console.error("Error creating layout:", error);
      showError(error.response?.data?.message || "Failed to save layout");
    },
  });

  // Update layout mutation
  const updateLayoutMutation = useMutation({
    mutationFn: async (layoutData) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return api.put(`/ship-layouts/${selectedLayout.id}`, layoutData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onMutate: () => {
      setLoadingOperation("update");
      setLoadingMessageIndex(0);
      setShowEditForm(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["layouts"]);
      showSuccess("Layout updated successfully!");
      setSelectedLayout(null);
      setFormData(initialFormState);
    },
    onError: (error) => {
      console.error("Error updating layout:", error);
      showError(error.response?.data?.message || "Failed to update layout");
    },
  });

  // Delete layout mutation
  const deleteLayoutMutation = useMutation({
    mutationFn: async (layoutId) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return api.delete(`/ship-layouts/${layoutId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onMutate: () => {
      setLoadingOperation("delete");
      setLoadingMessageIndex(0);
      setDeleteModalOpen(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["layouts"]);
      showSuccess("Layout deleted successfully!");
      setLayoutToDelete(null);
      setSelectedLayout(null);
    },
    onError: (error) => {
      console.error("Error deleting layout:", error);
      showError("Failed to delete layout");
    },
  });

  // Loading message rotation effect
  useEffect(() => {
    let interval;
    const isLoading = createLayoutMutation.isPending || updateLayoutMutation.isPending || deleteLayoutMutation.isPending || isLoadingLayouts;

    if (isLoading && loadingOperation) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => {
          const maxIndex = loadingMessages[loadingOperation].length - 1;
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [createLayoutMutation.isPending, updateLayoutMutation.isPending, deleteLayoutMutation.isPending, isLoadingLayouts, loadingOperation]);

  // Update form data when selected layout changes
  useEffect(() => {
    if (selectedLayout) {
      setFormData({
        name: selectedLayout.name,
        description: selectedLayout.description,
        bay_size: {
          rows: selectedLayout.bay_size.rows,
          columns: selectedLayout.bay_size.columns,
        },
        bay_count: selectedLayout.bay_count,
        bay_types: [...selectedLayout.bay_types],
      });
    }
  }, [selectedLayout]);

  // Handler functions
  const confirmDelete = (layout) => {
    setLayoutToDelete(layout);
    setDeleteModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.name.trim()) {
      showError("Layout name is required");
      return;
    }

    if (formData.bay_count < 1 || formData.bay_count > 10) {
      showError("Bay count must be between 1 and 10");
      return;
    }

    if (formData.bay_size.rows < 2 || formData.bay_size.rows > 10) {
      showError("Bay rows must be between 2 and 10");
      return;
    }

    if (formData.bay_size.columns < 2 || formData.bay_size.columns > 10) {
      showError("Bay columns must be between 1 and 8");
      return;
    }

    createLayoutMutation.mutate(formData);
  };

  const handleEdit = (e) => {
    e.preventDefault();

    if (!selectedLayout) {
      showError("No layout selected for editing");
      return;
    }

    // Form validation
    if (!formData.name.trim()) {
      showError("Layout name is required");
      return;
    }

    if (formData.bay_count < 1 || formData.bay_count > 10) {
      showError("Bay count must be between 1 and 10");
      return;
    }

    if (formData.bay_size.rows < 2 || formData.bay_size.rows > 10) {
      showError("Bay rows must be between 2 and 10");
      return;
    }

    if (formData.bay_size.columns < 2 || formData.bay_size.columns > 10) {
      showError("Bay columns must be between 1 and 8");
      return;
    }

    updateLayoutMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (!layoutToDelete) return;
    deleteLayoutMutation.mutate(layoutToDelete.id);
  };

  const handleBayTypeChange = (index, type) => {
    setFormData((prev) => {
      const newBayTypes = [...prev.bay_types];
      newBayTypes[index] = type;
      return { ...prev, bay_types: newBayTypes };
    });
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  // Pagination and filtering logic
  const filteredLayouts = searchTerm === "" ? layouts : layouts.filter((layout) => layout.name.toLowerCase().includes(searchTerm.toLowerCase()) || layout.description?.toLowerCase().includes(searchTerm.toLowerCase()));

  const offset = currentPage * itemsPerPage;
  const currentPageData = filteredLayouts.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredLayouts.length / itemsPerPage);

  // Determine if any loading state is active
  const isLoading = createLayoutMutation.isPending || updateLayoutMutation.isPending || deleteLayoutMutation.isPending || isLoadingLayouts;

  return (
    <div className="container mx-auto p-4">
      {isLoading && loadingOperation && (
        <LoadingOverlay
          messages={loadingMessages[loadingOperation]}
          currentMessageIndex={loadingMessageIndex}
          title={loadingOperation === "create" ? "Creating Ship Layout" : loadingOperation === "update" ? "Updating Ship Layout" : loadingOperation === "delete" ? "Deleting Ship Layout" : "Loading Layouts"}
        />
      )}

      <LayoutList
        layouts={layouts}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setShowGuideModal={setShowGuideModal}
        setShowCreateForm={setShowCreateForm}
        setSelectedLayout={setSelectedLayout}
        setShowPreviewModal={setShowPreviewModal}
        setFormData={setFormData}
        setShowEditForm={setShowEditForm}
        confirmDelete={confirmDelete}
        currentPageData={currentPageData}
        offset={offset}
        pageCount={pageCount}
        handlePageClick={handlePageClick}
        itemsPerPage={itemsPerPage}
      />

      {showCreateForm && (
        <LayoutFormModal
          isEdit={false}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          handleEdit={handleEdit}
          setShowCreateForm={setShowCreateForm}
          setShowEditForm={setShowEditForm}
          selectedLayout={selectedLayout}
          initialFormState={initialFormState}
          handleBayTypeChange={handleBayTypeChange}
        />
      )}

      {showEditForm && (
        <LayoutFormModal
          isEdit={true}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          handleEdit={handleEdit}
          setShowCreateForm={setShowCreateForm}
          setShowEditForm={setShowEditForm}
          selectedLayout={selectedLayout}
          initialFormState={initialFormState}
          handleBayTypeChange={handleBayTypeChange}
        />
      )}

      {showPreviewModal && selectedLayout && <LayoutPreviewModal selectedLayout={selectedLayout} setSelectedLayout={setSelectedLayout} setShowPreviewModal={setShowPreviewModal} />}

      {showGuideModal && <GuideModal onClose={() => setShowGuideModal(false)} />}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setLayoutToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Layout"
        message={`Are you sure you want to delete "${layoutToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default AdminCreateLayouts;
