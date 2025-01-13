import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-500 to-blue-700 text-white">
      <Link
        to="/login"
        className="
        absolute top-4 right-4 px-4 py-2 bg-white text-blue-500 font-semibold rounded-lg shadow-md
        hover:bg-blue-500 hover:text-white transition-colors
      "
      >
        Login
      </Link>
      <h1 className="text-6xl font-bold text-center">BLC Shipping</h1>
    </div>
  );
};

export default LandingPage;
