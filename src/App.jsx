import React from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TaskList from "./components/TaskList";
import ProtectedRoute from "./pages/ProtectedRoute";
import { signOut, auth } from "./firebase/config";

function Navbar() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };
  return (
    <nav className="flex justify-between p-4 bg-white/10 text-white">
      <div className="font-bold text-lg">🎓 StudyFlow Pro</div>
      <div className="flex gap-4">
        <Link to="/dashboard" className="hover:text-yellow-300">Dashboard</Link>
        <Link to="/tasks" className="hover:text-yellow-300">Tasks</Link>
        <button onClick={handleLogout} className="hover:text-red-300">Logout</button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Navbar />
              <TaskList />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
