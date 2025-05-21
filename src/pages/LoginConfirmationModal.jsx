import React from "react";

const LoginConfirmationModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Active Session Detected</h2>
          <p className="text-gray-600 mb-6">It seems your account is already logged in in another tab or browser. Continuing with this login will invalidate your previous sessions.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onCancel} className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              Continue Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginConfirmationModal;
