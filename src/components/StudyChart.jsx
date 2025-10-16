import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function StudyChart({ data = [] }) {
  // recharts wants numeric hours
  const chartData = data.map(d => ({ name: d.day, hours: Number(d.hours || 0) }));
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis dataKey="name" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <defs>
            <linearGradient id="grad" x1="0" x2="1"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient>
          </defs>
          <Line type="monotone" dataKey="hours" stroke="url(#grad)" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
