import React, { useState } from "react";
import { createUserWithEmailAndPassword, auth } from "../firebase/config";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-violet-600 to-cyan-500">
      <div className="bg-white/10 p-8 rounded-2xl shadow-lg w-96 text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">📝 Register</h2>
        {error && <p className="text-red-300 mb-3 text-sm">{error}</p>}
        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded text-black"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
          <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-2 rounded font-semibold text-black">
            Register
          </button>
        </form>
        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <Link to="/" className="text-yellow-300 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
