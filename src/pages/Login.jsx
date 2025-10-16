import React, { useState } from "react";
import { auth, googleProvider, signInWithPopup, signOut } from "../firebase/config";

const Login = () => {
  const [user, setUser] = useState(auth.currentUser);

 const handleLogin = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  setUser(result.user);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold mb-4">🔐 Sign in with Google</h2>
      {user ? (
        <>
          <img src={user.photoURL} alt="user" className="w-20 h-20 rounded-full border-4 border-yellow-400" />
          <p>{user.displayName}</p>
          <button onClick={handleLogout} className="mt-4 px-4 py-2 rounded-md bg-red-400 hover:bg-red-500">
            Logout
          </button>
        </>
      ) : (
        <button onClick={handleLogin} className="px-6 py-3 bg-yellow-400 text-black rounded-md font-semibold hover:bg-yellow-500">
          Sign in with Google
        </button>
      )}
    </div>
  );
};

export default Login;
