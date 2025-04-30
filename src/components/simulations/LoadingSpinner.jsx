import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex justify-center items-center">
      <div className="relative">
        {/* Spinning circle behind the logo */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-opacity-30"></div>

        {/* Spinning border */}
        <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>

        {/* BLC Logo */}
        <img src="/blc_circle.png" alt="BLC Logo" className="w-24 h-24 relative z-10" />
      </div>
    </div>
  );
};

export default LoadingSpinner;
