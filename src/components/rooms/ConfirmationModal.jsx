import React, { useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative transform overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
                {/* Icon and Title */}
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
                    <FiAlertTriangle className="text-red-500 dark:text-red-400 text-2xl animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-4">{title}</h3>

                {/* Message */}
                <div className="mt-2">
                  <p className="text-center text-gray-600 dark:text-gray-300">{message}</p>
                </div>

                {/* Buttons */}
                <div className="mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 
                             dark:border-gray-600 rounded-md shadow-sm text-sm font-medium 
                             text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800
                             hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none 
                             focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                             transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="inline-flex justify-center items-center px-4 py-2 rounded-md 
                             shadow-sm text-sm font-medium text-white bg-red-600 
                             hover:bg-red-700 focus:outline-none focus:ring-2 
                             focus:ring-offset-2 focus:ring-red-500 
                             transition-all duration-200 transform hover:scale-105"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
