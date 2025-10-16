import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white/10 backdrop-blur-lg shadow-md rounded-2xl m-4">
      <h1 className="text-2xl font-bold tracking-wide">📘 StudyFlowPro</h1>
      <div className="space-x-6">
        <Link to="/" className="hover:text-yellow-300">Dashboard</Link>
        <Link to="/profile" className="hover:text-yellow-300">Profile</Link>
        <Link to="/login" className="hover:text-yellow-300">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;
