import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  auth,
  signInWithEmailAndPassword,
  provider,
  signInWithPopup,
} from "../firebase/config";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, pwd);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password ❌");
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err) {
      setError("Google sign-in failed 😢");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-200">
      <div className="w-96 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 text-white transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-300 via-blue-300 to-pink-300 bg-clip-text text-transparent">
          Welcome Back 👋
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-200 text-sm rounded p-2 mb-3 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
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
            Login
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-300">or</div>

        <button
          onClick={handleGoogle}
          className="mt-4 w-full bg-white text-black py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google icon"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        <p className="mt-5 text-center text-sm text-gray-300">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-pink-200 hover:underline hover:text-pink-100 transition-all"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
