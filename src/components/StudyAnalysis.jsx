// src/components/StudyAnalysis.jsx
import React, { useEffect, useMemo, useState } from "react";
import { realtimeDB, ref, onValue } from "../firebase/config";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import StudyChart from "../components/StudyChart";
import SubjectPie from "../components/SubjectPie";

/*
StudyAnalysis component
- Reads sessions/{uid} and users/{uid}/goalHours and optional goals/{uid}
- Shows:
  - daily last-7 trend (StudyChart)
  - per-subject this-week vs last-week comparison
  - smart suggestions
  - non-editable cute goal container (reads Dashboard-set goal)
  - 7-star gamified progress
  - recent week history (from /goals if present, else computed)
*/

// helpers
function isoDateNDaysAgo(n) {
  const d = new Date();
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0,10);
}

function getWeekKeyFromDate(d = new Date()) {
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((d - oneJan) / 86400000);
  const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2,"0")}`;
}

export default function StudyAnalysis() {
  const [user, setUser] = useState(null);
  const [sessionsObj, setSessionsObj] = useState({});
  const [goalHours, setGoalHours] = useState(null);
  const [savedGoals, setSavedGoals] = useState(null);

  // auth subscribe
  useEffect(() => {
    const uSub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => uSub && uSub();
  }, []);

  // load DB nodes
  useEffect(() => {
    if (!user) return;
    const sRef = ref(realtimeDB, `sessions/${user.uid}`);
    const gRef = ref(realtimeDB, `users/${user.uid}/goalHours`);
    const wgRef = ref(realtimeDB, `goals/${user.uid}`);

    const offS = onValue(sRef, (snap) => setSessionsObj(snap.val() || {}), (err)=>console.error(err));
    const offG = onValue(gRef, (snap) => {
      const v = snap.val();
      setGoalHours(v === null || v === undefined ? null : Number(v));
    }, (err)=>console.error(err));
    const offWG = onValue(wgRef, (snap) => setSavedGoals(snap.val() || null), (err)=>{/* optional */});

    return () => { offS && offS(); offG && offG(); offWG && offWG(); };
  }, [user]);

  const sessionsArray = useMemo(() => {
    return Object.entries(sessionsObj || {}).map(([id,s]) => ({ id, ...s }));
  }, [sessionsObj]);

  // last 7 days for chart
  const last7 = useMemo(() => {
    const map = {}; const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
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

  // subject distribution (this week)
  const subjectThisWeek = useMemo(() => {
    const startISO = isoDateNDaysAgo(6);
    const m = {};
    sessionsArray.forEach(s => {
      if (!s.date) return;
      if (s.date >= startISO) {
        const name = s.subject || "Other";
        m[name] = (m[name] || 0) + Number(s.hours || 0);
      }
    });
    return Object.entries(m).map(([name,value])=> ({ name, value }));
  }, [sessionsArray]);

  // comparison this vs last week
  const comparison = useMemo(() => {
    const today = new Date();
    const thisWeekStart = new Date(); thisWeekStart.setDate(today.getDate() - 6); thisWeekStart.setHours(0,0,0,0);
    const lastWeekStart = new Date(); lastWeekStart.setDate(today.getDate() - 13); lastWeekStart.setHours(0,0,0,0);
    const lastWeekEnd = new Date(); lastWeekEnd.setDate(today.getDate() - 7); lastWeekEnd.setHours(23,59,59,999);

    const t = {}; const l = {};
    sessionsArray.forEach(s => {
      if (!s.date) return;
      const d = new Date(s.date + "T00:00:00");
      const name = s.subject || "Other";
      if (d >= thisWeekStart) {
        t[name] = (t[name] || 0) + Number(s.hours || 0);
      } else if (d >= lastWeekStart && d <= lastWeekEnd) {
        l[name] = (l[name] || 0) + Number(s.hours || 0);
      }
    });

    const subjects = Array.from(new Set([...Object.keys(t), ...Object.keys(l)]));
    const rows = subjects.map(name => {
      const thisW = t[name] || 0;
      const lastW = l[name] || 0;
      const diff = thisW - lastW;
      const pct = lastW === 0 ? (thisW === 0 ? 0 : 100) : ((thisW - lastW)/lastW)*100;
      return { name, thisWeek: thisW, lastWeek: lastW, diff, pct };
    }).sort((a,b)=> b.thisWeek - a.thisWeek);
    return { rows, totalsThis: t, totalsLast: l };
  }, [sessionsArray]);

  // total this week
  const totalThisWeek = useMemo(() => last7.reduce((s,i)=> s + Number(i.hrs || 0), 0), [last7]);

  // weakest subject
  const weakSubject = useMemo(() => {
    if (!subjectThisWeek.length) return "your weakest subject";
    return subjectThisWeek.reduce((a,b)=> a.value < b.value ? a : b).name;
  }, [subjectThisWeek]);

  // suggestions
  const suggestions = useMemo(() => {
    const rows = comparison.rows || [];
    const list = [];
    rows.forEach(r => {
      if (r.lastWeek > 1 && r.thisWeek < r.lastWeek * 0.6) {
        list.push(`You studied noticeably less ${r.name} this week (${r.thisWeek}h vs ${r.lastWeek}h). Consider revising it.`);
      } else if (r.thisWeek > r.lastWeek && r.lastWeek >= 1) {
        list.push(`Good increase in ${r.name}: ${r.lastWeek}h → ${r.thisWeek}h.`);
      }
    });
    if (!list.length) list.push("No major imbalances detected — keep it steady or try adding variety.");
    return list;
  }, [comparison]);

  const weekKey = useMemo(() => getWeekKeyFromDate(new Date()), []);

  // stars (0-7) based on Dashboard-set goalHours (non-editable here)
  const stars = useMemo(() => {
    if (!goalHours || goalHours <= 0) return 0;
    const percent = Math.min((totalThisWeek / goalHours) * 100, 100);
    return Math.round((percent / 100) * 7);
  }, [totalThisWeek, goalHours]);

  // build recent week history: prefer savedGoals if present
  const weekHistory = useMemo(() => {
    const history = [];
    if (savedGoals) {
      Object.entries(savedGoals).forEach(([k,v]) => {
        history.push({
          week: k,
          goalHours: v.goalHours ?? null,
          actualHours: v.actualHours ?? null,
          stars: v.stars ?? (v.goalHours ? Math.round(((v.actualHours||0)/v.goalHours)*7) : 0)
        });
      });
      history.sort((a,b)=> b.week.localeCompare(a.week));
      return history.slice(0,8);
    }

    // compute last 6 weeks from sessions
    const now = new Date();
    for (let i=0;i<6;i++){
      const d = new Date();
      d.setDate(now.getDate() - (i*7));
      const k = getWeekKeyFromDate(d);
      const weekStart = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
      weekStart.setHours(0,0,0,0);
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
      const tot = sessionsArray.filter(s => {
        if (!s.date) return false;
        const dd = new Date(s.date + "T00:00:00");
        return dd >= weekStart && dd < weekEnd;
      }).reduce((a,b)=> a + Number(b.hours || 0), 0);
      history.push({ week: k, goalHours: null, actualHours: tot, stars: 0 });
    }
    return history;
  }, [savedGoals, sessionsArray]);

  const smallStat = (label, value) => (
    <div className="text-sm text-gray-300">
      <div className="text-xs">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );

  return (
    <div className="container mx-auto text-white p-4">
      <h2 className="text-2xl font-bold mb-4">📈 Analysis</h2>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-semibold">This Week Overview</h3>
              <div className="text-sm text-gray-300">Week: {weekKey}</div>
            </div>
            <div className="flex gap-4">
              {smallStat("Total (this week)", `${totalThisWeek.toFixed(1)} hrs`)}
              {smallStat("Avg/day", `${(totalThisWeek/7).toFixed(2)} hrs`)}
              {smallStat("Weak subject", weakSubject)}
            </div>
          </div>

          <div className="mb-4">
            <StudyChart data={last7} />
          </div>

          <div>
            <h4 className="font-semibold mb-2">Subject: This week vs Last week</h4>
            <div className="space-y-2">
              {(comparison.rows || []).slice(0,8).map(r => (
                <div key={r.name} className="p-2 rounded bg-white/5 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-gray-300">{r.lastWeek}h → {r.thisWeek}h</div>
                  </div>
                  <div className={r.diff >= 0 ? "text-green-300 font-semibold" : "text-red-300 font-semibold"}>
                    {r.diff >= 0 ? `+${r.diff.toFixed(1)}h` : `${r.diff.toFixed(1)}h`}
                  </div>
                </div>
              ))}
              {comparison.rows.length === 0 && <div className="text-sm text-gray-300 p-2">No session data to compare yet.</div>}
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Smart Suggestions</h4>
              <ul className="list-disc pl-5 text-sm text-gray-300 space-y-2">
                {suggestions.map((s,i)=>(<li key={i}>{s}</li>))}
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
          <h4 className="text-lg font-semibold mb-3">Study Goal & Stars</h4>

          <div className="bg-white/10 p-3 rounded-md mb-3 text-center">
            <div className="text-xs text-gray-300">Weekly Goal (set in Dashboard)</div>
            <div className="text-2xl font-bold mt-1">{goalHours ? `${goalHours} hrs` : "Not set"}</div>
            <div className="text-sm text-gray-300 mt-1">
              Progress: {goalHours ? `${Math.min((totalThisWeek/goalHours)*100,100).toFixed(0)}%` : "—"}
            </div>
            <div className="w-full bg-white/20 h-3 rounded mt-3 overflow-hidden">
              <div className="bg-purple-500 h-3" style={{ width: `${goalHours ? Math.min((totalThisWeek/goalHours)*100,100) : 0}%` }} />
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="text-sm text-gray-300 mb-1">Weekly Stars</div>
            <div className="text-yellow-400 text-2xl tracking-wider">
              {Array.from({length:7}).map((_,i)=> i < stars ? <span key={i}>★</span> : <span key={i} className="text-gray-600">☆</span>)}
            </div>
            <div className="text-xs text-gray-300 mt-2">{stars} / 7 stars</div>
          </div>

          <div className="mb-3">
            <h4 className="font-semibold mb-2">Subject Distribution (this week)</h4>
            <div style={{ width: "100%", height: 160 }}>
              <SubjectPie data={subjectThisWeek} />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Recent Weeks</h4>
            <div className="space-y-2 max-h-48 overflow-auto">
              {weekHistory.map((w,i) => (
                <div key={i} className="p-2 rounded bg-white/5 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{w.week}</div>
                    <div className="text-xs text-gray-300">Studied: {w.actualHours ?? "—"} hrs • Goal: {w.goalHours ?? "—"} hrs</div>
                  </div>
                  <div className="text-yellow-400 text-lg">
                    {Array.from({length:7}).map((_,j)=> j < (w.stars||0) ? <span key={j}>★</span> : <span key={j} className="text-gray-600">☆</span>)}
                  </div>
                </div>
              ))}
              {weekHistory.length === 0 && <div className="text-sm text-gray-300">No history yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
