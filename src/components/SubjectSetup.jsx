// src/components/SubjectSetup.jsx
import React, { useState } from "react";
import { realtimeDB, ref, set } from "../firebase/config";

export default function SubjectSetup({ user }) {
  const [name, setName] = useState("");
  const [hours, setHours] = useState("");

  const addSubject = async (e) => {
    e.preventDefault();
    if (!user) return alert("Sign in first.");
    if (!name.trim() || !hours || Number(hours) <= 0) return alert("Enter subject and target hours.");
    const node = ref(realtimeDB, `users/${user.uid}/subjects/${name.trim()}`);
    await set(node, { targetHours: Number(hours), studiedHours: 0 });
    setName("");
    setHours("");
  };

  return (
    <form onSubmit={addSubject} className="flex flex-col gap-2">
      <input className="p-2 rounded text-black" placeholder="Subject name (e.g. Math)" value={name} onChange={(e)=>setName(e.target.value)} />
      <input type="number" className="p-2 rounded text-black" step="0.5" placeholder="Target hours (e.g. 2.5)" value={hours} onChange={(e)=>setHours(e.target.value)} />
      <div className="flex gap-2">
        <button className="bg-gradient-to-r from-green-400 to-green-500 px-4 py-2 rounded text-black font-semibold">Add Subject</button>
        <button type="button" onClick={()=>{ setName(''); setHours(''); }} className="px-4 py-2 rounded border">Clear</button>
      </div>
    </form>
  );
}
