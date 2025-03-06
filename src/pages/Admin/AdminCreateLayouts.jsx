import { useState, useEffect } from "react";
import { api } from "../../axios/axios";
import { ToastContainer, toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import GuideModal from "./GuideModal";
import LoadingOverlay from "../../components/LoadingOverlay";
import LayoutList from "../../components/ship_layouts/LayoutList";
import LayoutFormModal from "../../components/ship_layouts/LayoutFormModal";
import LayoutPreviewModal from "../../components/ship_layouts/LayoutPreviewModal";

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
  bay_count: 1  ,
  bay_types: ["dry"],
};

const AdminCreateLayouts = () => {
  const { token } = useContext(AppContext);
  const [layouts, setLayouts] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [layoutToDelete, setLayoutToDelete] = useState(null);
  const [loadingOperation, setLoadingOperation] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

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

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/ship-layouts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLayouts(response.data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch layouts");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (layout) => {
    setLayoutToDelete(layout);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Layout name is required");
      return;
    }

    if (formData.bay_count < 2 || formData.bay_count > 10) {
      toast.error("Bay count must be between 2 and 10");
      return;
    }

    if (formData.bay_size.rows < 2 || formData.bay_size.rows > 10) {
      toast.error("Bay rows must be between 2 and 10");
      return;
    }

    if (formData.bay_size.columns < 2 || formData.bay_size.columns > 10) {
      toast.error("Bay columns must be between 1 and 8");
      return;
    }

    setIsLoading(true);
    setLoadingOperation("create");
    setLoadingMessageIndex(0);

    setShowCreateForm(false);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      await api.post("/ship-layouts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Layout saved successfully!");
      fetchLayouts();
      setFormData(initialFormState);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to save layout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedLayout) {
      toast.error("No layout selected for editing");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Layout name is required");
      return;
    }

    if (formData.bay_count < 2 || formData.bay_count > 10) {
      toast.error("Bay count must be between 2 and 10");
      return;
    }

    if (formData.bay_size.rows < 2 || formData.bay_size.rows > 10) {
      toast.error("Bay rows must be between 2 and 10");
      return;
    }

    if (formData.bay_size.columns < 2 || formData.bay_size.columns > 10) {
      toast.error("Bay columns must be between 1 and 8");
      return;
    }

    setIsLoading(true);
    setLoadingOperation("update");
    setLoadingMessageIndex(0);

    setShowEditForm(false);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      await api.put(`/ship-layouts/${selectedLayout.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Layout updated successfully!");
      fetchLayouts();
      setSelectedLayout(null);
      setFormData(initialFormState);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to update layout");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDelete = async () => {
    if (!layoutToDelete) return;

    setIsLoading(true);
    setLoadingOperation("delete");
    setLoadingMessageIndex(0);

    setDeleteModalOpen(false);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      await api.delete(`/ship-layouts/${layoutToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Layout deleted successfully!");
      fetchLayouts();
      setLayoutToDelete(null);
      setSelectedLayout(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete layout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBayTypeChange = (index, type) => {
    setFormData((prev) => {
      const newBayTypes = [...prev.bay_types];
      newBayTypes[index] = type;
      return { ...prev, bay_types: newBayTypes };
    });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const filteredLayouts = searchTerm === "" ? layouts : layouts.filter((layout) => layout.name.toLowerCase().includes(searchTerm.toLowerCase()) || layout.description.toLowerCase().includes(searchTerm.toLowerCase()));

  const offset = currentPage * itemsPerPage;
  const currentPageData = filteredLayouts.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredLayouts.length / itemsPerPage);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const [showGuideModal, setShowGuideModal] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
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
