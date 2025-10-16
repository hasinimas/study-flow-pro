import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import "./index.css";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-sky-700 text-white">
        <nav className="flex justify-between items-center px-6 py-4 bg-white/10 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-yellow-300">StudyFlowPro</h1>
          <div className="flex gap-4">
            <Link to="/">Dashboard</Link>
            <Link to="/tasks">Tasks</Link>
            <Link to="/login">Login</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </nav>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
