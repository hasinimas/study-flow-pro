// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/Tasks";
import Profile from "./pages/Profile";
import ProtectedRoute from "./pages/ProtectedRoute";
import { auth, signOut } from "./firebase/config";

function TopNav() {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="card mx-4 my-4 flex justify-between items-center">
      <div className="text-xl font-bold">🎓 StudyFlow Pro</div>
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="hover:opacity-90">Dashboard</Link>
        <Link to="/tasks" className="hover:opacity-90">Tasks</Link>
        <Link to="/profile" className="hover:opacity-90">Profile</Link>
        <button onClick={handleSignOut} className="px-3 py-1 rounded bg-red-500 text-white">Logout</button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default -> login */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
