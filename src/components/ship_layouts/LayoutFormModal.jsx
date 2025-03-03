import React from "react";
import RenderShipBayLayout from "../simulations/RenderShipBayLayout";

const LayoutFormModal = ({ isEdit, formData, setFormData, handleSubmit, handleEdit, setShowCreateForm, setShowEditForm, selectedLayout, initialFormState, handleBayTypeChange }) => {
  return (
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
};

export default LayoutFormModal;
