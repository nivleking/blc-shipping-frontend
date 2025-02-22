import { useState, useEffect } from "react";
import { api } from "../../axios/axios";
import { ToastContainer, toast } from "react-toastify";
import RenderShipBayLayout from "../../components/simulations/RenderShipBayLayout";
import ReactPaginate from "react-paginate";
import ConfirmationModal from "../../components/rooms/ConfirmationModal";
import { HiPencil, HiTrash } from "react-icons/hi2";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { IoCreateOutline, IoTimeOutline } from "react-icons/io5";
import { AiFillEye } from "react-icons/ai";
import { FiHelpCircle } from "react-icons/fi";
import { GiShipBow } from "react-icons/gi";
import { BiGrid, BiCube } from "react-icons/bi";
import { MdOutlineGridOn } from "react-icons/md";
import ShipLayout3D from "./ShipLayout3D";
import GuideModal from "./GuideModal";

const initialFormState = {
  name: "",
  description: "",
  bay_size: { rows: 1, columns: 1 },
  bay_count: 1,
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

    // Add validation
    if (!formData.name.trim()) {
      toast.error("Layout name is required");
      return;
    }

    if (formData.bay_count < 1 || formData.bay_count > 8) {
      toast.error("Bay count must be between 1 and 8");
      return;
    }

    if (formData.bay_size.rows < 1 || formData.bay_size.rows > 7) {
      toast.error("Bay rows must be between 1 and 7");
      return;
    }

    if (formData.bay_size.columns < 1 || formData.bay_size.columns > 8) {
      toast.error("Bay columns must be between 1 and 8");
      return;
    }

    try {
      await api.post("/ship-layouts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Layout saved successfully!");
      fetchLayouts();
      setShowCreateForm(false);
      setFormData(initialFormState);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to save layout");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!selectedLayout) {
      toast.error("No layout selected for editing");
      return;
    }

    // Add validation
    if (!formData.name.trim()) {
      toast.error("Layout name is required");
      return;
    }

    if (formData.bay_count < 1 || formData.bay_count > 8) {
      toast.error("Bay count must be between 1 and 8");
      return;
    }

    if (formData.bay_size.rows < 1 || formData.bay_size.rows > 7) {
      toast.error("Bay rows must be between 1 and 7");
      return;
    }

    if (formData.bay_size.columns < 1 || formData.bay_size.columns > 8) {
      toast.error("Bay columns must be between 1 and 8");
      return;
    }

    try {
      await api.put(`/ship-layouts/${selectedLayout.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Layout updated successfully!");
      fetchLayouts();
      setShowEditForm(false);
      setSelectedLayout(null);
      setFormData(initialFormState);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to update layout");
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

    try {
      await api.delete(`/ship-layouts/${layoutToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Layout deleted successfully!");
      fetchLayouts();
      setLayoutToDelete(null);
      setDeleteModalOpen(false);
      setSelectedLayout(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete layout");
    }
  };

  const renderLayoutList = () => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          {/* Left side - Title and Icon */}
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
            <h3 className="ml-3 text-md font-bold text-gray-900">Ship Bay Layouts</h3>
          </div>

          {/* Middle - Actions */}
          <div className="flex items-center gap-4">
            <button onClick={() => setShowGuideModal(true)} className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100">
              <FiHelpCircle className="mr-2" />
              Layout Guide
            </button>
            <button onClick={() => setShowCreateForm(true)} className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100">
              Create New Layout
            </button>
          </div>

          {/* Right side - Search Box */}
          <div className="w-72">
            <div className="relative">
              <input type="text" placeholder="Search layouts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:border-blue-500" />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {layouts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No layouts</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new layout.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentPageData.map((layout, index) => (
              <div key={layout.id} className="flex flex-col sm:flex-row items-start justify-between p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Left section with layout details */}
                <div className="flex items-start space-x-6 w-full">
                  {/* Layout Icon and Status */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1-1H5a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                  </div>

                  {/* Layout Details */}
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-gray-500">#{offset + index + 1}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{layout.name}</h3>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <p>{layout.description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {/* Bay Configuration */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium">Bay Count:</span>
                          <span className="ml-2">{layout.bay_count} bays</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium">Bay Size:</span>
                          <span className="ml-2">
                            {layout.bay_size.rows}×{layout.bay_size.columns}
                          </span>
                        </div>
                      </div>

                      {/* Creation Info */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center text-gray-600">
                          <IoCreateOutline className="w-4 h-4 text-blue-500 mr-2" />
                          <span className="font-medium">Created by:</span>
                          <span className="ml-2 text-blue-600">{layout.creator?.name || "System"}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <IoTimeOutline className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium">Created:</span>
                          <span className="ml-2">{new Date(layout.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Bay Types Summary */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium">Bay Types:</span>
                          <div className="ml-2 flex flex-wrap gap-1">
                            {Array.from(new Set(layout.bay_types)).map((type) => (
                              <span key={type} className={`px-2 py-1 text-xs font-medium rounded-full ${type === "reefer" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right section with action buttons */}
                <div className="flex flex-col space-y-2 mt-4 sm:mt-0 min-w-[120px]">
                  <button
                    onClick={() => {
                      setSelectedLayout(layout);
                      setShowPreviewModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <AiFillEye className="mr-2 h-4 w-4" /> Preview
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLayout(layout);
                      setFormData({
                        name: layout.name,
                        description: layout.description,
                        bay_size: {
                          rows: layout.bay_size.rows,
                          columns: layout.bay_size.columns,
                        },
                        bay_count: layout.bay_count,
                        bay_types: [...layout.bay_types], // Create a new array to avoid reference issues
                      });
                      setShowEditForm(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                  >
                    <HiPencil className="mr-2 h-4 w-4" /> Edit
                  </button>
                  <button onClick={() => confirmDelete(layout)} className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100">
                    <HiTrash className="mr-2 h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {layouts.length > itemsPerPage && (
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
  );

  const handleBayTypeChange = (index, type) => {
    setFormData((prev) => {
      const newBayTypes = [...prev.bay_types];
      newBayTypes[index] = type;
      return { ...prev, bay_types: newBayTypes };
    });
  };

  const renderModal = (isEdit = false) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Ship Layout" : "Create New Ship Layout"} {isEdit && ":" + selectedLayout.name}
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => {
                isEdit ? setShowEditForm(false) : setShowCreateForm(false);
                setFormData(initialFormState);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button onClick={isEdit ? handleEdit : handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {isEdit ? "Update Layout" : "Save Layout"}
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter layout name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter layout description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bay Size <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs text-gray-500">Rows (1-7)</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={formData.bay_size.rows}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bay_size: { ...formData.bay_size, rows: parseInt(e.target.value) || 1 },
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <span className="text-gray-500 text-xl">x</span>
                <div>
                  <label className="text-xs text-gray-500">Columns (1-8)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.bay_size.columns}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bay_size: { ...formData.bay_size, columns: parseInt(e.target.value) || 1 },
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Bays <span className="text-red-500">*</span>
              </label>
              <div>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={formData.bay_count}
                  onChange={(e) => {
                    const count = parseInt(e.target.value) || 1;
                    setFormData({
                      ...formData,
                      bay_count: count,
                      bay_types: Array(count).fill("dry"),
                    });
                  }}
                  className="w-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 8 bays allowed</p>
              </div>
            </div>
          </div>

          {/* Layout Preview */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Layout Preview
              <span className="text-xs text-gray-500 ml-2">(Click on bays to toggle between dry and reefer types)</span>
            </h3>
            <div className="border rounded-lg bg-gray-50 p-4">
              <RenderShipBayLayout
                bayCount={formData.bay_count}
                baySize={formData.bay_size}
                bayTypes={formData.bay_types}
                onBayTypeChange={handleBayTypeChange}
                readonly={false} // Allow editing
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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

  const renderPreviewModal = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Layout Preview: {selectedLayout.name}</h2>
          <button
            onClick={() => {
              setSelectedLayout(null);
              setShowPreviewModal(false);
            }}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <RenderShipBayLayout bayCount={selectedLayout.bay_count} baySize={selectedLayout.bay_size} bayTypes={selectedLayout.bay_types} readonly={true} />
        </div>
      </div>
    </div>
  );

  // Add new state
  const [showGuideModal, setShowGuideModal] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      {renderLayoutList()}
      {showCreateForm && renderModal(false)}
      {showEditForm && renderModal(true)}
      {showPreviewModal && selectedLayout && renderPreviewModal()}
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
