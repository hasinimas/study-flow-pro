// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { realtimeDB, ref, onValue, set, push } from "../firebase/config";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

import SubjectProgressChart from "../components/SubjectProgressChart";
import StudyTimerPanel from "../components/StudyTimerPanel";
import MindRelax from "../components/MindRelax";
import StudyLogForm from "../components/StudyLogForm"; // manual log entry (subject/hours/notes)
import SubjectSetup from "../components/SubjectSetup"; // add subject + targetHours
import SubjectPie from "../components/SubjectPie";

function computeTip(avg, weakest) {
  if (avg >= 4) return `Amazing — keep challenging yourself! Try deeper ${weakest} problems.`;
  if (avg >= 2.5) return `Good streak! Add variety — spend a little more time on ${weakest}.`;
  return `Low focus time. Start with 25-minute Pomodoros and tiny wins focused on ${weakest}.`;
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [subjectsObj, setSubjectsObj] = useState({});
  const [sessionsObj, setSessionsObj] = useState({});
  const [goalHours, setGoalHours] = useState(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [loading, setLoading] = useState(true);

  // auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // realtime listeners
  useEffect(() => {
    if (!user) {
      setSubjectsObj({});
      setSessionsObj({});
      setGoalHours(null);
      setLoading(false);
      return;
    }

    const subjRef = ref(realtimeDB, `users/${user.uid}/subjects`);
    const offSub = onValue(subjRef, (snap) => {
      setSubjectsObj(snap.val() || {});
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });

    const sessRef = ref(realtimeDB, `sessions/${user.uid}`);
    const offSess = onValue(sessRef, (snap) => {
      setSessionsObj(snap.val() || {});
    });

    const goalRef = ref(realtimeDB, `users/${user.uid}/goalHours`);
    const offGoal = onValue(goalRef, (snap) => {
      const v = snap.val();
      setGoalHours(v === null || v === undefined ? null : Number(v));
      if (v !== null && v !== undefined) setGoalInput(String(v));
    });

    return () => {
      offSub && offSub();
      offSess && offSess();
      offGoal && offGoal();
    };
  }, [user]);

  const subjects = useMemo(() => {
    return Object.entries(subjectsObj || {}).map(([name, s]) => ({
      name,
      target: Number(s?.targetHours || 0),
      studied: Number(s?.studiedHours || 0),
    }));
  }, [subjectsObj]);

  // last 7 days chart (re-use your existing structure)
  const last7 = useMemo(() => {
    const map = {}; const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      map[iso] = { date: iso, day: label, hrs: 0 };
      arr.push(map[iso]);
    }
    Object.values(sessionsObj || {}).forEach(s => {
      if (s?.date && map[s.date]) map[s.date].hrs += Number(s.hours || 0);
    });
    return arr;
  }, [sessionsObj]);

  const totalThisWeek = useMemo(() => last7.reduce((s,i)=>s + Number(i.hrs||0), 0), [last7]);
  const avg = useMemo(() => totalThisWeek / 7, [totalThisWeek]);
  const subjectDist = useMemo(() => {
    const m = {};
    Object.values(sessionsObj || {}).forEach(s => {
      const sub = s?.subject || "Other";
      m[sub] = (m[sub] || 0) + Number(s.hours || 0);
    });
    return Object.entries(m).map(([name,value]) => ({ name, value }));
  }, [sessionsObj]);

  const weakest = useMemo(()=> subjectDist.length ? subjectDist.reduce((a,b)=> a.value < b.value ? a : b).name : "this subject", [subjectDist]);
  const aiTip = computeTip(avg, weakest);

  // save goal
  const saveGoal = async () => {
    if (!user) return;
    const g = Number(goalInput) || 0;
    await set(ref(realtimeDB, `users/${user.uid}/goalHours`), g);
    setEditingGoal(false);
  };

  // grid layout: 3 rows x 2 columns (responsive)
  // Row1: (A) Subject Setup, (B) Goal Panel (top-right)
  // Row2: (C) Subject Progress Chart, (D) Weekly Overview/SubjectPie
  // Row3: (E) Study Timer Panel, (F) Mind Relax Zone + quick StudyLogForm (stacked)

  return (
    <div className="container mx-auto px-4 py-4 text-white">
      <h1 className="text-2xl font-bold mb-4">📚 Study Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row1 Col A: Subject Setup (initial setup) */}
        <div className="card p-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
          <h3 className="text-lg font-semibold mb-2">➕ Subject Setup (today)</h3>
          <p className="text-sm text-gray-300 mb-3">Add subject + target hours for today's plan. These subjects will appear in timer and progress chart.</p>
          <SubjectSetup user={user} />
        </div>

        {/* Row1 Col B: Goal Panel */}
        <div className="card p-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
          <h3 className="text-lg font-semibold mb-2">🎯 Weekly Goal</h3>
          {editingGoal ? (
            <div className="flex gap-2">
              <input className="p-2 rounded text-black w-full" value={goalInput} onChange={(e)=>setGoalInput(e.target.value)} />
              <button onClick={saveGoal} className="px-3 py-1 rounded bg-purple-600">Save</button>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold mb-2">{totalThisWeek.toFixed(1)} / {goalHours ?? "—"} hrs</div>
              <div className="w-full bg-white/20 h-3 rounded overflow-hidden">
                <div className="bg-purple-500 h-3" style={{ width: `${goalHours ? Math.min((totalThisWeek/goalHours)*100,100) : 0}%` }} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button onClick={()=>setEditingGoal(true)} className="text-sm underline">Edit Goal</button>
                <div className="text-sm text-gray-300">Avg: {avg.toFixed(2)} hrs/day</div>
              </div>
              <div className="mt-3 text-sm text-gray-300">
                <strong>AI Tip:</strong> {aiTip}
              </div>
            </>
          )}
        </div>

        {/* Row2 Col C: Subject Progress Chart */}
        <div className="card p-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
          <h3 className="text-lg font-semibold mb-2">📊 Subject Progress (today)</h3>
          <p className="text-sm text-gray-300 mb-2">Each bar = target hours; filled portion = studied hours (live)</p>
          <SubjectProgressChart data={subjects} />
        </div>

        {/* Row2 Col D: Weekly Overview (line chart) + Subject Pie */}
        <div className="card p-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
          <h3 className="text-lg font-semibold mb-2">📅 Weekly Overview</h3>
          {/* Re-use your StudyChart if available — else you can show last7 raw */}
          <div className="mb-4">
            {/* If you have existing StudyChart component, import and use here */}
            {/* <StudyChart data={last7} /> */}
            <div className="text-sm text-gray-300 mb-2">Daily hours (last 7 days)</div>
            <div className="bg-white/5 rounded p-3 text-sm text-gray-200">[Line chart area — existing StudyChart should render here]</div>
          </div>

          <div className="mt-3">
            <h4 className="font-semibold mb-2">Subject Breakdown</h4>
            <SubjectPie data={subjectDist} />
          </div>
        </div>

        {/* Row3 Col E: Timer Panel */}
        <div className="card p-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
          <h3 className="text-lg font-semibold mb-2">⏱️ Study Timer</h3>
          <p className="text-sm text-gray-300 mb-3">Select a subject below and Start / Pause / Stop. On Stop the studied time is saved and session pushed.</p>
          <StudyTimerPanel user={user} subjects={subjects} />
        </div>

        {/* Row3 Col F: Mind Relax + Quick Log */}
        <div className="card p-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
          <h3 className="text-lg font-semibold mb-2">🎵 Mind Relax Zone</h3>
          <MindRelax />
        </div>
      </div>
    </div>
  );
}

