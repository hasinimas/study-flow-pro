import React from "react";
import { auth } from "../firebase/config";

const Profile = () => {
  const user = auth.currentUser;

  if (!user)
    return (
      <div className="text-center text-xl font-semibold">
        Please login first from the <span className="text-yellow-300">Login</span> page.
      </div>
    );

  return (
    <div className="max-w-md mx-auto bg-white/10 p-6 rounded-2xl backdrop-blur-md shadow-lg text-center">
      <img src={user.photoURL} alt="profile" className="w-24 h-24 mx-auto rounded-full border-4 border-yellow-400 mb-4" />
      <h2 className="text-2xl font-bold mb-2">{user.displayName}</h2>
      <p className="text-sm mb-4">{user.email}</p>
      <div className="text-sm text-gray-200">User ID: {user.uid}</div>
    </div>
  );
};

export default Profile;
