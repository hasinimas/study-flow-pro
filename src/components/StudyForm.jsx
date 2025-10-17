// src/components/StudyForm.jsx
import React, { useState, useEffect } from "react";
import { auth, realtimeDB, ref, push } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function StudyForm() {
  const [user, setUser] = useState(null);
  const [subject, setSubject] = useState("");
  const [hours, setHours] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please sign in.");
    if (!subject.trim() || !hours || Number(hours) <= 0) return alert("Enter subject and hours > 0.");
    const now = new Date();
    const payload = {
      subject: subject.trim(),
      hours: Number(hours),
      timestamp: now.toISOString(),
      date: now.toISOString().slice(0,10),
      day: now.toLocaleDateString("en-US", { weekday: "short" })
    };
    const sessionsRef = ref(realtimeDB, `sessions/${user.uid}`);
    try {
      await push(sessionsRef, payload);
      setSubject("");
      setHours("");
    } catch (err) {
      console.error(err);
      alert("Failed to save session.");
    }
  };

  return (
    <div className="card mb-4">
      <h3 className="text-lg font-semibold mb-3">Log Study Hours</h3>
      <form onSubmit={handleAdd} className="flex gap-2 flex-wrap">
        <input placeholder="Subject (e.g. Math)" className="p-2 rounded text-black flex-1 min-w-[180px]" value={subject} onChange={(e)=>setSubject(e.target.value)} />
        <input type="number" step="0.5" placeholder="Hours" className="p-2 rounded text-black w-28" value={hours} onChange={(e)=>setHours(e.target.value)} />
        <button className="btn-primary">Add Session</button>
      </form>
    </div>
  );
}
