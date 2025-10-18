import React, { useState } from "react";
import { createUserWithEmailAndPassword, auth } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createUserWithEmailAndPassword(auth, email, pwd);
      setSuccess("Account created successfully! 🎉 Redirecting to login...");
      setTimeout(() => navigate("/"), 2000); // redirect to login after 2s
    } catch (err) {
      setError("Registration failed. Please try again ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-200">
      <div className="w-96 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 text-white transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-300 via-blue-300 to-pink-300 bg-clip-text text-transparent">
          Create Account ✨
        </h2>

        {/* Notification messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 text-sm rounded p-2 mb-3 text-center animate-fadeIn">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-400 text-green-200 text-sm rounded p-2 mb-3 text-center animate-fadeIn">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="p-3 rounded-lg bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
            required
          />
          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-300 py-2 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg"
          >
            Register
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-300">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-pink-200 hover:underline hover:text-pink-100 transition-all"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
