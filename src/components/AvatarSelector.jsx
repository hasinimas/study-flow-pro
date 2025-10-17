import React, { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { realtimeDB, auth } from "../firebase/config";

const AvatarSelector = ({ currentAvatar, onSelect }) => {
  const avatars = [
    "/avatars/avatar1.png",
    "/avatars/avatar2.png",
    "/avatars/avatar3.jpg",
    "/avatars/avatar4.png",
    "/avatars/avatar5.jpeg",
    "/avatars/avatar6.jpeg",
    "/avatars/avatar7.jpg",
    "/avatars/avatar8.png",
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mt-4">
      {avatars.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`Avatar ${index + 1}`}
          className={`w-16 h-16 rounded-full cursor-pointer border-4 transition-all duration-200 ${
            currentAvatar === url ? "border-purple-500 scale-110" : "border-transparent hover:border-purple-300"
          }`}
          onClick={() => onSelect(url)}
        />
      ))}
    </div>
  );
};

export default AvatarSelector;
