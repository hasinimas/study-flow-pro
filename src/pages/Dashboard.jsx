// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { realtimeDB, ref, onValue, set, push } from "../firebase/config";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import StudyChart from "../components/StudyChart";
import SubjectPie from "../components/SubjectPie";
import TaskList from "../components/TaskList";
import StudyForm from "../components/StudyForm";

/*
Structure used:
- sessions/{uid}/{pushId} => { subject, hours, notes, timestamp ISO, date YYYY-MM-DD, day short }
- users/{uid}/goalHours => numeric weekly goal
*/

function computeTip(avg, weakest) {
  if (avg >= 4) return `Amazing — keep challenging yourself! Try deeper ${weakest} problems.`;
  if (avg >= 2.5) return `Good streak! Add variety — spend a little more time on ${weakest}.`;
  return `Low focus time. Start with 25-minute Pomodoros and tiny wins focused on ${weakest}.`;
}

// helper to calculate streak (consecutive days with >=1 session)
// sessionsDates: array of ISO date strings
function calcStreakFromDates(sessionsDates = []) {
  if (!sessionsDates.length) return 0;
  const unique = Array.from(new Set(sessionsDates)).sort((a,b)=> new Date(b) - new Date(a)); // newest first
  let streak = 0;
  let cur = new Date();
  cur.setHours(0,0,0,0);

  for (let i = 0; ; i++) {
    const dayISO = cur.toISOString().slice(0,10);
    if (unique.includes(dayISO)) {
      streak += 1;
      // move to previous day
      cur.setDate(cur.getDate() - 1);
      continue;
    }
    break;
  }
  return streak;
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [sessionsObj, setSessionsObj] = useState({});
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState(20);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(20);
  const [currentTime, setCurrentTime] = useState(new Date());

  // clock
  useEffect(() => {
    const t = setInterval(()=> setCurrentTime(new Date()), 1000);
    return ()=> clearInterval(t);
  }, []);

  // auth listener
  useEffect(()=> {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // load sessions
  useEffect(()=> {
    if(!user){ setSessionsObj({}); setLoading(false); return; }
    const sessionsRef = ref(realtimeDB, `sessions/${user.uid}`);
    const off = onValue(sessionsRef, snap => {
      setSessionsObj(snap.val() || {});
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
    // load goal if exists
    const goalRef = ref(realtimeDB, `users/${user.uid}/goalHours`);
    const offGoal = onValue(goalRef, snap => {
      const val = snap.val();
      if(val !== null && val !== undefined) {
        setGoal(Number(val));
        setGoalInput(Number(val));
      }
    });
    return () => { off && off(); offGoal && offGoal(); };
  }, [user]);

  const sessionsArray = useMemo(() => {
    return Object.entries(sessionsObj || {}).map(([id, s]) => ({ id, ...s }))
      .sort((a,b)=> (b.timestamp||"").localeCompare(a.timestamp||""));
  }, [sessionsObj]);

  // last 7 days aggregation
  const last7 = useMemo(()=> {
    const map = {}; const arr=[];
    for(let i=6;i>=0;i--){
      const d = new Date(); d.setDate(d.getDate()-i);
      const iso = d.toISOString().slice(0,10);
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      map[iso] = { date: iso, day: label, hrs: 0 };
      arr.push(map[iso]);
    }
    sessionsArray.forEach(s=>{
      if(s.date && map[s.date]) map[s.date].hrs += Number(s.hours || 0);
    });
    return arr;
  }, [sessionsArray]);

  // subject distribution (object for SubjectPie expects array of {name,value})
  const subjectDist = useMemo(()=>{
    const m = {};
    sessionsArray.forEach(s => {
      const sub = s.subject || "Other";
      m[sub] = (m[sub] || 0) + Number(s.hours || 0);
    });
    return Object.entries(m).map(([name,value]) => ({ name, value }));
  }, [sessionsArray]);

  // average and totals
  const totalThisWeek = useMemo(()=> last7.reduce((s,i)=> s + Number(i.hrs||0), 0), [last7]);
  const avg = useMemo(()=> totalThisWeek / 7, [totalThisWeek]);

  // weakest subject
  const weakest = useMemo(()=> {
    if(!subjectDist.length) return "this subject";
    return subjectDist.reduce((a,b)=> a.value < b.value ? a : b).name;
  }, [subjectDist]);

  const aiTip = computeTip(avg, weakest);

  // streak
  const streak = useMemo(()=> {
    const dates = sessionsArray.map(s=> s.date);
    return calcStreakFromDates(dates);
  }, [sessionsArray]);

  // Update goal in DB
  const saveGoal = async () => {
    if(!user) return;
    const node = ref(realtimeDB, `users/${user.uid}/goalHours`);
    await set(node, Number(goalInput));
    setEditingGoal(false);
  };

  // formatted clock
  const formattedTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: "long", year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="container mx-auto text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white/10 p-4 rounded-xl shadow">
        <div>
          <h1 className="text-2xl font-bold">📚 Study Dashboard</h1>
          <p className="text-sm text-gray-300">Welcome back, {user?.email || "Guest"}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{formattedTime}</p>
          <p className="text-sm text-gray-300">{formattedDate}</p>
        </div>
      </div>

      {/* Quick input + goal + streak row */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="card md:col-span-2">
          <StudyForm />
        </div>

        <div className="card">
          <div className="mb-3">
            <h3 className="text-lg font-semibold">Weekly Goal</h3>
            {editingGoal ? (
              <div className="flex gap-2 mt-2">
                <input type="number" value={goalInput} onChange={(e)=>setGoalInput(e.target.value)} className="p-2 rounded text-black w-full" />
                <button onClick={saveGoal} className="bg-purple-600 px-3 py-1 rounded">Save</button>
              </div>
            ) : (
              <div className="mt-2">
                <div className="text-2xl font-bold">{totalThisWeek.toFixed(1)} / {goal} hrs</div>
                <div className="w-full bg-white/20 h-3 rounded mt-2 overflow-hidden">
                  <div className="bg-purple-500 h-3" style={{ width: `${Math.min((totalThisWeek/goal)*100,100)}%` }} />
                </div>
                <button onClick={()=> setEditingGoal(true)} className="mt-3 text-sm underline">Edit Goal</button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h4 className="text-lg font-semibold">Streak</h4>
            <div className="text-2xl font-bold mt-2">{streak} days 🔥</div>
            <p className="text-sm text-gray-300 mt-2">Keep the streak by logging daily study sessions.</p>
          </div>

          <div className="mt-4">
            <h4 className="text-lg font-semibold">AI Tip</h4>
            <p className="text-sm mt-2">{aiTip}</p>
          </div>
        </div>
      </div>

      {/* Main grid: charts + subject breakdown */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card">
          <h2 className="text-xl font-bold mb-3">Weekly Overview</h2>
          {loading ? <div>Loading…</div> : <StudyChart data={last7} />}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Recent entries</h3>
            {sessionsArray.length === 0 ? <div>No sessions logged yet</div> : (
              <ul className="space-y-2">
                {sessionsArray.slice(0,5).map(s => (
                  <li key={s.id} className="p-2 rounded bg-white/5 flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{s.subject}</div>
                      <div className="text-sm text-gray-300">{s.date} • {s.day}</div>
                      {s.notes && <div className="text-xs text-gray-400 mt-1">Note: {s.notes}</div>}
                    </div>
                    <div className="font-bold text-yellow-400">{s.hours} h</div>
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
            <h4 className="font-semibold">Quick Suggestion</h4>
            <p className="text-sm mt-2">Try to balance time — you've spent least on <b>{weakest}</b> this week.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
