import React, { useState } from "react";
import RenderShipBayLayout from "../simulations/RenderShipBayLayout";
import useToast from "../../toast/useToast";

const LayoutFormModal = ({ isEdit, formData, setFormData, handleSubmit, handleEdit, setShowCreateForm, setShowEditForm, selectedLayout, initialFormState, handleBayTypeChange }) => {
  const { showError } = useToast();

  const [errors, setErrors] = useState({
    rows: false,
    columns: false,
    bayCount: false,
  });

  // Validation helper functions
  const validateRange = (value, min, max) => {
    const numValue = parseInt(value);
    return !isNaN(numValue) && numValue >= min && numValue <= max;
  };

  // Handle row input with validation
  const handleRowsChange = (e) => {
    const value = e.target.value;

    // Allow empty input temporarily for better UX during typing
    if (value === "") {
      setFormData({
        ...formData,
        bay_size: { ...formData.bay_size, rows: "" },
      });
      setErrors({ ...errors, rows: true });
      return;
    }

    // Validate and set errors
    const numValue = parseInt(value);
    const isValid = validateRange(numValue, 2, 10);
    setErrors({ ...errors, rows: !isValid });

    // Always set a valid value to state
    const validValue = isValid ? numValue : numValue < 2 ? 2 : 10;
    setFormData({
      ...formData,
      bay_size: { ...formData.bay_size, rows: validValue },
    });
  };

  // Handle column input with validation
  const handleColumnsChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setFormData({
        ...formData,
        bay_size: { ...formData.bay_size, columns: "" },
      });
      setErrors({ ...errors, columns: true });
      return;
    }

    const numValue = parseInt(value);
    const isValid = validateRange(numValue, 2, 10);
    setErrors({ ...errors, columns: !isValid });

    const validValue = isValid ? numValue : numValue < 2 ? 2 : 10;
    setFormData({
      ...formData,
      bay_size: { ...formData.bay_size, columns: validValue },
    });
  };

  // Handle bay count input with validation
  const handleBayCountChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setFormData({
        ...formData,
        bay_count: "",
        bay_types: formData.bay_types, // Keep existing bay types
      });
      setErrors({ ...errors, bayCount: true });
      return;
    }

    const numValue = parseInt(value);
    const isValid = validateRange(numValue, 1, 10);
    setErrors({ ...errors, bayCount: !isValid });

    const validValue = isValid ? numValue : numValue < 1 ? 1 : 10;
    setFormData({
      ...formData,
      bay_count: validValue,
      bay_types: Array(validValue).fill("dry"),
    });
  };

  // Form submission validation
  const validateForm = () => {
    return validateRange(formData.bay_size.rows, 2, 10) && validateRange(formData.bay_size.columns, 2, 10) && validateRange(formData.bay_count, 1, 10);
  };

  // Wrapper for submit handlers that validates first
  const submitWithValidation = (e, submitHandler) => {
    if (validateForm()) {
      submitHandler(e);
    } else {
      setErrors({
        rows: !validateRange(formData.bay_size.rows, 2, 10),
        columns: !validateRange(formData.bay_size.columns, 2, 10),
        bayCount: !validateRange(formData.bay_count, 1, 10),
      });

      if (e && e.preventDefault) {
        e.preventDefault();
      }

      showError("Please correct the form errors before submitting");
    }
  };

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
                setErrors({ rows: false, columns: false, bayCount: false });
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                submitWithValidation(e, isEdit ? handleEdit : handleSubmit);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEdit ? "Update Layout" : "Save Layout"}
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Layout Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter layout name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter layout description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bay Size</label>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs text-gray-500">Rows (2-10)</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={formData.bay_size.rows}
                    onChange={handleRowsChange}
                    onBlur={() => {
                      // Force a valid value on blur if currently empty
                      if (formData.bay_size.rows === "") {
                        setFormData({
                          ...formData,
                          bay_size: { ...formData.bay_size, rows: 2 },
                        });
                        setErrors({ ...errors, rows: false });
                      }
                    }}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500 
                              ${errors.rows ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                  />
                  {errors.rows && <p className="text-xs text-red-500 mt-1">Please enter a value between 2-10</p>}
                </div>
                <span className="text-gray-500 text-xl">x</span>
                <div>
                  <label className="text-xs text-gray-500">Columns (2-10)</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={formData.bay_size.columns}
                    onChange={handleColumnsChange}
                    onBlur={() => {
                      if (formData.bay_size.columns === "") {
                        setFormData({
                          ...formData,
                          bay_size: { ...formData.bay_size, columns: 2 },
                        });
                        setErrors({ ...errors, columns: false });
                      }
                    }}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:border-blue-500 
                              ${errors.columns ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                  />
                  {errors.columns && <p className="text-xs text-red-500 mt-1">Please enter a value between 2-10</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Bays</label>
              <div>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.bay_count}
                  onChange={handleBayCountChange}
                  onBlur={() => {
                    if (formData.bay_count === "") {
                      setFormData({
                        ...formData,
                        bay_count: 1,
                        bay_types: Array(1).fill("dry"),
                      });
                      setErrors({ ...errors, bayCount: false });
                    }
                  }}
                  className={`w-32 p-3 border rounded-lg focus:outline-none focus:border-blue-500 
                              ${errors.bayCount ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                />
                {errors.bayCount ? <p className="text-xs text-red-500 mt-1">Please enter a value between 1-10</p> : <p className="text-xs text-gray-500 mt-1">Maximum 10 bays allowed</p>}
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
                bayCount={formData.bay_count || 1}
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
