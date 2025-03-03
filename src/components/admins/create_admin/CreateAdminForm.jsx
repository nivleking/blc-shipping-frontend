import React from "react";
import Tooltip from "../../../components/Tooltip";

const CreateAdminForm = ({ formData, handleChange, handleSubmit, formErrors, editingAdmin }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg mb-4">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h3 className="ml-3 text-1xl font-bold text-gray-800">{editingAdmin ? "Edit Admin" : "Create New Admin"}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin Name Field */}
          <div className="flex flex-col">
            <div className="flex items-center">
              <label htmlFor="name" className="block text-gray-700 font-semibold">
                Admin Name
              </label>
              <Tooltip>Enter a unique name for the admin. This name will be used for identification purposes.</Tooltip>
            </div>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter admin name" />
            {formErrors.name && <p className="text-red-500 mt-1 text-sm">{formErrors.name[0]}</p>}
          </div>

          {/* Password Field */}
          <div className="flex flex-col">
            <div className="flex items-center">
              <label htmlFor="password" className="block text-gray-700 font-semibold">
                Password
              </label>
              <Tooltip>Password must be at least 8 characters long, include at least one number, include at least one special character (@$!%*#?&)</Tooltip>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder={editingAdmin ? "Leave blank to keep current password" : "Enter password"}
            />
            {formErrors.password && <p className="text-red-500 mt-1 text-sm">{formErrors.password[0]}</p>}
          </div>

          {/* Password Confirmation Field */}
          <div className="flex flex-col">
            <div className="flex items-center">
              <label htmlFor="password_confirmation" className="block text-gray-700 font-semibold">
                Confirm Password
              </label>
              <Tooltip>Re-enter the password to confirm. Both passwords must match.</Tooltip>
            </div>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Confirm password"
            />
          </div>
        </div>

        <div className="flex justify-start">
          <button type="submit" className="p-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300">
            {editingAdmin ? "Update Admin" : "Create Admin"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAdminForm;
