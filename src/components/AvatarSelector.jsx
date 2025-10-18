import React from "react";

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
        <div
          key={index}
          className={`relative group rounded-full transition-all duration-300 hover:scale-110 ${
            currentAvatar === url ? "scale-110" : ""
          }`}
        >
          <img
            src={url}
            alt={`Avatar ${index + 1}`}
            className={`w-16 h-16 rounded-full border-4 transition-all duration-300 shadow-md ${
              currentAvatar === url
                ? "border-transparent ring-2 ring-offset-2 ring-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-300 p-[3px]"
                : "border-transparent hover:border-purple-300"
            }`}
            onClick={() => onSelect(url)}
          />
          {currentAvatar === url && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-300 opacity-30 blur-md animate-pulse"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AvatarSelector;
