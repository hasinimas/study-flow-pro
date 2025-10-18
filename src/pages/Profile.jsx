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
    setTimeout(() => setMessage(""), 2500);
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
     <div className="min-h-screen flex flex-col items-center justify-center p-8 text-white bg-gradient-to-br from-[#60068a] via-[#c036cf] to-[#1b8ed1]">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-300 via-blue-300 to-pink-300 bg-clip-text text-transparent">
          My Profile 🌸
        </h2>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={avatar || "/avatars/default-avatar.png"}
              alt="Profile Avatar"
              className="w-32 h-32 rounded-full border-4 border-purple-400 shadow-md cursor-pointer hover:opacity-80 transition-all"
              onClick={() => setShowSelector(!showSelector)}
            />
          </div>
          <p className="text-sm text-gray-300 mt-2">Click to change avatar</p>
        </div>

        {showSelector && (
          <div className="mt-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
            <h3 className="text-lg font-semibold mb-3 text-center">
              Select Your Avatar
            </h3>
            <AvatarSelector
              currentAvatar={avatar}
              onSelect={handleAvatarSelect}
            />
          </div>
        )}

        {/* Profile Info Section */}
        <div className="mt-6">
          <label className="block mb-2 text-left font-medium">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 mb-4 transition-all"
            placeholder="Enter your username"
          />

          <label className="block mb-2 text-left font-medium">Email:</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full p-3 rounded-lg bg-gray-300 text-gray-600 mb-4 cursor-not-allowed"
          />

          <label className="block mb-2 text-left font-medium">
            Change Password:
          </label>
          <div className="flex gap-2 mb-6">
            <input
              type="password"
              placeholder="New password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 p-3 rounded-lg bg-white/20 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
            />
            <button
              onClick={handlePasswordChange}
              className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-300 text-white px-4 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md"
            >
              Update
            </button>
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-500 to-pink-300 py-2 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg"
          >
            Save Profile
          </button>
        </div>

        {message && (
          <div
            className={`mt-6 text-center text-sm ${
              message.includes("✅") || message.includes("🔒")
                ? "bg-green-500/20 border border-green-400 text-green-200"
                : "bg-red-500/20 border border-red-400 text-red-200"
            } rounded p-2 animate-fadeIn`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
