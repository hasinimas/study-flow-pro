// src/components/StudyLogForm.jsx
import React, { useState } from "react";
import { ref, push } from "../firebase/config";
import { realtimeDB } from "../firebase/config";

export default function StudyLogForm({ user }) {
  const [subject, setSubject] = useState("");
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Sign in first");
    if (!subject.trim() || !hours || Number(hours) <= 0) return alert("Enter valid subject and hours.");
    const payload = {
      subject: subject.trim(),
      hours: Number(hours),
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
      day: new Date().toLocaleDateString("en-US", { weekday: "short" }),
      notes: notes.trim() || ""
    };
    // push session
    await push(ref(realtimeDB, `sessions/${user.uid}`), payload);
    // increment studiedHours
    const subjRef = ref(realtimeDB, `users/${user.uid}/subjects/${subject.trim()}/studiedHours`);
    onValueOnce(subjRef, async (curr) => {
      const curVal = curr || 0;
      await set(subjRef, Number(curVal) + Number(hours));
    });
    setSubject(""); setHours(""); setNotes("");
  };

  // helper to read once (since we didn't re-export onValueOnce earlier)
  const onValueOnce = (dbRef, cb) => {
    return new Promise((resolve) => {
      onValue(dbRef, (snap) => {
        cb(snap.val());
        resolve();
      }, { onlyOnce: true });
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <input className="p-2 rounded text-black" placeholder="Subject (must exist in Subject Setup)" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <input className="p-2 rounded text-black" placeholder="Hours" value={hours} onChange={(e) => setHours(e.target.value)} type="number" step="0.25" />
      <textarea
        className="p-3 rounded text-black h-32 resize-none leading-relaxed placeholder-gray-500"
        placeholder="Notes (optional)" value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex gap-2">
        <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded text-black font-semibold">Add Log</button>
      </div>
    </form>
  );
}
