// src/components/MindRelax.jsx
import React, { useRef, useState } from "react";


const LIST = [
  { label: "Rain", url: "/assets/rain.mp3" },
  { label: "Waves", url: "/assets/ocean.mp3" },
  { label: "Forest", url: "/assets/piano.mp3" },
  { label: "Birds", url: "/assets/birds.mp3" },
  { label: "Flute", url: "/assets/flute.mp3" },
];

export default function MindRelax() {
  const audioRef = useRef(null);
  const [track, setTrack] = useState("");
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (!track) return alert("Select a track first");
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.src = track; a.loop = true; a.play(); setPlaying(true); }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <select className="p-2 rounded text-black" value={track} onChange={(e)=>setTrack(e.target.value)}>
          <option value="">Select Music</option>
          {LIST.map((t,i)=> <option key={i} value={t.url}>{t.label}</option>)}
        </select>
        <button onClick={togglePlay} className={`px-3 py-1 rounded text-white font-semibold ${playing ? "bg-red-500" : "bg-green-500"}`}>
          {playing ? "⏸ Pause" : "▶️ Play"}
        </button>
      </div>
      <audio ref={audioRef} />
      <p className="text-xs text-gray-300 mt-2">Take a 5–10 minute break to refresh.</p>
    </div>
  );
}
