// src/pages/Analysis.jsx
import React, { useEffect, useState, useMemo } from "react";
import { realtimeDB, ref, onValue } from "../firebase/config";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import StudyChart from "../components/StudyChart";
import SubjectPie from "../components/SubjectPie";

/*
Analysis page:
- compares this week vs last week per-subject
- lists top subjects and subjects that decreased
*/

function getISODateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0,10);
}

export default function Analysis() {
  const [user, setUser] = useState(null);
  const [sessionsObj, setSessionsObj] = useState({});

  useEffect(()=> {
    const unsub = onAuthStateChanged(auth, u=> setUser(u));
    return () => unsub();
  }, []);

  useEffect(()=> {
    if(!user) return;
    const sessionsRef = ref(realtimeDB, `sessions/${user.uid}`);
    const off = onValue(sessionsRef, snap => {
      setSessionsObj(snap.val() || {});
    });
    return () => off && off();
  }, [user]);

  const sessionsArray = useMemo(()=> Object.entries(sessionsObj).map(([id,s])=> ({id, ...s})), [sessionsObj]);

  // group by week: thisWeek (last 7 days), lastWeek (7-14 days ago)
  const comparison = useMemo(()=>{
    const thisWeekStart = getISODateNDaysAgo(6); // 6 days ago to today inclusive
    const lastWeekStart = getISODateNDaysAgo(13); // 13 days ago
    const thisWeekEnd = getISODateNDaysAgo(0); // today
    const lastWeekEnd = getISODateNDaysAgo(7);

    const totalsThis = {}; const totalsLast = {};
    sessionsArray.forEach(s => {
      if(!s.date) return;
      const date = s.date;
      // this week (date >= thisWeekStart)
      if (date >= thisWeekStart) {
        totalsThis[s.subject = s.subject || "Other"] = (totalsThis[s.subject] || 0) + Number(s.hours || 0);
      }
      // last week: date between lastWeekStart and lastWeekEnd
      if (date >= lastWeekStart && date <= lastWeekEnd) {
        totalsLast[s.subject = s.subject || "Other"] = (totalsLast[s.subject] || 0) + Number(s.hours || 0);
      }
    });

    // produce array of subjects present in either
    const subjects = Array.from(new Set([...Object.keys(totalsThis), ...Object.keys(totalsLast)]));

    const rows = subjects.map(sub => {
      const t = totalsThis[sub] || 0;
      const l = totalsLast[sub] || 0;
      const diff = t - l;
      const pct = l === 0 ? (t === 0 ? 0 : 100) : ((t - l)/l)*100;
      return { subject: sub, thisWeek: t, lastWeek: l, diff, pct };
    }).sort((a,b)=> b.thisWeek - a.thisWeek);

    return { totalsThis, totalsLast, rows };
  }, [sessionsArray]);

  const overallThis = useMemo(()=> Object.values(comparison.totalsThis || {}).reduce((a,b)=>a+b,0), [comparison]);
  const overallLast = useMemo(()=> Object.values(comparison.totalsLast || {}).reduce((a,b)=>a+b,0), [comparison]);

  // build suggestion list
  const suggestions = useMemo(()=> {
    const list = [];
    const rows = comparison.rows || [];
    rows.forEach(r => {
      if (r.thisWeek < r.lastWeek) {
        list.push(`You studied less ${r.subject} this week (${r.thisWeek}h) vs last week (${r.lastWeek}h). Consider revising it.`);
      } else if (r.thisWeek > r.lastWeek && r.lastWeek > 0) {
        list.push(`Good increase in ${r.subject}: ${r.lastWeek}h → ${r.thisWeek}h.`);
      }
    });
    if (!list.length) list.push("No major changes detected — keep it up!");
    return list;
  }, [comparison]);

  // pie data
  const pieData = useMemo(()=> {
    return Object.entries(comparison.totalsThis || {}).map(([name,value])=> ({ name, value }));
  }, [comparison]);

  return (
    <div className="container mx-auto text-white p-4">
      <h2 className="text-2xl font-bold mb-4">📈 Analysis</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-3">This week vs Last week</h3>
          <div className="text-sm text-gray-300 mb-2">Overall: {overallThis.toFixed(1)}h this week • {overallLast.toFixed(1)}h last week</div>
          <div className="space-y-2">
            {(comparison.rows || []).slice(0,6).map(r => (
              <div key={r.subject} className="p-2 rounded bg-white/5 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{r.subject}</div>
                  <div className="text-xs text-gray-300">{r.lastWeek}h → {r.thisWeek}h ({r.pct ? r.pct.toFixed(0) : 0}% change)</div>
                </div>
                <div className={`px-2 py-1 rounded text-sm ${r.diff>=0 ? "bg-green-500/20" : "bg-red-500/20"}`}>
                  {r.diff>=0 ? `+${r.diff.toFixed(1)}h` : `${r.diff.toFixed(1)}h`}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Subject Distribution (this week)</h3>
          <SubjectPie data={pieData} />
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-3">Smart Suggestions</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          {suggestions.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-3">Daily trend (last 7 days)</h3>
        <StudyChart data={(sessionsArray.length ? (() => {
          // generate daily hours for last 7 days
          const map = {};
          const arr = [];
          for (let i=6;i>=0;i--) {
            const d = new Date(); d.setDate(d.getDate()-i);
            const iso = d.toISOString().slice(0,10);
            const label = d.toLocaleDateString("en-US", { weekday: "short" });
            map[iso] = { date: iso, day: label, hrs: 0 };
            arr.push(map[iso]);
          }
          sessionsArray.forEach(s => { if(s.date && map[s.date]) map[s.date].hrs += Number(s.hours||0); });
          return arr;
        })() : [])} />
      </div>
    </div>
  );
}
