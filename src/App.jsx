// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/Tasks";
import Profile from "./pages/Profile";
import Analysis from "./pages/Analysis";
import ProtectedRoute from "./pages/ProtectedRoute";
import { auth, signOut } from "./firebase/config";

function TopNav() {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl m-4 transition-all duration-500 hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]">
      <div className="text-xl font-bold">🎓 StudyFlow Pro</div>
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="hover:text-yellow-300">Dashboard</Link>
        <Link to="/tasks" className="hover:text-yellow-300">Tasks</Link>
        <Link to="/analysis" className="hover:text-yellow-300">Analysis</Link>
        <Link to="/profile" className="hover:text-yellow-300">Profile</Link>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 rounded bg-red-500 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,0,0.6)] hover:bg-red-600">
              Logout
        </button>

      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default -> Login */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <TopNav />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TopNav />
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <TopNav />
              <Analysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <TopNav />
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
