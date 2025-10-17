// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, signInWithEmailAndPassword, provider, signInWithPopup } from "../firebase/config";

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
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-96">
        <h2 className="text-2xl font-bold mb-4">Sign in</h2>
        {error && <div className="text-red-300 mb-2">{error}</div>}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
          <input className="p-2 rounded text-black" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <input className="p-2 rounded text-black" type="password" placeholder="Password" value={pwd} onChange={(e)=>setPwd(e.target.value)} required />
          <button className="btn-primary">Login</button>
        </form>

        <button onClick={handleGoogle} className="mt-3 w-full bg-white text-black py-2 rounded font-semibold">Sign in with Google</button>

        <p className="mt-4 text-sm">Don't have an account? <Link to="/register" className="text-yellow-300">Register</Link></p>
      </div>
    </div>
  );
}
