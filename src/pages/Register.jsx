// src/pages/Register.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, auth } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, pwd);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-96">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {error && <div className="text-red-300 mb-2">{error}</div>}
        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <input className="p-2 rounded text-black" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <input className="p-2 rounded text-black" type="password" placeholder="Password" value={pwd} onChange={(e)=>setPwd(e.target.value)} required />
          <button className="btn-primary">Register</button>
        </form>
        <p className="mt-4 text-sm">Already have an account? <Link to="/" className="text-yellow-300">Login</Link></p>
      </div>
    </div>
  );
}
