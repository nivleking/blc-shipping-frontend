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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose}>
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative transform overflow-hidden w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-2xl w-full p-8 border border-gray-200 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-r from-gray-200 to-gray-600 opacity-20"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-r from-gray-300 to-gray-700 opacity-20"></div>

                <div className="relative z-10">
                  {/* Icon and Title */}
                  <div className="flex items-center justify-center mb-6">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="bg-blue-100 rounded-full p-4">
                      <FiAlertTriangle className="text-blue-500 text-2xl animate-pulse" />
                    </motion.div>
                  </div>
                  <h3 className="text-lg font-bold text-center text-blue-800 mb-4">{title}</h3>

                  {/* Message */}
                  <div className="mt-4">
                    <p className="text-center text-base text-gray-700">{message}</p>
                  </div>

                  {/* Buttons */}
                  <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 text-sm">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 
                                rounded-md shadow-sm font-medium text-gray-700 bg-white
                                hover:bg-gray-50 focus:outline-none focus:ring-2 
                                focus:ring-offset-2 focus:ring-blue-500 
                                transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={onConfirm}
                      className="inline-flex justify-center items-center px-4 py-2 rounded-md 
                                shadow-sm font-medium text-white bg-blue-600 
                                hover:bg-blue-700 focus:outline-none focus:ring-2 
                                focus:ring-offset-2 focus:ring-blue-500 
                                transition-all duration-200 transform hover:scale-105"
                    >
                      Confirm
                    </button>
                  </div>
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
