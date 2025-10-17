// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { realtimeDB, ref, onValue, set } from "../firebase/config";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import StudyChart from "../components/StudyChart";
import SubjectPie from "../components/SubjectPie";
import TaskList from "../components/TaskList";

/*
Session structure stored under /sessions/{uid}/{pushId}:
{
  subject: string,
  hours: number,
  timestamp: ISO,
  date: "YYYY-MM-DD",
  day: "Mon"
}
*/

function computeTip(avg) {
  if (avg >= 4) return "Amazing — keep challenging yourself! Try advanced problems.";
  if (avg >= 2.5) return "Good streak! Add variety: rotate subjects for balanced learning.";
  return "Low focus time. Start with 25-minute Pomodoros and tiny wins.";
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [sessionsObj, setSessionsObj] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) { setSessionsObj({}); setLoading(false); return; }
    const sessionsRef = ref(realtimeDB, `sessions/${user.uid}`);
    const off = onValue(sessionsRef, (snap) => {
      setSessionsObj(snap.val() || {});
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });
    return () => off && off();
  }, [user]);

  const sessionsArray = useMemo(() => Object.entries(sessionsObj).map(([id, s]) => ({ id, ...s })).sort((a,b)=> (b.timestamp||"").localeCompare(a.timestamp||"")), [sessionsObj]);

  // weekly aggregation for last 7 days
  const last7 = useMemo(() => {
    const map = {};
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0,10);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      map[iso] = { date: iso, day: label, hrs: 0 };
      arr.push(map[iso]);
    }
    sessionsArray.forEach(s => {
      if (s.date && map[s.date]) map[s.date].hrs += Number(s.hours || 0);
    });
    return arr;
  }, [sessionsArray]);

  // subject distribution
  const subjectDist = useMemo(() => {
    const m = {};
    sessionsArray.forEach(s => {
      const sub = s.subject || "Other";
      m[sub] = (m[sub] || 0) + Number(s.hours || 0);
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [sessionsArray]);

  // avg hours per day (week)
  const avg = useMemo(() => {
    return last7.reduce((s,i)=>s+Number(i.hrs||0),0)/7;
  }, [last7]);

  const aiTip = computeTip(avg);

  return (
    <div className="container mx-auto">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card">
          <h2 className="text-xl font-bold mb-3">Weekly Overview</h2>
          {loading ? <div>Loading…</div> : <StudyChart data={last7} />}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Recent entries</h3>
            {sessionsArray.length === 0 ? <div>No sessions logged yet</div> : (
              <ul className="space-y-2">
                {sessionsArray.slice(0,10).map(s => (
                  <li key={s.id} className="p-2 rounded bg-white/5 flex justify-between">
                    <div>
                      <div className="font-semibold">{s.subject}</div>
                      <div className="text-sm">{s.date} • {s.day}</div>
                    </div>
                    <div className="font-bold">{s.hours} h</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Subject Breakdown</h3>
          <SubjectPie data={subjectDist} />
          <div className="mt-4">
            <h4 className="font-semibold">AI Study Tip</h4>
            <p className="text-sm mt-2">{aiTip}</p>
            <p className="text-xs mt-2 text-slate-200">Average: {avg.toFixed(2)} hrs/day</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <TaskList />
      </div>
    </div>
  );
}
