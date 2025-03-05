import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";

const NotFound = () => {
  const { user } = useContext(AppContext);

  const getHomePage = () => {
    if (!user) return "/";
    return user.is_admin === true ? "/admin-home" : "/user-home";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-10 -top-20 w-72 h-72 bg-blue-500 rounded-full"></div>
          <div className="absolute -left-10 -bottom-20 w-72 h-72 bg-blue-500 rounded-full"></div>
        </div>

        <div className="relative z-10">
          {/* Icon and 404 text */}
          <div className="mb-8 relative">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="text-red-500 text-2xl" />
            </div>
            <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800">404</h1>
            <div className="h-1.5 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto my-6 rounded-full"></div>
            <h2 className="text-3xl font-bold mb-3 text-gray-800">Page Not Found</h2>
            <p className="text-gray-600 max-w-md mx-auto">The page you are looking for doesn't exist or has been moved. Please check the URL or navigate to a valid page.</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to={getHomePage()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <FaHome className="text-lg" /> Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-sm hover:shadow transform hover:-translate-y-0.5"
            >
              <FaArrowLeft /> Go Back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
