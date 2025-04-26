import React from "react";
import Tooltip from "../../../components/Tooltip";

const CreateUserForm = ({ formData, handleChange, handleSubmit, formErrors, editingUser }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg mb-4">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="ml-3 text-1xl font-bold text-gray-800">{editingUser ? "Edit User" : "Create New User"}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {/* Name Field */}
          <div className="flex flex-col">
            <div className="flex items-center">
              <label htmlFor="name" className="block text-gray-700 font-semibold">
                User Name
              </label>
              <Tooltip>Enter a unique name for the user. This name will be used for identification purposes.</Tooltip>
            </div>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Enter user name" />
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
              placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
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
            {editingUser ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;
