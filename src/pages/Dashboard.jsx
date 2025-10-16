import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { realtimeDB, ref, onValue, set } from "../firebase/config";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const defaultWeek = [
  { day: "Mon", hrs: 0 },
  { day: "Tue", hrs: 0 },
  { day: "Wed", hrs: 0 },
  { day: "Thu", hrs: 0 },
  { day: "Fri", hrs: 0 },
  { day: "Sat", hrs: 0 },
  { day: "Sun", hrs: 0 },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(defaultWeek);
  const [tip, setTip] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const refPath = ref(realtimeDB, `studyData/${user.uid}`);
    onValue(refPath, (snapshot) => {
      const val = snapshot.val();
      if (val) setData(val);
    });
  }, [user]);

  const handleAddHours = async (day, hrs) => {
    if (!user) return;
    const updated = data.map((d) => (d.day === day ? { ...d, hrs: +hrs } : d));
    setData(updated);
    const refPath = ref(realtimeDB, `studyData/${user.uid}`);
    await set(refPath, updated);
    setStatus("✅ Saved!");
    setTimeout(() => setStatus(""), 1200);
  };

  const avg = data.reduce((s, i) => s + i.hrs, 0) / 7;
  useEffect(() => {
    if (avg >= 4) setTip("Amazing consistency! Increase your challenge!");
    else if (avg >= 2.5) setTip("Good progress! Try mixing subjects.");
    else setTip("Low focus time. Try 25-minute Pomodoros!");
  }, [data]);

  return (
    <section className="mt-8 text-white">
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="md:col-span-2 bg-white/10 p-6 rounded-xl shadow"
        >
          <h3 className="text-lg font-bold mb-4">📊 Weekly Study Hours</h3>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="hrs"
                  stroke="url(#gradLine)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <defs>
                  <linearGradient id="gradLine" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.map((d) => (
              <div key={d.day} className="flex items-center gap-2">
                <label className="w-10">{d.day}</label>
                <input
                  type="number"
                  min="0"
                  value={d.hrs}
                  onChange={(e) => handleAddHours(d.day, e.target.value)}
                  className="w-20 p-1 rounded text-black"
                />
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-green-300">{status}</div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 p-6 rounded-xl shadow"
        >
          <h4 className="font-semibold mb-2">💡 AI Study Tip</h4>
          <p className="text-sm mb-4">{tip}</p>
        </motion.aside>
      </div>
    </section>
  );
}
