import React, { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { realtimeDB, auth } from "../firebase/config";
import { updatePassword } from "firebase/auth";
import AvatarSelector from "../components/AvatarSelector";

const Profile = () => {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  // 🔹 Load current avatar + username
  useEffect(() => {
    if (!user) return;
    const userRef = ref(realtimeDB, `users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAvatar(data.avatar || null);
        setUsername(data.username || "");
      }
    });
  }, [user]);

  // 🔹 Save selected avatar
  const handleAvatarSelect = (url) => {
    if (!user) return;
    const userRef = ref(realtimeDB, `users/${user.uid}/avatar`);
    set(userRef, url);
    setAvatar(url);
    setShowSelector(false);
  };

  // 🔹 Save username
  const handleSaveProfile = () => {
    if (!user) return;
    const userRef = ref(realtimeDB, `users/${user.uid}`);
    set(userRef, {
      username,
      avatar,
      email: user.email,
    });
    setMessage("✅ Profile updated successfully!");
    setTimeout(() => setMessage(""), 2000);
  };

  // 🔹 Update password
  const handlePasswordChange = async () => {
    if (user && newPassword.length >= 6) {
      try {
        await updatePassword(user, newPassword);
        setMessage("🔒 Password updated!");
        setNewPassword("");
      } catch {
        setMessage("⚠️ Please re-login to change password.");
      }
    } else {
      setMessage("Password must be at least 6 characters!");
    }
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <div className="p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>

      {/* Avatar Section */}
      <div className="relative inline-block">
        <img
          src={avatar || "/avatars/default-avatar.png"}
          alt="Profile Avatar"
          className="w-32 h-32 rounded-full border-4 border-purple-400 shadow-md cursor-pointer hover:opacity-80 transition-all"
          onClick={() => setShowSelector(!showSelector)}
        />
        <p className="text-sm text-gray-300 mt-2">Click to change</p>
      </div>

      {showSelector && (
        <div className="mt-6 bg-white/10 p-4 rounded-2xl backdrop-blur-sm inline-block">
          <h3 className="text-lg font-semibold mb-3">Select Your Avatar</h3>
          <AvatarSelector currentAvatar={avatar} onSelect={handleAvatarSelect} />
        </div>
      )}

      {/* Username + Info */}
      <div className="max-w-md mx-auto mt-8 bg-white/10 p-6 rounded-2xl backdrop-blur-md">
        <label className="block mb-2 text-left">Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 rounded-md text-black mb-4"
          placeholder="Enter your username"
        />

        <label className="block mb-2 text-left">Email:</label>
        <input
          type="email"
          value={user?.email || ""}
          disabled
          className="w-full p-2 rounded-md text-gray-400 bg-gray-200 mb-4"
        />

        <label className="block mb-2 text-left">Change Password:</label>
        <div className="flex gap-2 mb-4">
          <input
            type="password"
            placeholder="New password..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="flex-1 p-2 rounded-md text-black"
          />
          <button
            onClick={handlePasswordChange}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 rounded-md"
          >
            Update
          </button>
        </div>

        <button
          onClick={handleSaveProfile}
          className="w-full bg-purple-500 hover:bg-purple-600 py-2 rounded-md font-semibold">
          Save Profile
        </button>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </div>
  );
};

export default Profile;
