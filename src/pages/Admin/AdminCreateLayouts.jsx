import { useState, useEffect } from "react";
import { api } from "../../axios/axios";
import { ToastContainer, toast } from "react-toastify";
import RenderShipBayLayout from "../../components/simulations/RenderShipBayLayout";

const AdminCreateLayouts = () => {
  const [layouts, setLayouts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bay_size: { rows: 1, columns: 1 },
    bay_count: 1,
  });

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      const response = await api.get("/layouts");
      setLayouts(response.data);
    } catch (error) {
      toast.error("Failed to fetch layouts");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/layouts", formData);
      toast.success("Layout saved successfully!");
      fetchLayouts();
      setShowCreateForm(false);
    } catch (error) {
      toast.error("Failed to save layout");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ship Bay Layouts</h1>
        <button onClick={() => setShowCreateForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Layout
        </button>
      </div>

      {/* Layouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {layouts.map((layout) => (
          <div key={layout.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{layout.name}</h3>
                <p className="text-sm text-gray-500">{layout.description}</p>
              </div>
              <button onClick={() => setSelectedLayout(layout)} className="text-blue-600 hover:text-blue-800">
                Preview
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <p>
                Bay Size: {layout.bay_size.rows} x {layout.bay_size.columns}
              </p>
              <p>Bay Count: {layout.bay_count}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200">Edit</button>
              <button className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Create New Layout</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Layout Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bay Size</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      max="7"
                      value={formData.bay_size.rows}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bay_size: { ...formData.bay_size, rows: parseInt(e.target.value) },
                        })
                      }
                      className="w-20 p-2 border rounded-lg"
                    />
                    <span>×</span>
                    <input
                      type="number"
                      max="8"
                      value={formData.bay_size.columns}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bay_size: { ...formData.bay_size, columns: parseInt(e.target.value) },
                        })
                      }
                      className="w-20 p-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bay Count</label>
                  <input type="number" max="8" value={formData.bay_count} onChange={(e) => setFormData({ ...formData, bay_count: parseInt(e.target.value) })} className="w-20 p-2 border rounded-lg" />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <RenderShipBayLayout bayCount={formData.bay_count} baySize={formData.bay_size} />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Layout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedLayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{selectedLayout.name}</h2>
              <button onClick={() => setSelectedLayout(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">{selectedLayout.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Bay Size: {selectedLayout.bay_size.rows} x {selectedLayout.bay_size.columns} | Bay Count: {selectedLayout.bay_count}
              </p>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <RenderShipBayLayout bayCount={selectedLayout.bay_count} baySize={selectedLayout.bay_size} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCreateLayouts;
