// src/components/StudyTimerPanel.jsx
import React, { useEffect, useRef, useState } from "react";
import { ref, onValue, set, push } from "../firebase/config";
import { realtimeDB } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

export default function StudyTimerPanel({ user, subjects = [] }) {
  const [currentUser, setCurrentUser] = useState(user);
  const [selected, setSelected] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const startTsRef = useRef(null);

  useEffect(() => {
    // if user prop changes update local
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
    return () => unsub();
  }, []);

  useEffect(()=> {
    return ()=> clearInterval(intervalRef.current);
  }, []);

  const start = () => {
    if (!selected) return alert("Select subject first.");
    if (!currentUser) return alert("Sign in first.");

    setIsRunning(true);
    startTsRef.current = Date.now() - elapsed * 1000;
    intervalRef.current = setInterval(() => {
      const delta = Date.now() - startTsRef.current;
      setElapsed(Math.floor(delta / 1000));
    }, 500);
  };

  const pause = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  const stop = async () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    const secs = elapsed;
    if (!currentUser || !selected) {
      setElapsed(0);
      return;
    }
    if (secs <= 0) { setElapsed(0); return; }
    const hours = secs / 3600;

    // 1) increment studiedHours
    const subjStudiedRef = ref(realtimeDB, `users/${currentUser.uid}/subjects/${selected}/studiedHours`);
    // read once and update
    onValue(subjStudiedRef, async (snap) => {
      const cur = snap.val() || 0;
      await set(subjStudiedRef, Number(cur) + Number(hours));
    }, { onlyOnce: true });

    // 2) push session to /sessions/{uid}
    const sessRef = ref(realtimeDB, `sessions/${currentUser.uid}`);
    const payload = {
      subject: selected,
      hours: Number(hours.toFixed(3)),
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().slice(0,10),
      day: new Date().toLocaleDateString("en-US", { weekday: "short" }),
    };
    await push(sessRef, payload);

    setElapsed(0);
  };

  const format = (s) => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  return (
    <div>
      <select value={selected} onChange={e=>setSelected(e.target.value)} className="p-2 rounded text-black w-full mb-3">
        <option value="">Select Subject</option>
        {subjects.map(s => <option key={s.name} value={s.name}>{s.name} — target {s.target}h (done {s.studied.toFixed(2)}h)</option>)}
      </select>

      <div className="text-2xl font-mono mb-3">{format(elapsed)}</div>

      <div className="flex gap-3">
        {!isRunning ? (
          <button onClick={start} className="bg-green-500 hover:bg-green-600 px-4 py-1 rounded text-white">▶️ Start</button>
        ) : (
          <button onClick={pause} className="bg-yellow-500 hover:bg-yellow-600 px-4 py-1 rounded text-white">⏸ Pause</button>
        )}
        <button onClick={stop} className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-white">⏹ Stop</button>
      </div>
    </div>
  );
}
