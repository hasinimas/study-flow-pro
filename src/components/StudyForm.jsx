// src/components/StudyForm.jsx
import React, { useState } from "react";
import { realtimeDB, ref, push } from "../firebase/config"; // adjust path if needed

export default function StudyForm({ user }) {
  const [subject, setSubject] = useState("");
  const [hours, setHours] = useState("");

  if (!user) {
    return <div className="text-center">Please sign in to log study hours.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hrs = Number(hours);
    if (!subject.trim() || !hrs || hrs <= 0) return alert("Enter subject and hours > 0");

    const now = new Date();
    const dateISO = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const day = now.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue...
    const payload = {
      subject: subject.trim(),
      hours: hrs,
      timestamp: now.toISOString(),
      date: dateISO,
      day,
    };

    try {
      // write to /sessions/{uid}/{pushId}
      const sessionsRef = ref(realtimeDB, `sessions/${user.uid}`);
      await push(sessionsRef, payload);
      setSubject("");
      setHours("");
    } catch (err) {
      console.error("Failed to save session:", err);
      alert("Error saving. See console.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-white">Log Study Hours</h3>
      <input className="p-2 rounded text-black" placeholder="Subject (e.g. Math)" value={subject} onChange={(e)=>setSubject(e.target.value)} />
      <input type="number" step="0.5" className="p-2 rounded text-black" placeholder="Hours (e.g. 1.5)" value={hours} onChange={(e)=>setHours(e.target.value)} />
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded bg-yellow-400 text-black">Add</button>
        <button type="button" onClick={() => { setSubject(""); setHours(""); }} className="px-4 py-2 rounded border">Clear</button>
      </div>
    </form>
  );
}
