import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineLock } from "react-icons/ai";

const PasswordConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState("");

  // Tambahkan escape key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(password);
    setPassword("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
          {/* Ubah padding dan width container */}
          <div className="flex min-h-screen items-center justify-center p-6 sm:p-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative transform overflow-hidden w-full max-w-lg" // Tambahkan max-w-lg
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sesuaikan padding dan spacing internal */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-2xl w-full p-8 border border-gray-200 dark:border-gray-700">
                {/* Icon dan Title dengan spacing yang lebih besar */}
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4">
                    <AiOutlineLock className="text-blue-500 dark:text-blue-400 text-3xl animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Super Admin Verification</h3>

                <form onSubmit={handleSubmit}>
                  <div className="mt-6">
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">Enter Super Admin Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                               rounded-md shadow-sm text-gray-700 dark:text-gray-200 
                               bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 
                               focus:ring-blue-500 focus:border-blue-500 text-base"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  {/* Sesuaikan spacing buttons */}
                  <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center items-center px-6 py-3 border 
                               border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                               text-base font-medium text-gray-700 dark:text-gray-200 
                               bg-white dark:bg-gray-800 hover:bg-gray-50 
                               dark:hover:bg-gray-700 focus:outline-none focus:ring-2 
                               focus:ring-offset-2 focus:ring-blue-500 
                               transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center items-center px-6 py-3 
                               rounded-md shadow-sm text-base font-medium text-white 
                               bg-blue-600 hover:bg-blue-700 focus:outline-none 
                               focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                               transition-all duration-200 transform hover:scale-105"
                    >
                      Verify
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordConfirmationModal;
