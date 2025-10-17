// src/pages/ProtectedRoute.jsx
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  if (loading) return <div className="text-center mt-10">Loading...</div>;
  return user ? children : <Navigate to="/" replace />;
}
