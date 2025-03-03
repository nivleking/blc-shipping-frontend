import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineLock } from "react-icons/ai";

const PasswordConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState("");

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose}>
          <div className="flex min-h-screen items-center justify-center p-6 sm:p-8">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative transform overflow-hidden w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-2xl w-full p-8 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-r from-gray-200 to-gray-600 opacity-20"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-r from-gray-300 to-gray-700 opacity-20"></div>

                <div className="relative z-10">
                  {/* Icon and Title */}
                  <div className="flex items-center justify-center mb-8">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="bg-blue-100 rounded-full p-4">
                      <AiOutlineLock className="text-blue-500 text-3xl animate-pulse" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-center text-blue-800 mb-6">Super Admin Verification</h3>

                  <form onSubmit={handleSubmit}>
                    <div className="mt-6">
                      <label className="block text-base font-medium text-blue-700 mb-3">Enter Super Admin Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 
                                 rounded-md shadow-sm text-gray-700 
                                 bg-white focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:border-blue-500 text-base"
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex justify-center items-center px-6 py-3 border 
                                 border-gray-300 rounded-md shadow-sm 
                                 text-base font-medium text-gray-700 
                                 bg-white hover:bg-gray-50 
                                 focus:outline-none focus:ring-2 
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
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordConfirmationModal;
